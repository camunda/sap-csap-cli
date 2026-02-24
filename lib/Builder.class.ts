import * as path from "jsr:@std/path"
import { parse, stringify } from "jsr:@std/yaml"
import { Kind } from "./common.ts"
import { CamundaCredentials } from "./credentials.ts"
export class Builder {
  for: {
    submodule: string // optional submodule for release tags, if multiple elements exist in one module (e.g. sap-connectors-odata, sap-connectors-rfc within sap-connectors)
    module: (typeof Kind)[keyof typeof Kind] //> e.g. "sap-connectors"
    semver: `${number}.${number}.${number}` //> integration module version
  }
  assetLocation: string
  credentials: CamundaCredentials

  constructor(
    module: (typeof Kind)[keyof typeof Kind], //> e.g. "sap-connectors"
    semver: `${number}.${number}.${number}`, //> integration module version
    assetLocation: string, //> where the assets have been downloaded to
    credentials: CamundaCredentials,
    submodule: string = "" // optional submodule, if multiple elements exist in one module (e.g. odata, rfc within sap-connectors)
  ) {
    this.for = {
      module,
      submodule,
      semver,
    }
    this.assetLocation = assetLocation
    this.credentials = credentials
  }

  assetList() {
    if (this.for.module !== Kind.btp) {
      const assetList = Deno.readDirSync(this.assetLocation)
      const assets = []
      for (const asset of assetList) {
        if (asset.isFile) {
          assets.push(asset.name)
        }
      }
      return assets.join(", ")
    } else {
      throw new Error("BTP module not supported yet")
    }
  }
  build() {
    if(this.for.module === Kind.odata && this.for.submodule === "odata") {
      return this.buildOData()
    }
    if(this.for.module === Kind.rfc && this.for.submodule === "rfc") {
      return this.buildRFC()
    }
  }

  private processMtadTemplate(
    replacements: Array<[string | RegExp, string]>
  ): void {
    const rawMtad = Deno.readTextFileSync(
      path.join(this.assetLocation, "mtad.yaml.example"),
    )

    let mangledMtad = rawMtad
    for (const [pattern, replacement] of replacements) {
      mangledMtad = mangledMtad.replaceAll(pattern, replacement)
    }

    const rawYaml = parse(mangledMtad)
    const mtad = stringify(rawYaml, { indent: 2 })
    Deno.writeTextFileSync(
      path.join(this.assetLocation, "mtad.yaml"),
      mtad,
    )
    Deno.removeSync(
      path.join(this.assetLocation, "mtad.yaml.example"),
    )
  }

  private buildRFC() {
    const replacements: Array<[string | RegExp, string]> = [
      ["<app-version>", this.for.semver],
      // to prevent
      // Error parsing xs-security.json data: Inconsistent xs-security.json: Invalid xsappname "...": May only include characters 'a'-'z', 'A'-'Z', '0'-'9', '_', '-', '\\', and '/'.)
      // at deploy-time
      ["<mangled-version>", this.for.semver.replaceAll(".", "_")],
      ["<your-cluster-id>", this.credentials.clusterId],
      ["<client-id-credential-from-api-client>", this.credentials.clientId],
      [
        "<client-secret-credential-from-api-client>",
        this.credentials.clientSecret,
      ],
      ["<your-cluster-region>", this.credentials.region],
    ]

    this.processMtadTemplate(replacements)
  }
  private buildOData() {
    const replacements: Array<[string | RegExp, string]> = [
      ["<app-version>", this.for.semver],
      [
        "name: sap-odata-connector",
        `name: sap-odata-connector-${this.for.semver}`,
      ],
      [
        /camunda\/sap-odata-connector:<pick.*>/g,
        `camunda/sap-odata-connector:${this.for.semver}`,
      ],
      ["<your-cluster-id>", this.credentials.clusterId],
      ["<client-id-credential-from-api-client>", this.credentials.clientId],
      [
        "<client-secret-credential-from-api-client>",
        this.credentials.clientSecret,
      ],
      ["<your-cluster-region>", this.credentials.region],
    ]

    this.processMtadTemplate(replacements)
  }
}
