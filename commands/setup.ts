import { Ask } from "@sallai/ask"
const ask = new Ask()

import { btpPlugin } from "./modules/btp_plugin.ts"
import { odataConnector } from "./modules/odata_connector.ts"
import { rfcConnector } from "./modules/rfc_connector.ts"
import {
  camundaDeploymentOptions,
  camundaVersions,
  detectCredentials,
  getCredentials,
  getCredentialsFromEnv,
  sapIntegrationModules,
} from "./modules/common.ts"
import { setupHandler } from "./modules/setup-handler.ts"

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
          "BTP route to reach the plugin (host name only!, e.g. camunda-app)",
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
