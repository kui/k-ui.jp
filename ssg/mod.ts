import { build } from "./builder.ts";
import { serve } from "./server.ts";

const cmd = Deno.args[0];

switch (cmd) {
  case "build":
    await build();
    break;

  case "serve": {
    await build();
    await serve("public", 39278);
    break;
  }

  case "new-post": {
    const title = Deno.args[1] ?? "new-post";
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const path = `src/_posts/${y}/${m}/${y}-${m}-${d}-${slug}.md`;

    const dateStr = `${y}-${m}-${d} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const fm = `---\ntitle: ${title}\ndate: ${dateStr}\n---\n\n`;

    await Deno.mkdir(`src/_posts/${y}/${m}`, { recursive: true });
    await Deno.writeTextFile(path, fm);
    console.log("Created:", path);
    break;
  }

  default:
    console.log("Usage: deno task build | serve | new-post [title]");
}
