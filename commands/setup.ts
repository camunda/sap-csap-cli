// import { prompt } from "../prompt.ts"

import { Ask } from "@sallai/ask"
const ask = new Ask() 

import { btpIntegration } from "./modules/btp_integration.ts"
import { odataConnector } from "./modules/odata_connector.ts"
import { rfcConnector } from "./modules/rfc_connector.ts"

const camundaVersions = [
  { message: "8.7", value: "8.7" },
  { message: "8.6", value: "8.6" },
  { message: "8.5", value: "8.5" },
]

const camundaDeploymentOptions = [
  { message: "SaaS", value: "SaaS" },
  { message: "Self Managed", value: "SM", disabled: true },
]

const sapIntegrationModules = [
  { message: "BTP integration", value: "BTP integration" },
  { message: "OData connector", value: "OData connector" },
  { message: "RFC connector", value: "RFC connector" },
]

export const setupCommand = {
  command: "setup <camunda> <deployment> <module>",
  describe: "prepare one of Camunda's SAP Integration modules for deployment",
  builder: (yargs) => {
    return yargs
      .positional("camunda", {
        alias: "c",
        type: "string",
        description: "Camunda version",
        choices: camundaVersions.map((v) => v.value),
      })
      .positional("deployment", {
        alias: "d",
        type: "string",
        description: "Camunda deployment option",
        // should be...
        // choices: camundaDeploymentOptions.map(d => d.value),
        // ...but isn't until SM is available in the SAP integration context
        choices: camundaDeploymentOptions.map((d) => d.value),
      })
      .positional("module", {
        alias: "m",
        type: "string",
        description: "SAP integration module",
        choices: sapIntegrationModules.map((m) => m.value),
      })
  },
  handler: async (argv) => {
    console.log("//> setupCommand.handler", argv)
    const camundaVersion = argv.camunda ||
      (await ask.select({
        name: "camunda",
        message: "Camunda version",
        default: camundaVersions[0].value,
        choices: camundaVersions,
      })).camunda //> b/c .select() returns an object like { $name: "8.7" }
    const camundaDeployment = argv.deployment ||
      (await ask.select({
        name: "deployment",
        message: "Deployment option",
        default: camundaDeploymentOptions[0].value,
        choices: camundaDeploymentOptions,
      })).deployment
    const sapIntegrationModule = argv.module ||
      (await ask.select({
        name: "module",
        message: "SAP integration module",
        default: sapIntegrationModules[1].value,
        choices: sapIntegrationModules,
      })).module

    console.log(`Selected Camunda version: ${camundaVersion}`)
    console.log(`Selected deployment option: ${camundaDeployment}`)
    console.log(`Selected SAP integration module: ${sapIntegrationModule}`)

    switch (sapIntegrationModule) {
      case "BTP integration":
        btpIntegration()
        break
      case "OData connector":
        odataConnector()
        break
      case "RFC connector":
        rfcConnector()
        break
      default:
        console.error("invalid SAP integration module selected")
        Deno.exit(1)
    }
  },
}
