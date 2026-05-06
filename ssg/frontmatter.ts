export interface FrontMatterResult {
  data: Record<string, unknown>;
  content: string;
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

  return { data: parseYaml(yamlStr), content };
}

function parseYaml(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "" || line.trim().startsWith("#")) {
      i++;
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      i++;
      continue;
    }

    const key = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1);
    const valueStr = rest.trim();

    if (valueStr === "") {
      // Block sequence: collect "- item" lines
      const items: unknown[] = [];
      i++;
      while (i < lines.length && /^\s+-\s/.test(lines[i])) {
        items.push(parseScalar(lines[i].replace(/^\s+-\s+/, "").trim()));
        i++;
      }
      if (items.length > 0) {
        result[key] = items;
      }
    } else {
      result[key] = parseScalar(valueStr);
      i++;
    }
  }

  return result;
}

function parseScalar(value: string): unknown {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;

  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  return value;
}
