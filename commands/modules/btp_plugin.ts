import {progress, step } from "../../lib/common.ts"
import { CamundaCredentials } from "../../lib/credentials.ts"

export async function btpPlugin(
  { camundaVersion, camundaDeployment, credentials, btpRoute }: {
    camundaVersion: string
    camundaDeployment: string,
    credentials: CamundaCredentials,
    btpRoute: string
  },
) {
  console.log("")
  const init = progress()
  init.start()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("")
  await downloadSources()
  init.stop()
}

async function downloadSources() {
  // TODO: check if already downloaded

  const step1 = step("Downloading BTP plugin sources...")
  step1.start()
  await new Promise((resolve) => setTimeout(resolve, 2200))
  step1.stop()
}
