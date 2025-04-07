import { assertEquals, assertNotEquals } from "jsr:@std/assert"
import { getGitCommitHash } from "../lib/common.ts"

Deno.test("getGitCommitHash - valid repository", async () => {
  const tempDir = await Deno.makeTempDir()
  const gitInit = new Deno.Command("git", { args: ["init", tempDir] })
  const init = await gitInit.output()
  if (!init.success) {
    console.error("git init failed:", init.stderr)
  }

  // Create a file and make an initial commit
  const filePath = `${tempDir}/test.txt`
  await Deno.writeTextFile(filePath, "initial content")
  const gitAdd = new Deno.Command("git", { args: ["-C", tempDir, "add", "."] })
  const add = await gitAdd.output()
  if (!add.success) {
    console.error("git add failed:", add.stderr)
  }
  const gitCommit = new Deno.Command("git", {
    args: ["-C", tempDir, "commit", "-m", "Initial commit"],
  })
  const commit = await gitCommit.output()
  if (!commit.success) {
    console.error("git commit failed:", commit.stderr)
  }

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

