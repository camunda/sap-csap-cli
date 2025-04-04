import { Builder } from "../../lib/Builder.class.ts"
import { Kind } from "../../lib/common.ts"
import { CamundaCredentials } from "../../lib/credentials.ts"
import { Downloader } from "../../lib/Downloader.class.ts"

export async function odataConnector(
  { camundaVersion, camundaDeployment, credentials }: {
    camundaVersion: `${number}.${number}`
    camundaDeployment: string
    credentials: CamundaCredentials
  },
) {
  const odataConnector = new Downloader(Kind.odata, camundaVersion)
  await odataConnector.pullAssets()
  const downloadDir = odataConnector.dir
  const latestRelease = await odataConnector.getLatestRelease()

  const odataConnectorBuilder = new Builder(
    Kind.odata,
    latestRelease.name,
    downloadDir,
    credentials,
  )
  odataConnectorBuilder.build()

  console.log("")
  console.log(
    `🛠️ successfully built OData connector ${latestRelease.name}\n\tfor Camunda ${camundaDeployment} ${camundaVersion}\n\tin directory ${downloadDir}`,
  )
  console.log(`︙here's the file listing: ${odataConnectorBuilder.assetList()}`)
}
