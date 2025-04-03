import { assertEquals } from "jsr:@std/assert"
import { Builder } from "../lib/Builder.class.ts"
import { join } from "jsr:@std/path"
import { Kind } from "../lib/common.ts"

Deno.test("Builder should correctly build for sap-odata-connector 8.6.1", async () => {
  const assetLocation = join(
    Deno.cwd(),
    "test",
    "__assets__",
    Kind.odata,
    "8.6.1",
  )
  const credentials = {
    clusterId: "xxx",
    clientId: "yyy",
    clientSecret: "zzz",
    region: "bru-2",
  }

  const builder = new Builder(Kind.odata, "8.6.1", assetLocation, credentials)
  await builder.build()

  const expectedContent = await Deno.readTextFile(
    join(assetLocation, "mtad.yaml.expected"),
  )
  const generatedContent = await Deno.readTextFile(
    join(assetLocation, "mtad.yaml"),
  )
  assertEquals(generatedContent, expectedContent)

  await Deno.remove(join(assetLocation, "mtad.yaml"))
})
