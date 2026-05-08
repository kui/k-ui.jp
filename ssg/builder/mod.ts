import { ensureDir } from "@std/fs";
import { buildEntries, OUT } from "./entries.ts";

export async function build(): Promise<void> {
  console.log("Building...");
  try {
    await Deno.remove(OUT, { recursive: true });
  } catch { /* ok */ }
  await ensureDir(OUT);

  await buildEntries();

  console.log("Done →", OUT);
}
