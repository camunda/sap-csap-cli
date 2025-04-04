import * as path from "jsr:@std/path"
import { clone, isRepoModified } from "../../lib/common.ts"
import { CamundaCredentials } from "../../lib/credentials.ts"

export async function btpPlugin(
  { camundaVersion, camundaDeployment, credentials, btpRoute }: {
    camundaVersion: `${number}.${number}`
    camundaDeployment: string
    credentials: CamundaCredentials
    btpRoute: string
  },
) {
  const to = path.join(
    Deno.env.get("TMPDIR") || "/tmp",
    "camunda",
    camundaVersion,
    "sap-btp-plugin",
  )

  // check for
  // - existing target directory
  // - integrity of the repository
  // - previous build artifacts
  if (await Deno.stat(to).then(() => true).catch(() => false)) {
    console.log(`i target directory ${to} already exists`)
    console.log(`i checking repository integrity...`)
    if (await isRepoModified(to)) {
      console.log("! target directory is not clean - purging...")

      await purge(to)
      await _clone(to)
    } else if (await previousBuildExists(to)) {
      console.log(
        "! target directory contains previous build artifacts - purging...",
      )
      await purge(to)
      await _clone(to)
    } else {
      console.log("✓ repository integrity validated - continuing")
    }
  }

  await build({
    inDir: to,
    camundaDeployment,
    camundaVersion,
    credentials,
    btpRoute,
  })
}

async function purge(dir: string) {
  await Deno.remove(dir, { recursive: true })
  console.log(`✓ purged target directory ${dir}`)
  await Deno.mkdir(dir, { recursive: true })
}

async function _clone(to: string) {
  console.log(`i cloning SAP BTP Plugin repository...`)
  await clone("https://github.com/camunda/sap-btp-plugin", "main", to)
  console.log(`✓ cloned SAP BTP Plugin to ${to}`)
}

async function previousBuildExists(dir: string) {
  const mtaDir = path.join(dir, "mta_archives")
  const mtarFiles = []
  if (await Deno.stat(mtaDir).then(() => true).catch(() => false)) {
    for await (const entry of Deno.readDir(mtaDir)) {
      if (entry.isFile && entry.name.endsWith(".mtar")) {
        mtarFiles.push(entry.name)
      }
    }
  }
  if (mtarFiles.length > 0) {
    console.log("i detected previous build artifacts:", mtarFiles.join(", "))
  }

  let nodeInstall = false
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory && entry.name === "node_modules") {
      console.log("i detected node_modules directory")
      nodeInstall = true
    }
  }
  if (nodeInstall || mtarFiles.length > 0) {
    return true
  } else {
    return false
  }
}

async function build(
  { inDir, camundaDeployment, camundaVersion, credentials, btpRoute }: {
    inDir: string
    camundaVersion: `${number}.${number}`
    camundaDeployment: string
    credentials: CamundaCredentials
    btpRoute: string
  },
) {
  Deno.chdir(inDir)

  Deno.copyFileSync("./mta.yaml.example", "./mta.yaml")
  Deno.copyFileSync("./xs-security.json.example", "./xs-security.json")

  const btpPluginVersion = (await import(path.join(inDir, "package.json"), {
    with: { type: "json" },
  })).default.version

  console.log("i adjusting deployment and environment files...")
  injectVersion(camundaVersion, btpPluginVersion)
  injectRoute(btpRoute)
  injectCredentials(credentials)
  console.log("✓ adjusted mta.yaml and xs-security.json")

  console.log("i installing dependencies...")
  await prepBuild()
  console.log("✓ installed dependencies")

  console.log("i building backend and frontend...")
  await Promise.all([
    buildCore(), //> essentially cds build --for production
    buildApp(), //> this builds the library into the app for unified deployment
  ])
  console.log("✓ built backend and frontend")

  console.log("i optimizing deployment packages...")
  // ensure we're not vendoring too much
  // -> don't deploy node dev dependencies
  await Promise.all([
    rmDevDeps("router"),
    rmDevDeps("core"),
    rmDevDeps("fiori-app"),
  ])
  console.log("✓ optimized deployment packages")

  console.log("i building deployment archive...")
  // mtar build
  buildMbt()
  console.log("✓ built deployment archive")

  console.log("")
  console.log(
    `🛠️ successfully built BTP Plugin\n\tfor Camunda ${camundaDeployment} ${camundaVersion}\n\tin directory ${inDir}`,
  )
  console.log(
    `︙here's the deployment archive (.mtar): ${
      path.join(
        inDir,
        "mta_archives",
        `sap-btp-plugin-${btpPluginVersion}.mtar`,
      )
    }`,
  )
}

