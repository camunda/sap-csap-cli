import { assertEquals, assertNotEquals } from "jsr:@std/assert"
import { getGitCommitHash } from "../lib/common.ts"

Deno.test("getGitCommitHash - valid repository", async () => {
  const tempDir = await Deno.makeTempDir()
  const gitInit = new Deno.Command("git", { args: ["init", tempDir] })
  await gitInit.output()

  // Create a file and make an initial commit
  const filePath = `${tempDir}/test.txt`
  await Deno.writeTextFile(filePath, "initial content")
  const gitAdd = new Deno.Command("git", { args: ["-C", tempDir, "add", "."] })
  await gitAdd.output()
  const gitCommit = new Deno.Command("git", {
    args: ["-C", tempDir, "commit", "-m", "Initial commit"],
  })
  await gitCommit.output()

  const commitHash = await getGitCommitHash(tempDir)
  assertNotEquals(commitHash, null)

  await Deno.remove(tempDir, { recursive: true })
})

Deno.test("getGitCommitHash - invalid directory", async () => {
  const tempDir = await Deno.makeTempDir()
  const commitHash = await getGitCommitHash(tempDir)
  assertEquals(commitHash, null)

  await Deno.remove(tempDir, { recursive: true })
})

