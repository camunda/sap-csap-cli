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
import { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js"

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
    // this option is only relevant, when
    // the selected SAP integration module is "btp-plugin"
    const btpRoute = sapIntegrationModule === sapIntegrationModules.find(
        (m) => m.value === "btp-plugin",
      )?.value
      ? argv.btpRoute ||
        (await ask.input({
          name: "btpRoute",
          message:
            "BTP route to reach the plugin\n (host name only!, e.g. camunda-app)",
          validate: (input: string) => {
            if (input.includes("hana.ondemand")) {
              return false
            } else {
              return true
            }
          },
          default: "camunda-btp-plugin",
        })).btpRoute
      : "n/a"

    // credential logic
    // 1. cmd line > 2. env > 3. ask
    let clusterId, region, clientId, clientSecret
    if (
      argv.clusterId && argv.region && argv.clientId &&
      argv.clientSecret
    ) {
      ;({ clusterId, region, clientId, clientSecret } = argv)
    } else if (detectCredentials() === true) {
      ;({
        CAMUNDA_CLUSTER_ID: clusterId,
        CAMUNDA_CLUSTER_REGION: region,
        CAMUNDA_CLIENT_ID: clientId,
        CAMUNDA_CLIENT_SECRET: clientSecret,
      } = getCredentialsFromEnv())
      console.log("\ni Camunda API credentials found in environment:")
      const log = Object.entries(getCredentialsFromEnv()).reduce(
        (acc, [key, value]) => {
          acc[key] = "***" + value.slice(-3)
          return acc
        },
        {} as Record<string, string>,
      )
      console.table(log)
    } else {
      console.log("\ni No Camunda API credentials found in environment. Enter credentials manually")
      ;({ clusterId, region, clientId, clientSecret } = await getCredentials(
        argv,
      ))
    }
    const credentials = {
      clusterId,
      region,
      clientId,
      clientSecret,
    }

    switch (sapIntegrationModule) {
      case "btp-plugin":
        await btpPlugin({
          camundaVersion,
          camundaDeployment,
          credentials,
          btpRoute,
        })
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
