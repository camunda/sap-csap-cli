import { Ask } from "@sallai/ask"
import { Args } from "@std/cli/parse-args"
const ask = new Ask()

const allCamundaCredentials = [
  "CAMUNDA_CLUSTER_ID",
  "CAMUNDA_CLIENT_ID",
  "CAMUNDA_CLIENT_SECRET",
  "CAMUNDA_CLUSTER_REGION",
]

export type CamundaCredentialsInEnv = {
  [key in typeof allCamundaCredentials[number]]: string
}
export type CamundaCredentials = {
  clusterId: string
  region: string
  clientId: string
  clientSecret: string
}

export function detectCredentials() {
  return allCamundaCredentials.every((key) => Deno.env.get(key) !== undefined)
}

export function getCredentialsFromEnv(): CamundaCredentialsInEnv {
  const credentials = allCamundaCredentials.reduce((acc, key) => {
    acc[key] = Deno.env.get(key)!
    return acc
  }, {} as CamundaCredentialsInEnv)
  return credentials
}

export async function getCredentials(argv: any) {
  const clusterId = argv.clusterId ||
    (await ask.input({
      name: "clusterId",
      message: "Camunda Cluster ID",
    })).clusterId
  const region = argv.region ||
    (await ask.input({
      name: "region",
      message: "Camunda ClusterRegion",
      default: "bru-2",
    })).region
  const clientId = argv.clientId ||
    (await ask.input({
      name: "clientId",
      message: "Camunda API Client - Client Id",
    })).clientId
  const clientSecret = argv.clientSecret ||
    (await ask.input({
      name: "clientSecret",
      message: "Camunda API Client - Client Secret",
    })).clientSecret

  return {
    clusterId,
    region,
    clientId,
    clientSecret,
  }
}
