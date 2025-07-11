import { assertEquals, assertStringIncludes } from "jsr:@std/assert"
import { join } from "jsr:@std/path"
import { createBuildDir } from "../commands/modules/createBuildDir.ts"

Deno.test("createBuildDir - returns base directory when no camundaVersion provided", () => {
  const result = createBuildDir()
  const expectedBase = join(Deno.env.get("TMPDIR") || "/tmp", "camunda")
  assertEquals(result, expectedBase)
})

Deno.test("createBuildDir - returns version-specific directory when camundaVersion provided", () => {
  const version = "8.7"
  const result = createBuildDir(version)
  const expectedPath = join(
    Deno.env.get("TMPDIR") || "/tmp",
    "camunda",
    version,
    "sap-btp-plugin"
  )
  assertEquals(result, expectedPath)
})

Deno.test("createBuildDir - handles different environment variables", () => {
  // Save original env
  const originalTmpDir = Deno.env.get("TMPDIR")
  const originalTmp = Deno.env.get("TMP")
  const originalTemp = Deno.env.get("TEMP")
  
  try {
    // Test with TMP
    Deno.env.delete("TMPDIR")
    Deno.env.set("TMP", "/custom/tmp")
    Deno.env.delete("TEMP")
    
    const result = createBuildDir()
    assertStringIncludes(result, "/custom/tmp")
    assertStringIncludes(result, "camunda")
  } finally {
    // Restore original env
    if (originalTmpDir) Deno.env.set("TMPDIR", originalTmpDir)
    else Deno.env.delete("TMPDIR")
    if (originalTmp) Deno.env.set("TMP", originalTmp)
    else Deno.env.delete("TMP")
    if (originalTemp) Deno.env.set("TEMP", originalTemp)
    else Deno.env.delete("TEMP")
  }
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
