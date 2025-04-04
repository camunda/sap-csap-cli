import { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js"
import {
  camundaDeploymentOptions,
  camundaVersions,
  sapIntegrationModules,
} from "../lib/common.ts"
import { setupHandler } from "./setup-handler.ts"

export const setupCommand = {
  command:
    "setup [for] [camunda] [deployment] [clusterId] [clientId] [clientSecret] [region] [btpRoute]",
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
      .option("btpRoute", {
        type: "string",
        description:
          "(only for 'btp-plugin') BTP route to reach the plugin",
      })
      .option("clusterId", {
        type: "string",
        description: "Camunda Cluster ID",
      })
      .option("region", {
        type: "string",
        description: "Camunda Cluster Region",
      })
      .option("clientId", {
        type: "string",
        description: "Camunda API Client: OAuth2 client Id",
      })
      .option("clientSecret", {
        type: "string",
        description: "Camunda API Client: OAuth2 client secret",
      })
  },
  handler: setupHandler,
}
