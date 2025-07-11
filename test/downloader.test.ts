import {
  assertArrayIncludes,
  assertGreaterOrEqual,
  assertInstanceOf,
  assertMatch,
  assertNotEquals,
} from "jsr:@std/assert"
import { walk } from "jsr:@std/fs/walk"
import { Downloader } from "../lib/Downloader.class.ts"
import { Kind } from "../lib/common.ts"

Deno.test("should return a list of releases", async () => {
  const releases = await new Downloader(
    Kind.odata,
    "8.6",
    Deno.makeTempDirSync(),
  )
    .getReleases()
  assertGreaterOrEqual(releases.length, 1)
})

Deno.test("should return the latest release", async () => {
  const downloader = new Downloader(Kind.rfc, "8.6", Deno.makeTempDirSync())
  const latestRelease = await downloader.getLatestRelease()
  await new Promise((resolve) => setTimeout(resolve, 100)) //> ...
  assertInstanceOf(latestRelease, Object)
  assertMatch(
    latestRelease.name,
    /8\.6\.\d+/,
  )
  assertNotEquals(
    latestRelease.name,
    "8.6.0",
  )
})

Deno.test("should download assets for a module", async () => {
  const downloader = new Downloader(Kind.odata, "8.6", Deno.makeTempDirSync())
  await downloader.pullAssets()
  const result = []
  for await (const dirEntry of walk(downloader.to)) {
    result.push(dirEntry.name)
  }
  assertGreaterOrEqual(result.length, 1)
  assertArrayIncludes(result, [downloader.for.module, downloader.for.version])
})
