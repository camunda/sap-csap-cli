import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert"
import { join } from "jsr:@std/path"
import { createBuildDir } from "../commands/modules/createBuildDir.ts"

const VERSIONS = ["8.7", "8.6", "8.5"]
const ROUTE = "my-route.example.org"
const CLUSTER_ID = "my-cluster-id"
const REGION = "region-1"
const CLIENT_ID = "abcdefg"
const CLIENT_SECRET = "qwerty"

Deno.test({
  name:
    "BTP Plugin setup: cli runs and creates .mtar archive for each Camunda version" +
    VERSIONS.join(", "),
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    for (const version of VERSIONS) {
      const buildDir = await Deno.makeTempDir({ prefix: "csap-test-custom-" })
      const cmd = [
        "deno",
        "run",
        "-A",
        "cli.ts",
        "setup",
        "--for",
        "btp-plugin",
        "--deployment",
        "SaaS",
        "--camunda",
        version,
        "--btpRoute",
        ROUTE,
        "--clusterId",
        CLUSTER_ID,
        "--region",
        REGION,
        "--clientId",
        CLIENT_ID,
        "--clientSecret",
        CLIENT_SECRET,
        "--to",
        buildDir,
      ]
      const process = new Deno.Command(cmd[0], {
        args: cmd.slice(1),
        stdout: "piped",
        stderr: "piped",
      })
      const { code, stdout, stderr } = await process.output()
      const out = new TextDecoder().decode(stdout)
      const err = new TextDecoder().decode(stderr)
      assertEquals(
        code,
        0,
        `cli exited with code ${code}.\nstdout: ${out}\nstderr: ${err}`,
      )

      // assert after build for an *.mtar file in the build directory
      const mtaArchives = join(buildDir, "sap-btp-plugin", "mta_archives")
      let foundMtar = false
      for await (const entry of Deno.readDir(mtaArchives)) {
        if (entry.isFile && entry.name.endsWith(".mtar")) {
          foundMtar = true
          break
        }
      }
      assert(foundMtar, `No .mtar file found in ${mtaArchives}`)
    }
  },
})

for (const version of VERSIONS) {
  const buildDir = createBuildDir(version)
  Deno.test(`mta.yaml contains correct route and credentials for version ${version}`, async () => {
    const mtaYaml = await Deno.readTextFile(
      join(buildDir, "sap-btp-plugin", "mta.yaml"),
    )
    assertStringIncludes(mtaYaml, ROUTE)
    assertStringIncludes(mtaYaml, CLUSTER_ID)
    assertStringIncludes(mtaYaml, REGION)
    assertStringIncludes(mtaYaml, CLIENT_ID)
    assertStringIncludes(mtaYaml, CLIENT_SECRET)
  })
  Deno.test(`xs-security.json contains mangled version for version ${version}`, async () => {
    const xsSec = await Deno.readTextFile(
      join(buildDir, "sap-btp-plugin", "xs-security.json"),
    )
    const mangled = version.replace(".", "_")
    assertStringIncludes(xsSec, mangled)
  })
}
