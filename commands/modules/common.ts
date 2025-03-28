import { Spinner } from "@std/cli/unstable-spinner"
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
