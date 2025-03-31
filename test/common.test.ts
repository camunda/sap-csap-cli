import { compareFilesBySha256, getGitCommitHash, compareFilesByName } from "../lib/common.ts"
import { assertEquals, assertNotEquals } from "jsr:@std/assert"

Deno.test("compareFilesBySha256 - identical files", async () => {
  const file1 = await Deno.makeTempFile()
  const file2 = await Deno.makeTempFile()
  await Deno.writeTextFile(file1, "test content")
  await Deno.writeTextFile(file2, "test content")

  const result = await compareFilesBySha256(file1, file2)
  assertEquals(result, true)

  await Deno.remove(file1)
  await Deno.remove(file2)
})

Deno.test("compareFilesBySha256 - different files", async () => {
  const file1 = await Deno.makeTempFile()
  const file2 = await Deno.makeTempFile()
  await Deno.writeTextFile(file1, "test content")
  await Deno.writeTextFile(file2, "different content")

  const result = await compareFilesBySha256(file1, file2)
  assertEquals(result, false)

  await Deno.remove(file1)
  await Deno.remove(file2)
})

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

Deno.test("compareFilesByName - identical file names", async () => {
    const tempDir = await Deno.makeTempDir()
    const file1 = `${tempDir}/test-file.txt`
    const file2 = `${tempDir}/test-file.txt`

    await Deno.writeTextFile(file1, "test content")

    const result = await compareFilesByName(file1, file2)
    assertEquals(result, true)

    await Deno.remove(tempDir, { recursive: true })
})

Deno.test("compareFilesByName - different file names", async () => {
    const tempDir = await Deno.makeTempDir()
    const file1 = `${tempDir}/test-file1.txt`
    const file2 = `${tempDir}/test-file2.txt`

    await Deno.writeTextFile(file1, "test content")
    await Deno.writeTextFile(file2, "test content")

    const result = await compareFilesByName(file1, file2)
    assertEquals(result, false)

    await Deno.remove(tempDir, { recursive: true })
})
