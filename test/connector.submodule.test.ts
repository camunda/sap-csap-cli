import { assert } from "jsr:@std/assert"
import { stub } from "jsr:@std/testing/mock"
import { connector } from "../commands/modules/connector.ts"
import { Builder } from "../lib/Builder.class.ts"

const mockCredentials = {
  clusterId: "test-cluster-id",
  region: "bru-2",
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
}

Deno.test("connector downloads assets for odata submodule", async () => {
  const tmp = Deno.makeTempDirSync()
  const buildStub = stub(Builder.prototype, "build", () => {})
  try {
    await connector({
      camundaVersion: "8.8",
      camundaDeployment: "SaaS",
      credentials: mockCredentials,
      to: tmp,
      submodule: "odata",
    })

    const base = `${tmp}/8.8/sap-connectors`
    const baseExists = await Deno.stat(base).then(() => true).catch(() => false)
    assert(baseExists)

    // ensure at least one release directory was created
    let found = false
    for await (const entry of Deno.readDir(base)) {
      if (entry.isDirectory) {
        found = true
        break
      }
    }
    assert(found)
  } finally {
    buildStub.restore()
  }
})

Deno.test("connector downloads assets for rfc submodule", async () => {
  const tmp = Deno.makeTempDirSync()
  const buildStub = stub(Builder.prototype, "build", () => {})
  try {
    await connector({
      camundaVersion: "8.8",
      camundaDeployment: "SaaS",
      credentials: mockCredentials,
      to: tmp,
      submodule: "rfc",
    })

    const base = `${tmp}/8.8/sap-connectors`
    const baseExists = await Deno.stat(base).then(() => true).catch(() => false)
    assert(baseExists)

    let found = false
    for await (const entry of Deno.readDir(base)) {
      if (entry.isDirectory) {
        found = true
        break
      }
    }
    assert(found)
  } finally {
    buildStub.restore()
  }
})
