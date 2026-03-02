import {
  assertArrayIncludes,
  assertGreaterOrEqual,
  assertInstanceOf,
  assertMatch,
  assertNotEquals,
  assertRejects,
  assertStringIncludes,
} from "jsr:@std/assert"
import { walk } from "jsr:@std/fs/walk"
import { Downloader } from "../lib/Downloader.class.ts"
import { Kind } from "../lib/common.ts"

async function captureStdout<T>(fn: () => T | Promise<T>): Promise<[T, string]> {
  const buffer: Uint8Array[] = []
  const originalWrite = Deno.stdout.write.bind(Deno.stdout)
  Deno.stdout.write = (data: Uint8Array) => {
    buffer.push(data)
    return Promise.resolve(data.length)
  }
  try {
    const result = await fn()
    const output = buffer.map((b) => new TextDecoder().decode(b)).join("")
    return [result, output]
  } finally {
    Deno.stdout.write = originalWrite
  }
}

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
  const downloader = new Downloader(Kind.rfc, "8.6", Deno.makeTempDirSync(), "rfc")
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
  const downloader = new Downloader(Kind.odata, "8.6", Deno.makeTempDirSync(), "odata")
  await downloader.pullAssets()
  const result = []
  for await (const dirEntry of walk(downloader.to)) {
    result.push(dirEntry.name)
  }
  assertGreaterOrEqual(result.length, 1)
  assertArrayIncludes(result, [downloader.for.module, downloader.for.version])
})

Deno.test("should print error, if no release found for given version", async () => {
  const downloader = new Downloader(Kind.odata, "0.0", Deno.makeTempDirSync(), "odata")

  const [_releases, output] = await captureStdout(async () => {
    return await assertRejects(
      async () => await downloader.getLatestRelease(),
      Error,
      "The requested odata-connector for version 0.0 is not supported"
    )
  })

  assertStringIncludes(
    output,
    "The requested odata-connector for version 0.0 is not supported",
  )
}) 