async function prepBuild() {
  const cmd = new Deno.Command("npm", {
    args: ["i"],
    stdout: "inherit",
    stderr: "inherit",
  })

  const status = await cmd.spawn().status
  if (!status.success) {
    console.error("Error installing dependencies")
    Deno.exit(1)
  }
}

function injectVersion(
  camundaVersion: `${number}.${number}`,
  btpPluginVersion: `${number}.${number}.${number}`,
) {
  const mangledVersion = camundaVersion.replace(/\./g, "_").substring(0, 3)
  _replace("./xs-security.json", "<app-version>", mangledVersion)
  _replace("./mta.yaml", "<app-version>", `${mangledVersion}`) //> we want to denote the compatible Camunda version here
  _replace("./mta.yaml", "<unique-app-version>", btpPluginVersion) //> this is an actual increment
}
function injectRoute(route: string) {
  // note: this is the full host name, including hana.ondemand.com
  _replace("./xs-security.json", "<btp-plugin-route>", route)
  _replace("./mta.yaml", "<btp-plugin-route>", route)
}
function injectCredentials(
  credentials: CamundaCredentials,
) {
  _replace("./mta.yaml", "<your-cluster-id>", credentials.clusterId)
  _replace("./mta.yaml", "<your-cluster-region>", credentials.region)
  _replace(
    "./mta.yaml",
    "<client-id-credential-from-api-client>",
    credentials.clientId,
  )
  _replace(
    "./mta.yaml",
    "<client-secret-credential-from-api-client>",
    credentials.clientSecret,
  )
}

function _replace(
  file: string,
  searchValue: string | RegExp,
  replaceValue: string,
) {
  const content = Deno.readTextFileSync(file)
  let newContent = ""
  if (typeof searchValue === "string") {
    newContent = content.replaceAll(searchValue, replaceValue)
  } else {
    newContent = content.replace(searchValue, replaceValue)
  }
  Deno.writeTextFileSync(file, newContent)
}

function buildCore() {
  const cmd = new Deno.Command("npm", {
    args: ["run", "build", "-w", "core"],
  })

  const { code, stderr, stdout } = cmd.outputSync()
  if (code !== 0) {
    console.error(
      "%c//> backend build error",
      "color:red",
      new TextDecoder().decode(stderr),
    )
    Deno.exit(code)
  } else {
    console.log(new TextDecoder().decode(stdout))
  }
}

function buildApp() {
  const cmd = new Deno.Command("npm", {
    args: ["run", "build", "-w", "fiori-app"],
  })
  const { code, stderr, stdout } = cmd.outputSync()
  if (code !== 0) {
    console.error(
      "%c//> frontend build error",
      "color:red",
      new TextDecoder().decode(stderr),
    )
    Deno.exit(code)
  } else {
    console.log(new TextDecoder().decode(stdout))
  }
}

function buildMbt() {
  const cmd = new Deno.Command("npx", {
    args: ["--yes", "mbt", "build"],
  })
  const { code, stderr, stdout } = cmd.outputSync()
  if (code !== 0) {
    console.error(
      "%c//> archive build error",
      "color:red",
      new TextDecoder().decode(stderr),
    )
    Deno.exit(code)
  } else {
    console.log(new TextDecoder().decode(stdout))
  }
}

function rmDevDeps(dir: string) {
  const packageJsonPath = `${dir}/package.json`
  const packageJsonBakPath = `${dir}/package.json.bak`
  const packageJson = JSON.parse(Deno.readTextFileSync(packageJsonPath))
  Deno.writeTextFileSync(
    packageJsonBakPath,
    JSON.stringify(packageJson, null, 2),
  )
  delete packageJson.devDependencies
  Deno.writeTextFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}
