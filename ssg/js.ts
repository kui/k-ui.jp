import * as esbuild from "esbuild";
import { ensureDir, walk } from "@std/fs";

export async function buildJs(): Promise<void> {
  const entryPoints: string[] = [];
  for await (
    const entry of walk("src/_js", {
      maxDepth: 1,
      exts: [".ts"],
      includeDirs: false,
    })
  ) {
    entryPoints.push(entry.path);
  }
  if (entryPoints.length === 0) return;

  await ensureDir("public/js");
  await esbuild.build({
    entryPoints,
    bundle: true,
    outdir: "public/js",
    outbase: "src/_js",
    format: "iife",
    target: ["es2017"],
    minify: true,
  });
  esbuild.stop();
}
