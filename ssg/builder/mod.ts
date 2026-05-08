import { ensureDir } from "@std/fs";
import { buildEntries, OUT } from "./entries.ts";
import { buildJs } from "./js.ts";

export async function build(): Promise<void> {
  console.log("Building...");
  try {
    await Deno.remove(OUT, { recursive: true });
  } catch { /* ok */ }
  await ensureDir(OUT);

  await Promise.all([buildEntries(), buildJs()]);

  console.log("Done →", OUT);
}
