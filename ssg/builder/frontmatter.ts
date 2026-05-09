import { parse as parseYaml } from "@std/yaml";

export interface FrontMatterResult {
  data: Record<string, unknown>;
  content: string;
}

export function hasFrontMatter(bytes: Uint8Array): boolean {
  return bytes.length >= 3 &&
    bytes[0] === 0x2D && bytes[1] === 0x2D && bytes[2] === 0x2D;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseFrontMatter(raw: string): FrontMatterResult {
  const match = raw.match(/^---[ \t]*\n([\s\S]*?)^---[ \t]*(?:\n|$)/m);
  if (!match) return { data: {}, content: raw };

  const parsed = parseYaml(match[1], { schema: "core" });
  if (!isRecord(parsed)) {
    throw new TypeError(
      `Front matter must be a YAML mapping, got: ${JSON.stringify(parsed)}`,
    );
  }
  return {
    data: parsed,
    content: raw.slice(match[0].length),
  };
}
