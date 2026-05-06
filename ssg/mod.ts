import { Temporal } from "temporal-polyfill";
import { build } from "./builder.ts";
import { serve } from "./server.ts";

const cmd = Deno.args[0];

switch (cmd) {
  case "build":
    await build();
    break;

  case "serve": {
    await build();
    serve("public", 39278);
    break;
  }

  case "new-post": {
    const title = Deno.args[1] ?? "new-post";
    const now = Temporal.Now.zonedDateTimeISO("Asia/Tokyo");
    const [y, m, d] = now.toPlainDate().toString().split("-");
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(
      /[^\w-]/g,
      "",
    );
    const path = `src/_posts/${y}/${m}/${y}-${m}-${d}-${slug}.md`;

    const dateStr = now.toString({ timeZoneName: "never" });
    const fm = `---\ntitle: ${title}\ndate: ${dateStr}\n---\n\n`;

    await Deno.mkdir(`src/_posts/${y}/${m}`, { recursive: true });
    await Deno.writeTextFile(path, fm);
    console.log("Created:", path);
    break;
  }

  default:
    console.log("Usage: deno task build | serve | new-post [title]");
}
