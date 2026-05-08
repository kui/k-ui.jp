import { dirname, join, relative } from "@std/path";
import { ensureDir, walk } from "@std/fs";
import { Temporal } from "temporal-polyfill";
import { hasFrontMatter, parseFrontMatter } from "./frontmatter.ts";
import { render as renderTemplate } from "./template.ts";
import { render as renderMarkdown } from "./markdown.ts";
import { buildJs } from "./js.ts";
import type { Post, SiteConfig, SiteData } from "./types.ts";

const SRC = "src";
const OUT = "public";

export const siteConfig: SiteConfig = {
  title: "電卓片手に",
  url: "http://k-ui.jp",
  baseurl: "",
  author: "Keiichiro Ui",
  email: "keiichiro.ui@gmail.com",
  description: "ねこほしい",
  time: Temporal.Now.instant(),
};

// ─── 日付ユーティリティ (Asia/Tokyo 基準) ────────────────────────────────────

function inTokyo(instant: Temporal.Instant): Temporal.ZonedDateTime {
  return instant.toZonedDateTimeISO("Asia/Tokyo");
}

function fmtDateDisplay(instant: Temporal.Instant): string {
  const zdt = inTokyo(instant);
  return `${zdt.year}/${zdt.month}/${zdt.day}`;
}

function fmtDateMonthDay(instant: Temporal.Instant): string {
  const zdt = inTokyo(instant);
  return `${String(zdt.month).padStart(2, "0")}月 ${
    String(zdt.day).padStart(2, "0")
  }日`;
}

function toISOString(instant: Temporal.Instant): string {
  return inTokyo(instant).toString({ timeZoneName: "never" });
}

// ─── HTML ユーティリティ ──────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function expandUrls(html: string, baseUrl: string): string {
  return html.replace(
    /(href|src)="(\/[^"]*)"/g,
    (_, attr, path) => `${attr}="${baseUrl}${path}"`,
  );
}

// ─── ブログ記事メタデータ解析 ────────────────────────────────────────────────────

function parsePostPath(
  filePath: string,
): { date: Temporal.Instant; slug: string; url: string } | null {
  const m = filePath.match(
    /\/blog\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/index\.(md|markdown|html)$/,
  );
  if (!m) return null;
  return {
    date: Temporal.Instant.from(`${m[1]}-${m[2]}-${m[3]}T00:00:00+09:00`),
    slug: m[4],
    url: `/blog/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`,
  };
}

function parseDateValue(val: unknown): Temporal.Instant {
  if (typeof val !== "string") {
    throw new TypeError(`date must be a string, got: ${typeof val}`);
  }
  const s = val.trim();
  try {
    return Temporal.Instant.from(s);
  } catch { /* fall through */ }
  try {
    return Temporal.ZonedDateTime.from(s).toInstant();
  } catch { /* fall through */ }
  try {
    return Temporal.PlainDateTime.from(s).toZonedDateTime("Asia/Tokyo")
      .toInstant();
  } catch { /* fall through */ }
  try {
    return Temporal.PlainDate.from(s).toZonedDateTime({
      timeZone: "Asia/Tokyo",
      plainTime: "00:00",
    }).toInstant();
  } catch { /* fall through */ }
  throw new RangeError(`unparseable date: "${val}"`);
}

function extractExcerpt(html: string): string {
  return html.match(/<p>([\s\S]*?)<\/p>/)?.[0] ?? "";
}

// ─── コンテキスト構築 ─────────────────────────────────────────────────────────

function makeSiteCtx(site: SiteData) {
  return {
    ...site.config,
    year: inTokyo(site.config.time).year,
    time_xmlschema: toISOString(site.config.time),
  };
}

