import { GetResponseTypeFromEndpointMethod } from "npm:@octokit/types"
import { Octokit } from "https://esm.sh/octokit?dts"
import * as path from "jsr:@std/path"
import { Kind } from "./common.ts" // Import Kind from common.ts

const octokit = new Octokit({
  userAgent: "csap",
})

export class Downloader {
  to: string
  releases: Array<
    GetResponseTypeFromEndpointMethod<typeof octokit.request>["data"][number]
  > = []
  latestRelease:
    | GetResponseTypeFromEndpointMethod<
      typeof octokit.request
    >["data"][number]
    | null = null

  for: {
    module: (typeof Kind)[keyof typeof Kind] //> e.g. "sap-odata-connector"
    version: `${number}.${number}` //> c8 release, e.g. 8.7
  }
  dir: string | "" = ""

  constructor(
    module: (typeof Kind)[keyof typeof Kind], //> e.g. "sap-odata-connector"
    version: `${number}.${number}`, //> c8 release, e.g. 8.7
  ) {
    this.to = path.join(Deno.env.get("TMPDIR") || "/tmp", "camunda")
    this.for = {
      module,
      version,
    }
  }

  async getReleases() {
    const releases = await octokit.request(
      "GET /repos/{owner}/{repo}/releases",
      {
        owner: "camunda",
        repo: this.for.module,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    )
    this.releases = releases.data
    return this.releases
  }

  async getLatestRelease() {
    if (!this.releases.length) {
      await this.getReleases()
    }
    const _releases = this.releases.filter((release) => {
      const semver = release.name ? release.name : "0.0.0"
      const [major, minor] = semver.split(".").map(Number)
      const [targetMajor, targetMinor] = this.for.version.split(".").map(Number)

      return major === targetMajor && minor === targetMinor
    })

    _releases.sort((a, b) => {
      const semverA = a.name ? a.name : "0.0.0"
      const semverB = b.name ? b.name : "0.0.0"

      return semverA.localeCompare(semverB, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    })
    this.latestRelease = _releases.at(-1)
    return this.latestRelease
  }

  async pullAssets() {
    if (!this.latestRelease) {
      await this.getLatestRelease()
    }
    // <tmpdir>/camunda/8.6/sap-odata-connector/8.6.1/**/*
    const dir = path.join(
      this.to,
      this.for.version,
      this.for.module,
      this.latestRelease.name,
    )
    this.dir = dir
    for (const asset of this.latestRelease.assets) {
      console.log(`Downloading ${asset.name}...`)
      const response = await fetch(asset.url)

      if (!response.ok) {
        throw new Error(
          `Failed to download ${asset.name}: ${response.statusText}`,
        )
      }

      await Deno.mkdir(dir, { recursive: true })

      const filePath = path.join(dir, asset.name)
      const file = await Deno.open(filePath, { write: true, create: true })

      await response.body?.pipeTo(file.writable)
      console.log(`Downloaded ${asset.name} to ${filePath}`)
    }
  }
}
