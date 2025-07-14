import { Builder } from "../../lib/Builder.class.ts"
import { Kind } from "../../lib/common.ts"
import { CamundaCredentials } from "../../lib/credentials.ts"
import { Downloader } from "../../lib/Downloader.class.ts"

export async function rfcConnector(
  { camundaVersion, camundaDeployment, credentials, to }: {
    camundaVersion: `${number}.${number}`
    camundaDeployment: string
    credentials: CamundaCredentials
    to: string
  },
) {
  console.log("")
  console.log("%c//> RFC connector setup", "color:orange")

  const rfcConnector = new Downloader(Kind.rfc, camundaVersion, to)
  await rfcConnector.pullAssets()
  const downloadDir = rfcConnector.dir
  const latestRelease = await rfcConnector.getLatestRelease()

  const rfcConnectorBuilder = new Builder(
    Kind.rfc,
    latestRelease.name,
    downloadDir,
    credentials,
  )
  rfcConnectorBuilder.build()

  console.log("")
  console.log(
    `🛠️ successfully built RFC connector ${latestRelease.name}\n\tfor Camunda ${camundaDeployment} ${camundaVersion}\n\tin directory ${downloadDir}`,
  )
  console.log(`︙here's the file listing: ${rfcConnectorBuilder.assetList()}`)
}
