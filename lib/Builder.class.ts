import * as path from "jsr:@std/path"
import { parse, stringify } from "jsr:@std/yaml"
import { Kind } from "./common.ts"
import { CamundaCredentials } from "./credentials.ts"
export class Builder {
  for: {
    module: (typeof Kind)[keyof typeof Kind] //> e.g. "sap-odata-connector"
    semver: `${number}.${number}.${number}` //> integration module version
  }
  assetLocation: string
  credentials: CamundaCredentials

  constructor(
    module: (typeof Kind)[keyof typeof Kind], //> e.g. "sap-odata-connector"
    semver: `${number}.${number}.${number}`, //> integration module version
    assetLocation: string, //> where the assets have been downloaded to
    credentials: CamundaCredentials,
  ) {
    this.for = {
      module,
      semver,
    }
    this.assetLocation = assetLocation
    this.credentials = credentials
  }

  async build() {
    if (this.for.module === Kind.odata) {
      return this.buildOData()
    }
    // if (this.for.module === Kind.rfc) {
    //   return this.buildRFC()
    // }
    // if (this.for.module === Kind.btp) {
    //   return this.buildBTP()
    // }
  }
  buildOData() {
    // we have to:
    // - parse the mtad.yaml.example file and save it as mtad.yaml
    const rawMtad = Deno.readTextFileSync(
      path.join(this.assetLocation, "mtad.yaml.example"),
    )
    const mangledMtad = rawMtad
      .replaceAll("<app-version>", this.for.semver)
      .replaceAll(
        "name: sap-odata-connector",
        `name: sap-odata-connector-${this.for.semver}`,
      )
      .replaceAll("<your-cluster-id>", this.credentials.clusterId)
      .replaceAll(
        "<client-id-credential-from-api-client>",
        this.credentials.clientId,
      )
      .replaceAll(
        "<client-secret-credential-from-api-client>",
        this.credentials.clientSecret,
      )
      .replaceAll("<your-cluster-region>", this.credentials.region)
      .replaceAll(
        /camunda\/sap-odata-connector:<pick.*>/g,
        `camunda/sap-odata-connector:${this.for.semver}`,
      )
    const rawYaml = parse(mangledMtad)
    const mtad = stringify(rawYaml, { indent: 2 })
    Deno.writeTextFileSync(
      path.join(this.assetLocation, "mtad.yaml"),
      mtad,
    )
  }
}
