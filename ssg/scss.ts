import * as sass from "sass";
import { parseFrontMatter } from "./frontmatter.ts";
import { dirname, resolve } from "@std/path";

export async function compileSCSS(filePath: string): Promise<string> {
  const absPath = resolve(filePath);
  const raw = await Deno.readTextFile(absPath);
  const { content } = parseFrontMatter(raw);
  const fileDir = dirname(absPath);
  const sassDir = resolve(dirname(absPath), "..", "_sass");

  const result = sass.compileString(content, {
    url: new URL("file://" + absPath),
    style: "compressed",
    loadPaths: [fileDir, sassDir],
  });
  return result.css;
}
