import { Spinner } from "@std/cli/unstable-spinner"
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

export const setupCommand = {
  command: "setup [for] [camunda] [deployment]",
  describe: "prepare one of Camunda's SAP Integration modules for deployment",
  builder: (yargs) => {
    return yargs
      .option("for", {
        type: "string",
        description: "SAP integration module",
        choices: sapIntegrationModules.map((m) => m.value),
      }).option("camunda", {
        type: "string",
        description: "Camunda version",
        choices: camundaVersions.map((v) => v.value),
      })
      .option("deployment", {
        type: "string",
        description: "Camunda deployment option",
        // should be...
        // choices: camundaDeploymentOptions.map(d => d.value),
        // ...but isn't until SM is available in the SAP integration context
        choices: camundaDeploymentOptions.map((d) => d.value),
      })
  },
  handler: async (argv) => {
    const sapIntegrationModule = argv.for ||
      (await ask.select({
        name: "for",
        message: "SAP integration module",
        default: sapIntegrationModules[1].value,
        // REVISIT: this has usability issues on smaller terminals
        // choices: sapIntegrationModules.map(m => ({ message: m.message + "\t" + m.description, value: m.value })),
        choices: sapIntegrationModules,
      })).for
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

    const spinner = new Spinner({ color: "yellow" })
    spinner.message = `Setting up ${
      sapIntegrationModules.find((m) => m.value === sapIntegrationModule)
        ?.message
    } for Camunda ${camundaVersion} ${camundaDeployment}...`
    spinner.start()

    switch (sapIntegrationModule) {
      case "btp-plugin":
        btpIntegration()
        break
      case "odata":
        odataConnector()
        break
      case "rfc":
        rfcConnector()
        break
      default:
        console.error("invalid SAP integration module selected")
        Deno.exit(1)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    spinner.stop()
    console.log(
      `\n%c✔ Setup completed successfully`,
      "color: green",
    )
  },
}
