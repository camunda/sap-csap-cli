import { Ask } from "@sallai/ask"
const ask = new Ask()

import {
  camundaDeploymentOptions,
  camundaVersions,
  sapIntegrationModules,
} from "../lib/common.ts"
import {
  detectCredentials,
  getCredentials,
  getCredentialsFromEnv,
} from "../lib/credentials.ts"
import { createBuildDir } from "./modules/createBuildDir.ts"
import { btpPlugin } from "./modules/btp_plugin.ts"
import { odataConnector } from "./modules/odata_connector.ts"
import { rfcConnector } from "./modules/rfc_connector.ts"

export async function setupHandler(argv: any) {
  const sapIntegrationModule = argv.for ||
    (await ask.select({
      name: "for",
      message: "SAP integration module",
      default: sapIntegrationModules[1].value,
      choices: sapIntegrationModules,
    })).for
  const camundaVersion = argv.camunda ||
    (await ask.select({
      name: "camunda",
      message: "Camunda version",
      default: camundaVersions[0].value,
      choices: camundaVersions,
    })).camunda
  const camundaDeployment = argv.deployment ||
    (await ask.select({
      name: "deployment",
      message: "Deployment option",
      default: camundaDeploymentOptions[0].value,
      choices: camundaDeploymentOptions,
    })).deployment
  const btpRoute = ["btp-plugin", "all"].includes(sapIntegrationModule)
    ? argv.btpRoute ||
    (await ask.input({
      name: "btpRoute",
      message:
        "BTP route to reach the plugin\n (without http(s):// and trailing /)",
      validate: (input?: string) => {
        if (input?.endsWith("/") || input?.startsWith("http")) {
          return false
        } else {
          return true
        }
      },
      default: "camunda-btp-plugin.cfapps.eu10-004.hana.ondemand.com",
    })).btpRoute
    : "n/a"

    
  const btpPluginBranch = ["btp-plugin", "all"].includes(sapIntegrationModule)
    ? argv.btpPluginBranch ||
    (await ask.input({
      name: "btpPluginBranch",
      message:
        "branch to clone the btp plugin from (defaults to 'main')",
      default: "main",
    })).btpPluginBranch
    : "n/a"

  const to = argv.to ||
    (await ask.input({
      name: "to",
      message: "Target directory for setup artifacts",
      default: createBuildDir(camundaVersion),
    })).to

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
    console.log("\ni Camunda API credentials found in environment. Reusing")
    const log = Object.entries(getCredentialsFromEnv()).reduce(
      (acc, [key, value]) => {
        acc[key] = "***" + value.slice(-3)
        return acc
      },
      {} as Record<string, string>,
    )
    console.table(log)
  } else {
    console.log(
      "\ni No Camunda API credentials found in environment. Enter credentials manually",
    )
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
    case "all": {
      const options = {
        camundaVersion,
        camundaDeployment,
        credentials,
        to,
      }
      await odataConnector(options)
      await rfcConnector(options)
      await btpPlugin({
        btpRoute,
        btpPluginBranch,
        ...options,
      })
      break
    }
    case "btp-plugin":
      await btpPlugin({
        camundaVersion,
        camundaDeployment,
        credentials,
        btpRoute,
        to,
        btpPluginBranch,
      })
      break
    case "odata":
      await odataConnector({
        camundaVersion,
        camundaDeployment,
        credentials,
        to,
      })
      break
    case "rfc":
      await rfcConnector({
        camundaVersion,
        camundaDeployment,
        credentials,
        to,
      })
      break
    default:
      console.error("invalid SAP integration module selected")
      Deno.exit(1)
  }

  console.log(
    `\n%c✔ Setup completed successfully`,
    "color: green",
  )

  Deno.exit(0)
}
