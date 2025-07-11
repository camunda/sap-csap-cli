import { assertEquals, assertStringIncludes } from "jsr:@std/assert"
import { join } from "jsr:@std/path"
import { createBuildDir } from "../commands/modules/createBuildDir.ts"

Deno.test("createBuildDir - returns base directory when no camundaVersion provided", () => {
    const result = createBuildDir()
    const info = Deno.statSync(result)
    assertEquals(info.isDirectory, true, `expects ${result} to be a directory`)
})

Deno.test("createBuildDir - returns version-specific directory when camundaVersion provided", () => {
    const version = "8.7"
    const result = createBuildDir(version)
    const info = Deno.statSync(result)
    assertEquals(info.isDirectory, true, `expects ${result} to be a directory`)
    assertStringIncludes(result, version)
})

Deno.test("createBuildDir - defaults to /tmp when no env vars set", () => {
  // Save original env
  const originalTmpDir = Deno.env.get("TMPDIR")
  const originalTmp = Deno.env.get("TMP")
  const originalTemp = Deno.env.get("TEMP")
  
  try {
    // Remove all temp env vars
    Deno.env.delete("TMPDIR")
    Deno.env.delete("TMP")
    Deno.env.delete("TEMP")
    
    const result = createBuildDir()
    assertStringIncludes(result, "/tmp")
    assertStringIncludes(result, "camunda")
  } finally {
    // Restore original env
    if (originalTmpDir) Deno.env.set("TMPDIR", originalTmpDir)
    if (originalTmp) Deno.env.set("TMP", originalTmp)
    if (originalTemp) Deno.env.set("TEMP", originalTemp)
  }
})
