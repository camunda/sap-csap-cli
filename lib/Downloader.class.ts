import { GetResponseTypeFromEndpointMethod } from "npm:@octokit/types"
import { Octokit } from "https://esm.sh/octokit?dts"

const octokit = new Octokit({
  userAgent: "csap",
})

export class Downloader {
  private to: string
  public static Kind = {
    odata: "sap-odata-connector",
    rfc: "sap-rfc-connector",
    btp: "sap-btp-plugin",
  } as const
  releases: Array<
    GetResponseTypeFromEndpointMethod<typeof octokit.request>["data"][number]
  > = []
  for: {
    module: (typeof Downloader.Kind)[keyof typeof Downloader.Kind]
    version: `${number}.${number}`
  }

  constructor(
    module: (typeof Downloader.Kind)[keyof typeof Downloader.Kind],
    version: `${number}.${number}`, //> c8 release, e.g. 8.7
  ) {
    this.to = `${Deno.env.get("TMPDIR") || "/tmp"}/camunda`
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
    const latestRelease = _releases.at(-1)
    return latestRelease
  }
}
