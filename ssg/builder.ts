import { join, relative, dirname, basename } from "@std/path";
import { walk, ensureDir } from "@std/fs";
import { parseFrontMatter } from "./frontmatter.ts";
import { render } from "./template.ts";
import { renderMarkdown } from "./markdown.ts";
import type { SiteConfig, Post, SiteData } from "./types.ts";

const SRC = "src";
const OUT = "public";

export const siteConfig: SiteConfig = {
  title: "電卓片手に",
  url: "http://k-ui.jp",
  baseurl: "",
  author: "Keiichiro Ui",
  email: "keiichiro.ui@gmail.com",
  description: "ねこほしい",
  qiita_id: "k_ui",
  github_id: "kui",
  twitter_id: "k_ui",
  tumblr_id: "k-ui",
  time: new Date(),
};

// ─── 日付フォーマット (JST) ───────────────────────────────────────────────────

function jstDate(d: Date): Date {
  return new Date(d.getTime() + 9 * 60 * 60000);
}

function fmtDateDisplay(d: Date): string {
  const j = jstDate(d);
  return `${j.getUTCFullYear()}/${j.getUTCMonth() + 1}/${j.getUTCDate()}`;
}

function fmtDateMonthDay(d: Date): string {
  const j = jstDate(d);
  const m = String(j.getUTCMonth() + 1).padStart(2, "0");
  const day = String(j.getUTCDate()).padStart(2, "0");
  return `${m}月 ${day}日`;
}

// ─── HTML ユーティリティ ──────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function expandUrls(html: string, baseUrl: string): string {
  return html.replace(
    /(href|src)="(\/[^"]*)"/g,
    (_, attr, path) => `${attr}="${baseUrl}${path}"`
  );
}

// ─── Post loading ─────────────────────────────────────────────────────────────

