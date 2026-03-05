import { Builder } from "../../lib/Builder.class.ts"
import { Kind } from "../../lib/common.ts"
import { CamundaCredentials } from "../../lib/credentials.ts"
import { Downloader } from "../../lib/Downloader.class.ts"

export async function connector(
  { camundaVersion, camundaDeployment, credentials, to }: {
    camundaVersion: `${number}.${number}`
    camundaDeployment: string
    credentials: CamundaCredentials
    to: string
    submodule?: string
  },
) {
  console.log("")

  const connector = new Downloader(Kind.odata, camundaVersion, to, "odata")
  try {
    await connector.pullAssets()
  } catch (_error) {
    console.error(`x failed to download assets for OData connector for Camunda ${camundaVersion} from GitHub. Please check if version ${camundaVersion} exists and if your GH_TOKEN is correct.`)
    Deno.exit(1)
    return
  }
  const downloadDir = connector.dir
  const latestRelease = await connector.getLatestRelease()

  const connectorBuilder = new Builder(
    Kind.odata,
    latestRelease.name,
    downloadDir,
    credentials,
  )
  connectorBuilder.build()

  console.log("")
  console.log(
    `🛠️ successfully built OData connector ${latestRelease.name}\n\tfor Camunda ${camundaDeployment} ${camundaVersion}\n\tin directory ${downloadDir}`,
  )
  console.log(`︙here's the file listing: ${connectorBuilder.assetList()}`)
}
