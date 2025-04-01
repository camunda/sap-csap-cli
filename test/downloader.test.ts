import {
    assertGreaterOrEqual,
    assertInstanceOf,
    assertMatch,
    assertNotEquals
} from "jsr:@std/assert"
import { Downloader } from "../lib/Downloader.class.ts"

Deno.test("should return a list of releases", async () => {
  const releases = await new Downloader(Downloader.Kind.odata, "8.6")
    .getReleases()
  assertGreaterOrEqual(releases.length, 1)
})

Deno.test("should return the latest release", async () => {
  const downloader = new Downloader(Downloader.Kind.rfc, "8.6")
  const latestRelease = await downloader.getLatestRelease()
  assertInstanceOf(latestRelease, Object)
  assertMatch(
    latestRelease.name,
    /8\.6\.\d+/,
  )
  assertNotEquals(
    latestRelease.name,
    "8.6.0",
  )
  console.log(latestRelease)
})
