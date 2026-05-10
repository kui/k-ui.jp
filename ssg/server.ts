import { extname, join } from "@std/path";
import { exists } from "@std/fs";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

export function serve(root: string, port: number): void {
  console.log(`Serving http://localhost:${port}/ from ${root}`);

  Deno.serve({ port }, async (req) => {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);

    // Resolve to file
    let filePath = join(root, path);

    if (await isDir(filePath)) {
      if (!path.endsWith("/")) {
        return Response.redirect(req.url + "/", 301);
      }
      filePath = join(filePath, "index.html");
    }

    if (!(await exists(filePath))) {
      return new Response("404 Not Found", { status: 404 });
    }

    const body = await Deno.readFile(filePath);
    const mime = MIME[extname(filePath)] ?? "application/octet-stream";
    return new Response(body, { headers: { "content-type": mime } });
  });
}

async function isDir(path: string): Promise<boolean> {
  try {
    return (await Deno.stat(path)).isDirectory;
  } catch {
    return false;
  }
}
