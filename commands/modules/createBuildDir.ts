import * as path from "jsr:@std/path"

/**
 * Create the build directory path for the BTP plugin setup.
 * If camundaVersion is provided, returns the full build dir path.
 * If not, returns the base build dir (osTmpDir/camunda).
 * @param camundaVersion The Camunda version string (e.g., "8.7").
 * @returns The absolute path to the build directory.
 */
export function createBuildDir(camundaVersion?: string): string {
  const osTmpDir = Deno.env.get("TMPDIR") || Deno.env.get("TMP") ||
    Deno.env.get("TEMP") || "/tmp"
  if (camundaVersion) {
    return path.join(
      osTmpDir,
      "camunda",
      camundaVersion,
      "sap-btp-plugin",
    )
  } else {
    return path.join(osTmpDir, "camunda")
  }
}
