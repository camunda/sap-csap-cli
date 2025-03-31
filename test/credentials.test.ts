import {
  detectCredentials,
  getCredentials,
  getCredentialsFromEnv,
} from "../lib/credentials.ts"
import { assert, assertEquals } from "jsr:@std/assert"

Deno.test("detectCredentials should return true if all credentials are set in the environment", () => {
  const envVars = {
    CAMUNDA_CLUSTER_ID: "test-cluster-id",
    CAMUNDA_CLIENT_ID: "test-client-id",
    CAMUNDA_CLIENT_SECRET: "test-client-secret",
    CAMUNDA_CLUSTER_REGION: "test-region",
  }

  for (const [key, value] of Object.entries(envVars)) {
    Deno.env.set(key, value)
  }

  const result = detectCredentials()
  for (const key of Object.keys(envVars)) {
    Deno.env.delete(key)
  }

  assert(
    result,
    "detectCredentials did not return true when all credentials were set",
  )
})

Deno.test("getCredentialsFromEnv should return all credentials from the environment", () => {
  const envVars = {
    CAMUNDA_CLUSTER_ID: "test-cluster-id",
    CAMUNDA_CLIENT_ID: "test-client-id",
    CAMUNDA_CLIENT_SECRET: "test-client-secret",
    CAMUNDA_CLUSTER_REGION: "test-region",
  }

  for (const [key, value] of Object.entries(envVars)) {
    Deno.env.set(key, value)
  }

  const credentials = getCredentialsFromEnv()
  for (const key of Object.keys(envVars)) {
    Deno.env.delete(key)
  }

  assertEquals(credentials.CAMUNDA_CLUSTER_ID, envVars.CAMUNDA_CLUSTER_ID)
  assertEquals(credentials.CAMUNDA_CLIENT_ID, envVars.CAMUNDA_CLIENT_ID)
  assertEquals(credentials.CAMUNDA_CLIENT_SECRET, envVars.CAMUNDA_CLIENT_SECRET)
  assertEquals(
    credentials.CAMUNDA_CLUSTER_REGION,
    envVars.CAMUNDA_CLUSTER_REGION,
  )
})

Deno.test("getCredentials should return credentials from argv if provided and not prompt for missing values", async () => {
  const argv = {
    clusterId: "test-cluster-id",
    region: "test-region",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
  }

  const credentials = await getCredentials(argv)

  assertEquals(credentials.clusterId, argv.clusterId)
  assertEquals(credentials.region, argv.region)
  assertEquals(credentials.clientId, argv.clientId)
  assertEquals(credentials.clientSecret, argv.clientSecret)
})
