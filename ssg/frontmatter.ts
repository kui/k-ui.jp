import { parse as parseYaml } from "@std/yaml";

export interface FrontMatterResult {
  data: Record<string, unknown>;
  content: string;
}

export function hasFrontMatter(bytes: Uint8Array): boolean {
  return bytes.length >= 3 &&
    bytes[0] === 0x2D && bytes[1] === 0x2D && bytes[2] === 0x2D;
}

export function parseFrontMatter(raw: string): FrontMatterResult {
  if (!raw.startsWith("---")) {
    return { data: {}, content: raw };
  }

  const after = raw.slice(3);
  const firstNewline = after.indexOf("\n");
  if (firstNewline === -1) return { data: {}, content: raw };

  const body = after.slice(firstNewline + 1);
  const closeMatch = body.match(/^---\s*$/m);
  if (!closeMatch || closeMatch.index === undefined) {
    return { data: {}, content: raw };
  }

  const yamlStr = body.slice(0, closeMatch.index);
  const content = body.slice(closeMatch.index + closeMatch[0].length + 1);
  const parsed = parseYaml(yamlStr, { schema: "core" });
  const data =
    parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};

  return { data, content };
}
