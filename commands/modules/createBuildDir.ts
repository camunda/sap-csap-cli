import * as path from "jsr:@std/path"

/**
 * Create the build directory path for the BTP plugin setup.
 * @param camundaVersion The Camunda version string (e.g., "8.7").
 * @returns The absolute path to the build directory.
 */
export function createBuildDir(camundaVersion: string): string {
  const osTmpDir = Deno.env.get("TMPDIR") || Deno.env.get("TMP") ||
    Deno.env.get("TEMP") || "/tmp"
  return path.join(
    osTmpDir,
    "camunda",
    camundaVersion,
    "sap-btp-plugin",
  )
}
