export async function prompt(
  question: string,
  defaultValue?: string,
): Promise<string> {
  Deno.stdout.write(new TextEncoder().encode(question));
  const buf = new Uint8Array(1024);
  const n = <number> await Deno.stdin.read(buf);
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  return input || defaultValue || "";
}
