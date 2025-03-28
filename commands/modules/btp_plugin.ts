import { progress, step } from "./common.ts"

export async function btpPlugin(
  { sapIntegrationModule, camundaVersion, camundaDeployment }: {
    sapIntegrationModule: string
    camundaVersion: string
    camundaDeployment: string
  },
) {
  const init = progress()
  init.start()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("")
  await downloadSources()
  init.stop()
}

async function downloadSources() {
  const step1 = step("Downloading BTP plugin sources...")
  step1.start()
  await new Promise((resolve) => setTimeout(resolve, 2200))
  step1.stop()
}
