import { assertEquals } from "jsr:@std/assert"
import { Builder } from "../lib/Builder.class.ts"
import { join } from "jsr:@std/path"
import { Kind } from "../lib/common.ts"

Deno.test("should correctly build for sap-connectors for odata/rfc", async () => {
  for (const submodule of ["odata", "rfc"]) {
    // get versions from test assets by reading the directory names
    const assetDir = join(
      Deno.cwd(),
      "test",
      "__assets__",
      `sap-${submodule}-connector`,
    )
    const versions: string[] = []
    for (const entry of Deno.readDirSync(assetDir)) {
      if (entry.isDirectory) {
        versions.push(entry.name)
      }
    }
    for (const version of versions) {
      const assetLocation = join(assetDir, version)
      const credentials = {
        clusterId: "xxx",
        clientId: "yyy",
        clientSecret: "zzz",
        region: "bru-2",
      }

      const builder = new Builder(Kind.odata, version as `${number}.${number}.${number}`, assetLocation, credentials, submodule)
      await builder.build()

      const expectedContent = await Deno.readTextFile(
        join(assetLocation, "mtad.yaml.expected"),
      )
      const generatedContent = await Deno.readTextFile(
        join(assetLocation, "mtad.yaml"),
      )
      assertEquals(generatedContent, expectedContent, `Generated mtad.yaml does not match expected content for ${submodule} ${version}`)

      await Deno.remove(join(assetLocation, "mtad.yaml"))
    }
  }
})
