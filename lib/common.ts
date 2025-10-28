import { Spinner } from "@std/cli/unstable-spinner"

// export function progress() {
//   const spinner = new Spinner({ color: "yellow" })
//   spinner.message = "Setting up csap ..."
//   const originalStop = spinner.stop
//   const _stop = () => {
//     originalStop.call(spinner)
//     // hacky hacksor to remove the "setting up csap ..." message
//     process.stdout.moveCursor(0, -1)
//     process.stdout.clearLine(1)
//   }
//   spinner.stop = _stop
//   return spinner
// }

export function step(message: string) {
  //   const spinner = new Spinner({ spinner: ["i","-","¡","-"]  })
  const spinner = new Spinner()
  spinner.message = message
  return spinner
}

export const camundaVersions = [
  { message: "8.8", value: "8.8" },
  { message: "8.7", value: "8.7" },
  { message: "8.6", value: "8.6" },
]

export const camundaDeploymentOptions = [
  { message: "SaaS", value: "SaaS" },
  { message: "Self Managed", value: "SM", disabled: true },
]
export type deploymentOption = typeof camundaDeploymentOptions[number]

export const sapIntegrationModules = [
  {
    message: "BTP plugin",
    value: "btp-plugin",
    description: "Render tasks forms in Fiori, provide BTP integration",
  },
  {
    message: "OData connector",
    value: "odata",
    description: "Interact with S/4HANA or ECC System from a BPMN model",
  },
  {
    message: "RFC connector",
    value: "rfc",
    description: "\tQuery BAPIs & Remote Function Modules on SAP ECC systems",
  },
  {
    message: "All modules",
    value: "all",
    description: "Configure all modules",
  },
]
export type integrationModule = typeof sapIntegrationModules[number]

// mainly for Downloader and Builder
export const Kind = {
  odata: "sap-odata-connector",
  rfc: "sap-rfc-connector",
  btp: "sap-btp-plugin",
} as const

export async function getGitCommitHash(
  directory: string,
): Promise<string | null> {
  try {
    const process = new Deno.Command("git", {
      args: ["-C", directory, "rev-parse", "HEAD"],
      stdout: "piped",
      stderr: "piped",
    })

    const { stdout, stderr } = await process.output()

    console.log("getCommitHash stdout", new TextDecoder().decode(stdout))
    console.log("getCommitHash stderr", new TextDecoder().decode(stderr))

    if (stderr.length > 0) {
      console.error(new TextDecoder().decode(stderr))
      return null
    }

    return new TextDecoder().decode(stdout).trim()
  } catch (err) {
    console.error("Error retrieving git commit hash:", err)
    return null
  }
}
export async function isRepoModified(
  directory: string,
): Promise<boolean> {
  try {
    const statusProcess = new Deno.Command("git", {
      args: ["-C", directory, "status", "--porcelain"],
    })

    const { stdout, stderr } = await statusProcess.output()

    if (stderr.length > 0) {
      console.error(new TextDecoder().decode(stderr))
      return true
    }

    const output = new TextDecoder().decode(stdout).trim()

    // Parse the output to find deleted files
    const deletedFiles = output
      .split("\n")
      .filter((line) => line.startsWith("D") || line.startsWith("M"))
      .map((line) => line.slice(2).trim())

    if (deletedFiles.length > 0) {
      console.log(
        "! detected local git repository modifications:",
        deletedFiles.join(", "),
      )
    }
    return deletedFiles.length > 0
  } catch (error) {
    console.error("Error detecting local deletions:", error)
    return true
  }
}

export async function compareBranchIntegrity(
  directory: string,
  branch: string,
): Promise<boolean> {
  try {
    const fetchProcess = new Deno.Command("git", {
      args: ["-C", directory, "fetch", "--quiet", "origin", branch],
      stdout: "piped",
      stderr: "piped",
    })
    const fetchResult = await fetchProcess.output()

    if (fetchResult.stderr.length > 0) {
      console.error(new TextDecoder().decode(fetchResult.stderr))
      return false
    }

    const localHashProcess = new Deno.Command("git", {
      args: ["-C", directory, "rev-parse", branch],
      stdout: "piped",
      stderr: "piped",
    })
    const localHashResult = await localHashProcess.output()

    if (localHashResult.stderr.length > 0) {
      console.error(new TextDecoder().decode(localHashResult.stderr))
      return false
    }
    const localHash = new TextDecoder().decode(localHashResult.stdout).trim()

    const remoteHashProcess = new Deno.Command("git", {
      args: ["-C", directory, "rev-parse", `origin/${branch}`],
      stdout: "piped",
      stderr: "piped",
    })
    const remoteHashResult = await remoteHashProcess.output()

    if (remoteHashResult.stderr.length > 0) {
      console.error(new TextDecoder().decode(remoteHashResult.stderr))
      return false
    }
    const remoteHash = new TextDecoder().decode(remoteHashResult.stdout).trim()

    return localHash === remoteHash
  } catch (error) {
    console.error("Error comparing branch integrity:", error)
    return false
  }
}

export async function clone(
  repo: string,
  branch: string,
  to: string,
): Promise<boolean> {
  try {
    const process = new Deno.Command("git", {
      args: ["clone", "--branch", branch, repo, to],
      stdout: "inherit",
      stderr: "inherit",
    })

    const status = await process.spawn().status

    return status.success
  } catch (error) {
    console.error("Git clone operation failed:", error)
    return false
  }
}
