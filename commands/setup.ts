import { Ask } from "@sallai/ask"
const ask = new Ask()

import { btpPlugin } from "./modules/btp_plugin.ts"
import { odataConnector } from "./modules/odata_connector.ts"
import { rfcConnector } from "./modules/rfc_connector.ts"
import { camundaVersions, camundaDeploymentOptions, sapIntegrationModules } from "./modules/common.ts"
import { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js"



export const setupCommand = {
  command: "setup [for] [camunda] [deployment]",
  describe: "prepare one of Camunda's SAP Integration modules for deployment",
  builder: (yargs: YargsInstance) => {
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



    switch (sapIntegrationModule) {
      case "btp-plugin":
        await btpPlugin({ sapIntegrationModule, camundaVersion, camundaDeployment })
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
   
    console.log(
      `\n%c✔ Setup completed successfully`,
      "color: green",
    )
  },
}