function parsePostFilename(
  filePath: string
): { date: Date; slug: string } | null {
  const name = basename(filePath).replace(/\.(md|markdown)$/, "");
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!m) return null;
  return {
    date: new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00+09:00`),
    slug: m[4],
  };
}

async function loadPosts(): Promise<Post[]> {
  const posts: Post[] = [];

  for await (const entry of walk(join(SRC, "_posts"), {
    exts: [".md", ".markdown"],
  })) {
    const raw = await Deno.readTextFile(entry.path);
    const { data, content } = parseFrontMatter(raw);
    const meta = parsePostFilename(entry.path);
    if (!meta) continue;

    const { date, slug } = meta;
    const title = String(data.title ?? slug.replace(/-/g, " "));
    const j = jstDate(date);
    const yy = String(j.getUTCFullYear());
    const mm = String(j.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(j.getUTCDate()).padStart(2, "0");
    const url = `/blog/${yy}/${mm}/${dd}/${slug}/`;
    const html = renderMarkdown(content);

    posts.push({
      title,
      date,
      slug,
      url,
      content: html,
      excerpt: extractExcerpt(html),
      layout: String(data.layout ?? "post"),
      filePath: entry.path,
    });
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function extractExcerpt(html: string): string {
  return html.match(/<p>([\s\S]*?)<\/p>/)?.[0] ?? "";
}

// ─── コンテキスト構築 ─────────────────────────────────────────────────────────

function makeSiteCtx(site: SiteData) {
  return {
    ...site.config,
    year: site.config.time.getFullYear(),
    time_xmlschema: site.config.time.toISOString(),
  };
}

function makeRecentPosts(posts: Post[], baseurl: string) {
  return posts.slice(0, 5).map((p) => ({
    title: p.title,
    url: baseurl + p.url,
    date_iso: p.date.toISOString(),
    date_display: fmtDateDisplay(p.date),
  }));
}

interface YearPost {
  title: string;
  url: string;
  date_xmlschema: string;
  date_month_day: string;
}

function groupByYear(posts: Post[]): { year: string; posts: YearPost[] }[] {
  const map = new Map<string, YearPost[]>();
  for (const p of posts) {
    const y = String(jstDate(p.date).getUTCFullYear());
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push({
      title: p.title,
      url: p.url,
      date_xmlschema: p.date.toISOString(),
      date_month_day: fmtDateMonthDay(p.date),
    });
  }
  return Array.from(map.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, posts]) => ({ year, posts }));
}

function makeAtomPosts(posts: Post[], siteUrl: string) {
  return posts.slice(0, 10).map((p) => ({
    title: p.title,
    full_url: siteUrl + p.url,
    date_xmlschema: p.date.toISOString(),
    id: siteUrl + p.url,
    content: expandUrls(p.excerpt || p.content, siteUrl),
  }));
}

// ─── レイアウト適用 ───────────────────────────────────────────────────────────

const layoutCache = new Map<string, { src: string; parentLayout?: string }>();

async function loadLayout(name: string) {
  if (layoutCache.has(name)) return layoutCache.get(name)!;
  const path = join(SRC, "_layouts", `${name}.html`);
  const raw = await Deno.readTextFile(path);
  const { data, content } = parseFrontMatter(raw);
  const parent = data.layout as string | undefined;
  const entry = {
    src: content,
    parentLayout:
      parent && parent !== "null" && parent !== "nil" ? parent : undefined,
  };
  layoutCache.set(name, entry);
  return entry;
}

async function applyLayouts(
  body: string,
  layoutName: string,
  ctx: Record<string, unknown>
): Promise<string> {
  const layout = await loadLayout(layoutName);
  const rendered = render(layout.src, { ...ctx, content: body });
  if (layout.parentLayout) {
    return applyLayouts(rendered, layout.parentLayout, ctx);
  }
  return rendered;
}

// ─── 記事ビルド ───────────────────────────────────────────────────────────────

async function buildPost(post: Post, site: SiteData): Promise<void> {
  const ctx = {
    site: makeSiteCtx(site),
    page: {
      title: post.title,
      url: post.url,
      date_xmlschema: post.date.toISOString(),
      date_display: fmtDateDisplay(post.date),
      excerpt: stripHtml(post.excerpt),
    },
  };
  const html = await applyLayouts(post.content, post.layout, ctx);
  const outPath = join(OUT, post.url, "index.html");
  await ensureDir(dirname(outPath));
  await Deno.writeTextFile(outPath, html);
}

// ─── src/ ビルド ──────────────────────────────────────────────────────────────

const FM_MARKER = new TextEncoder().encode("---");

async function buildEntry(filePath: string, site: SiteData): Promise<void> {
  const rel = relative(SRC, filePath).replace(/\\/g, "/");
  const outPath = join(OUT, rel);
  await ensureDir(dirname(outPath));

  const bytes = await Deno.readFile(filePath);
  const hasFM = bytes.length >= 3 &&
    bytes[0] === FM_MARKER[0] &&
    bytes[1] === FM_MARKER[1] &&
    bytes[2] === FM_MARKER[2];

  if (!hasFM) {
    await Deno.writeFile(outPath, bytes);
    return;
  }

  const raw = new TextDecoder().decode(bytes);
  const { data, content } = parseFrontMatter(raw);

  let url = "/" + rel;
  if (url.endsWith("index.html")) url = url.slice(0, -10) || "/";

  const ctx = {
    site: makeSiteCtx(site),
    page: {
      title: (data.title as string | undefined) ?? "",
      url,
    },
    recentPosts: makeRecentPosts(site.posts, site.config.baseurl),
    postsByYear: groupByYear(site.posts),
    atomPosts: makeAtomPosts(site.posts, site.config.url),
  };

  const rendered = render(content, ctx);
  const layout = data.layout as string | undefined;
  const html =
    !layout || layout === "null" || layout === "nil"
      ? rendered
      : await applyLayouts(rendered, layout, ctx);

  await Deno.writeTextFile(outPath, html);
}

async function buildSrc(site: SiteData): Promise<void> {
  for await (const entry of walk(SRC, {
    includeDirs: false,
    skip: [/\/_/],
  })) {
    await buildEntry(entry.path, site);
  }
}

// ─── エントリポイント ─────────────────────────────────────────────────────────

export async function build(): Promise<void> {
  console.log("Building...");
  layoutCache.clear();
  try { await Deno.remove(OUT, { recursive: true }); } catch { /* ok */ }
  await ensureDir(OUT);

  const posts = await loadPosts();
  const site: SiteData = { config: siteConfig, posts };
  console.log(`  ${posts.length} posts`);

  await Promise.all([
    ...posts.map((p) => buildPost(p, site)),
    buildSrc(site),
  ]);

  console.log("Done →", OUT);
}
