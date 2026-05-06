import * as esbuild from "esbuild";
import { ensureDir } from "@std/fs";

export async function buildJs(): Promise<void> {
  await ensureDir("public/js");
  await esbuild.build({
    entryPoints: ["src/_js/top.ts"],
    bundle: true,
    outfile: "public/js/top.js",
    format: "iife",
    target: ["es2017"],
    minify: true,
  });
  esbuild.stop();
}
