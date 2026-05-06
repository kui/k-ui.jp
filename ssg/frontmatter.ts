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
  const match = raw.match(/^---[ \t]*\n([\s\S]*?)^---[ \t]*(?:\n|$)/m);
  if (!match) return { data: {}, content: raw };

  const parsed = parseYaml(match[1], { schema: "core" });
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TypeError(
      `Front matter must be a YAML mapping, got: ${JSON.stringify(parsed)}`,
    );
  }
  return {
    data: parsed as Record<string, unknown>,
    content: raw.slice(match[0].length),
  };
}
