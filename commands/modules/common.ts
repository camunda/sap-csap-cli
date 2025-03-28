import { Spinner } from "@std/cli/unstable-spinner"
import { createHash } from "https://deno.land/std@0.203.0/hash/mod.ts"
import process from "node:process"

export function progress() {
  const spinner = new Spinner({ color: "yellow" })
  spinner.message = "Setting up csap ..."
  const originalStop = spinner.stop
  const _stop = () => {
    originalStop.call(spinner)
    // hacky hacksor to remove the "setting up csap ..." message
    process.stdout.moveCursor(0, -1)
    process.stdout.clearLine(1)
  }
  spinner.stop = _stop
  return spinner
}

export function step(message: string) {
  //   const spinner = new Spinner({ spinner: ["i","-","¡","-"]  })
  const spinner = new Spinner()
  spinner.message = message
  return spinner
}

export const camundaVersions = [
  { message: "8.7", value: "8.7" },
  { message: "8.6", value: "8.6" },
  { message: "8.5", value: "8.5" },
]
export type cVersion = typeof camundaVersions[number]

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

export async function compareFilesBySha256(
  filePath1: string,
  filePath2: string,
): Promise<boolean> {
  const hashFile = async (filePath: string): Promise<string> => {
    const fileContent = await Deno.readFile(filePath)
    const hash = createHash("sha256")
    hash.update(fileContent)
    return hash.toString()
  }

  const [hash1, hash2] = await Promise.all([
    hashFile(filePath1),
    hashFile(filePath2),
  ])
  return hash1 === hash2
}

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

export async function clone(repo: string, branch: string, to: string) {
  const process = new Deno.Command("git", {
    args: ["clone", "--branch", branch, repo, to],
    stdout: "piped",
    stderr: "piped",
  })

  const { stdout, stderr } = await process.output()

  if (stderr.length > 0) {
    console.error(new TextDecoder().decode(stderr))
    return null
  }

  return new TextDecoder().decode(stdout)
}