function makeRecentPosts(posts: Post[], baseurl: string) {
  return posts.slice(0, 5).map((p) => ({
    title: p.title,
    url: baseurl + p.url,
    date_iso: toISOString(p.date),
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
    const y = String(inTokyo(p.date).year);
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push({
      title: p.title,
      url: p.url,
      date_xmlschema: toISOString(p.date),
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
    date_xmlschema: toISOString(p.date),
    id: siteUrl + p.url,
    content: expandUrls(p.excerpt, siteUrl),
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
    parentLayout: parent && parent !== "null" && parent !== "nil"
      ? parent
      : undefined,
  };
  layoutCache.set(name, entry);
  return entry;
}

async function applyLayouts(
  body: string,
  layoutName: string,
  ctx: Record<string, unknown>,
): Promise<string> {
  const layout = await loadLayout(layoutName);
  const rendered = renderTemplate(layout.src, { ...ctx, content: body });
  if (layout.parentLayout) {
    return applyLayouts(rendered, layout.parentLayout, ctx);
  }
  return rendered;
}

// ─── 出力共通処理 ─────────────────────────────────────────────────────────────

async function writeHtml(
  outPath: string,
  body: string,
  ctx: Record<string, unknown>,
  layout: string | null,
): Promise<void> {
  const html = layout && layout !== "null" && layout !== "nil"
    ? await applyLayouts(body, layout, ctx)
    : body;
  await ensureDir(dirname(outPath));
  await Deno.writeTextFile(outPath, html);
}

// ─── src/ ビルド ──────────────────────────────────────────────────────────────

interface DeferredEntry {
  filePath: string;
  data: Record<string, unknown>;
  content: string;
}

// frontmatter パース済みの data/content を受け取りファイルを出力する。
// src/blog/ 配下のブログ記事であれば Post を返し、buildPhase1 で収集される。
async function buildContent(
  filePath: string,
  data: Record<string, unknown>,
  content: string,
  site: SiteData,
): Promise<Post | null> {
  const rel = relative(SRC, filePath);
  const isMarkdown = /\.(md|markdown)$/.test(filePath);
  const outRel = isMarkdown ? rel.replace(/\.(md|markdown)$/, ".html") : rel;
  const outPath = join(OUT, outRel);

  let url = "/" + outRel;
  if (url.endsWith("index.html")) url = url.slice(0, -10) || "/";

  const pageCtx: Record<string, unknown> = {
    title: (data.title as string | undefined) ?? "",
    url,
  };

  const postMeta = parsePostPath(filePath);
  const date = data.date !== undefined
    ? parseDateValue(data.date)
    : postMeta?.date;

  if (date !== undefined) {
    pageCtx.date_xmlschema = toISOString(date);
    pageCtx.date_display = fmtDateDisplay(date);
  }

  const ctx = {
    site: makeSiteCtx(site),
    page: pageCtx,
    recentPosts: makeRecentPosts(site.posts, site.config.baseurl),
    postsByYear: groupByYear(site.posts),
    atomPosts: makeAtomPosts(site.posts, site.config.url),
  };

  const body = isMarkdown
    ? await renderMarkdown(content)
    : renderTemplate(content, ctx);

  if (isMarkdown) {
    pageCtx.excerpt = stripHtml(extractExcerpt(body));
  }

  if (postMeta) {
    if ("layout" in data) {
      throw new Error(`layout is not supported in a post entry: ${filePath}`);
    }
    if (!date) throw new Error(`date is required in a post entry: ${filePath}`);
    await writeHtml(outPath, body, ctx, "post");
    return {
      title: String(data.title ?? postMeta.slug.replace(/-/g, " ")),
      date,
      slug: postMeta.slug,
      url: postMeta.url,
      excerpt: extractExcerpt(body),
      filePath,
    };
  } else {
    if (!("layout" in data)) throw new Error(`layout is required: ${filePath}`);
    if (typeof data.layout !== "string" && data.layout !== null) {
      throw new Error(`layout must be a string or null: ${filePath}`);
    }
    await writeHtml(outPath, body, ctx, data.layout);
    return null;
  }
}

// use_post_list: true のファイルは DeferredEntry として保留し buildPhase2 に委ねる。
// それ以外は buildContent で処理し、ブログ記事なら Post を返す。
async function buildEntry(
  filePath: string,
  site: SiteData,
): Promise<Post | DeferredEntry | null> {
  const rel = relative(SRC, filePath);
  const isMarkdown = /\.(md|markdown)$/.test(filePath);
  const outRel = isMarkdown ? rel.replace(/\.(md|markdown)$/, ".html") : rel;
  const outPath = join(OUT, outRel);
  const bytes = await Deno.readFile(filePath);

  if (!hasFrontMatter(bytes)) {
    await ensureDir(dirname(outPath));
    await Deno.writeFile(outPath, bytes);
    return null;
  }

  const raw = new TextDecoder().decode(bytes);
  const { data, content } = parseFrontMatter(raw);

  if (data.use_post_list === true) {
    if (parsePostPath(filePath) !== null) {
      throw new Error(`use_post_list cannot be set on a post: ${filePath}`);
    }
    return { filePath, data, content };
  }

  return buildContent(filePath, data, content, site);
}

// ─── エントリポイント ─────────────────────────────────────────────────────────

async function buildPhase1(): Promise<
  { posts: Post[]; deferred: DeferredEntry[] }
> {
  const site: SiteData = { config: siteConfig, posts: [] };
  const results = await Promise.all(
    (await Array.fromAsync(walk(SRC, { includeDirs: false, skip: [/\/_/] })))
      .map((entry) => buildEntry(entry.path, site)),
  );

  const deferred: DeferredEntry[] = [];
  const posts: Post[] = [];
  for (const result of results) {
    if (result === null) continue;
    if ("data" in result) deferred.push(result);
    else posts.push(result);
  }
  posts.sort((a, b) => Temporal.Instant.compare(b.date, a.date));
  console.log(`  ${posts.length} posts`);
  return { posts, deferred };
}

async function buildPhase2(
  posts: Post[],
  deferred: DeferredEntry[],
): Promise<void> {
  const site: SiteData = { config: siteConfig, posts };
  await Promise.all(
    deferred.map((e) => buildContent(e.filePath, e.data, e.content, site)),
  );
}

async function buildSrc(): Promise<void> {
  const { posts, deferred } = await buildPhase1();
  await buildPhase2(posts, deferred);
}

export async function build(): Promise<void> {
  console.log("Building...");
  layoutCache.clear();
  try {
    await Deno.remove(OUT, { recursive: true });
  } catch { /* ok */ }
  await ensureDir(OUT);

  await Promise.all([buildSrc(), buildJs()]);

  console.log("Done →", OUT);
}
