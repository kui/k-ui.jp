import { ensureDir } from "@std/fs";
import { buildEntries, OUT } from "./entries.ts";

export async function build(dryRun = false): Promise<void> {
  console.log(dryRun ? "Dry run..." : "Building...");
  if (!dryRun) {
    try {
      await Deno.remove(OUT, { recursive: true });
    } catch { /* ok */ }
    await ensureDir(OUT);
  }

  await buildEntries(dryRun);

  console.log(dryRun ? "Done (no files written)" : `Done → ${OUT}`);
}
