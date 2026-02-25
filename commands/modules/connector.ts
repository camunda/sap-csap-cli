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
  console.log(`%c//> ${to} connector setup", "color:orange`)

  const connector = new Downloader(Kind.odata, camundaVersion, to, "odata")
  await connector.pullAssets()
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
