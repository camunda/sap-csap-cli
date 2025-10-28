import { Octokit } from "https://esm.sh/octokit?dts"
import { basename, join } from "jsr:@std/path"
import { GetResponseTypeFromEndpointMethod } from "npm:@octokit/types"
import { Kind } from "./common.ts"; 

const octokit = new Octokit({
  userAgent: "csap",
  auth: Deno.env.get("GH_TOKEN")
})

export class Downloader {
  to: string
  releases: Array<GetResponseTypeFromEndpointMethod<typeof octokit.request>["data"][number]> = []
  latestRelease: GetResponseTypeFromEndpointMethod<typeof octokit.request>["data"][number] | null = null

  for: {
    module: (typeof Kind)[keyof typeof Kind] //> e.g. "sap-odata-connector"
    version: `${number}.${number}` //> c8 release, e.g. 8.7
  }
  dir: string | "" = ""

  constructor(
    module: (typeof Kind)[keyof typeof Kind], //> e.g. "sap-odata-connector"
    version: `${number}.${number}`, //> c8 release, e.g. 8.7
    to: string //> target directory
  ) {
    this.to = to
    if (version === "8.8" && (module === Kind.odata || module === Kind.rfc)) {
      const msg =
        "! RFC- and OData-connector are currently only available for Camunda <= 8.7...\n! 8.8 support coming soon!"
      console.log(`%c${msg}`, "color:red")
      Deno.exit(1)
    }
    this.for = {
      module,
      version
    }
  }

  async getReleases() {
    Deno.stdout.write(new TextEncoder().encode("i fetching releases...\n"))
    const releases = await octokit.request("GET /repos/{owner}/{repo}/releases", {
      owner: "camunda",
      repo: this.for.module,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    })
    this.releases = releases.data
    Deno.stdout.write(new TextEncoder().encode(`✓ fetched releases: ${this.releases.length}\n`))
    return this.releases
  }

  async getLatestRelease() {
    if (!this.releases.length) {
      await this.getReleases()
    }
    Deno.stdout.write(new TextEncoder().encode("i determining latest release...\n"))
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
        sensitivity: "base"
      })
    })
    this.latestRelease = _releases.at(-1)
    Deno.stdout.write(new TextEncoder().encode(`✓ latest release: ${this.latestRelease.name}\n`))
    return this.latestRelease
  }

  private async showProgress(
    response: Response,
    filePath: string,
    asset: (typeof this.latestRelease)["assets"][number]
  ) {
    const contentLength = Number(response.headers.get("content-length") || 0)
    const file = await Deno.open(filePath, { write: true, create: true })
    const writable = file.writable.getWriter()
    const reader = response.body?.getReader()

    if (!reader) {
      throw new Error("Failed to read response body")
    }

    const kb = (asset.size / 1024).toFixed(2)
    let received = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        console.log("")
        break
      }

      await writable.write(value)
      received += value.length

      const progress = ((received / contentLength) * 100).toFixed(2)
      Deno.stdout.write(new TextEncoder().encode(`\r⇣ Downloading ${asset.name}... (${kb} KB): ${progress}%`))
    }

    writable.close()
  }

  private async fileExists(filePath: string, asset: (typeof this.latestRelease)["assets"][number]): Promise<boolean> {
    try {
      const fileInfo = await Deno.stat(filePath)
      if (fileInfo.size === asset.size) {
        Deno.stdout.write(
          new TextEncoder().encode(`i File already exists: ${basename(filePath)} - skipping download\n`)
        )
        return true
      } else {
        Deno.stdout.write(
          new TextEncoder().encode(
            `i File exists but size mismatch: ${filePath} (expected: ${asset.size}, actual: ${fileInfo.size}) - re-downloading\n`
          )
        )
        return false
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false
      } else {
        throw error
      }
    }
  }

  private async downloadAsset(asset: (typeof this.latestRelease)["assets"][number], dir: string): Promise<void> {
    const filePath = join(dir, asset.name)
    const response = await fetch(asset.browser_download_url)

    if (!response.ok) {
      throw new Error(`Failed to download ${asset.name}: ${response.statusText}`)
    }

    await this.showProgress(response, filePath, asset)
  }

  async pullAssets() {
    if (!this.latestRelease) {
      await this.getLatestRelease()
    }
    // <tmpdir>/camunda/8.6/sap-odata-connector/8.6.1/**/*
    const dir = join(this.to, this.for.version, this.for.module, this.latestRelease.name)
    this.dir = dir

    await Deno.mkdir(dir, { recursive: true })
    Deno.stdout.write(new TextEncoder().encode(`i starting download of ${this.latestRelease.assets.length} assets\n`))
    for (const asset of this.latestRelease.assets) {
      const filePath = join(dir, asset.name)
      if (await this.fileExists(filePath, asset)) continue
      await this.downloadAsset(asset, dir)
    }
  }
}
