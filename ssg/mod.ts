import { build } from "./builder/mod.ts";
import { serve } from "./server.ts";

const cmd = Deno.args[0];
const dryRun = Deno.args.includes("--dry-run");

switch (cmd) {
  case "build":
    await build(dryRun);
    break;

  case "serve": {
    await build();
    serve("public", 39278);
    break;
  }

  case "new-post": {
    const slug = Deno.args[1];
    const title = Deno.args[2] ?? slug;

    if (!slug) {
      console.error("Usage: deno task new-post <slug> [title]");
      Deno.exit(1);
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
      console.error(
        "Error: slug must contain only lowercase letters (a-z), digits (0-9), and hyphens (-), and must not start or end with a hyphen.",
      );
      Deno.exit(1);
    }

    const now = Temporal.Now.zonedDateTimeISO("Asia/Tokyo");
    const [y, m, d] = now.toPlainDate().toString().split("-");
    const dir = `src/blog/${y}/${m}/${d}/${slug}`;
    const path = `${dir}/index.md`;

    const dateStr = now.toString({ timeZoneName: "never" });
    const fm = `---\ntitle: ${title}\ndate: ${dateStr}\n---\n`;

    await Deno.mkdir(dir, { recursive: true });
    await Deno.writeTextFile(path, fm);
    console.log("Created:", path);
    break;
  }

  default:
    console.log("Usage: deno task build | serve | new-post <slug> [title]");
}
