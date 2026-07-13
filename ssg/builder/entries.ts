import { dirname, join, relative } from "@std/path";
import { ensureDir, walk } from "@std/fs";
import * as esbuild from "esbuild";
import { hasFrontMatter, parseFrontMatter } from "./frontmatter.ts";
import { render as renderTemplate } from "./template.ts";
import { render as renderMarkdown } from "./markdown.ts";

interface SiteConfig {
  title: string;
  url: string;
  baseurl: string;
  author: string;
  email: string;
  description: string;
  time: Temporal.Instant;
}

interface Post {
  type: "post";
  title: string;
  date: Temporal.Instant;
  url: string;
  excerpt: string;
  filePath: string;
}

interface SiteData {
  config: SiteConfig;
  posts: Post[];
}

interface YearPost {
  title: string;
  url: string;
  dateIso: string;
  dateMonthDay: string;
}

interface PageContext {
  title: string;
  url: string;
  dateIso?: string;
  dateDisplay?: string;
  excerpt?: string;
}

interface TsEntry {
  type: "ts";
  filePath: string;
}

interface DeferredEntry {
  type: "deferred";
  filePath: string;
  data: Record<string, unknown>;
  content: string;
}

interface PageResult {
  type: "page";
  filePath: string;
}

interface AssetResult {
  type: "asset";
  filePath: string;
}

const SRC = "src";
export const OUT = "public";

export const siteConfig: SiteConfig = {
  title: "電卓片手に",
  url: "http://k-ui.jp",
  baseurl: "",
  author: "Keiichiro Ui",
  email: "keiichiro.ui@gmail.com",
  description: "ねこほしい",
  time: Temporal.Now.instant(),
};

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function expandUrls(html: string, baseUrl: string): string {
  return html.replace(
    /(href|src)="(\/[^"]*)"/g,
    (_, attr, path) => `${attr}="${baseUrl}${path}"`,
  );
}

function parsePostPath(
  filePath: string,
): { date: Temporal.Instant; url: string } | null {
  const m = filePath.match(
    /\/blog\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/index\.(md|markdown|html)$/,
  );
  if (!m) return null;
  return {
    date: Temporal.Instant.from(`${m[1]}-${m[2]}-${m[3]}T00:00:00+09:00`),
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
  } catch { /* WHY: try next date format */ }
  try {
    return Temporal.ZonedDateTime.from(s).toInstant();
  } catch { /* WHY: try next date format */ }
  try {
    return Temporal.PlainDateTime.from(s).toZonedDateTime("Asia/Tokyo")
      .toInstant();
  } catch { /* WHY: try next date format */ }
  try {
    return Temporal.PlainDate.from(s).toZonedDateTime({
      timeZone: "Asia/Tokyo",
      plainTime: "00:00",
    }).toInstant();
  } catch { /* WHY: try next date format */ }
  throw new RangeError(`unparseable date: "${val}"`);
}

function extractExcerpt(html: string): string {
  return html.match(/<p>([\s\S]*?)<\/p>/)?.[0] ?? "";
}

function makeSiteCtx(site: SiteData) {
  return {
    ...site.config,
    year: inTokyo(site.config.time).year,
    timeIso: toISOString(site.config.time),
  };
}

function makeRecentPosts(posts: Post[], baseurl: string) {
  return posts.slice(0, 5).map((p) => ({
    title: p.title,
    url: baseurl + p.url,
    dateIso: toISOString(p.date),
    dateDisplay: fmtDateDisplay(p.date),
  }));
}

function groupByYear(posts: Post[]): { year: string; posts: YearPost[] }[] {
  const map = new Map<string, YearPost[]>();
  for (const p of posts) {
    const y = String(inTokyo(p.date).year);
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push({
      title: p.title,
      url: p.url,
      dateIso: toISOString(p.date),
      dateMonthDay: fmtDateMonthDay(p.date),
    });
  }
  return Array.from(map.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, posts]) => ({ year, posts }));
}

function makeAtomPosts(posts: Post[], siteUrl: string) {
  return posts.slice(0, 10).map((p) => ({
    title: p.title,
    fullUrl: siteUrl + p.url,
    dateIso: toISOString(p.date),
    id: siteUrl + p.url,
    content: expandUrls(p.excerpt, siteUrl),
  }));
}

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

async function writeHtml(
  outPath: string,
  body: string,
  ctx: Record<string, unknown>,
  layout: string | null,
  dryRun: boolean,
): Promise<void> {
  const html = layout && layout !== "null" && layout !== "nil"
    ? await applyLayouts(body, layout, ctx)
    : body;
  if (dryRun) {
    console.log("  [dry-run]", outPath);
    return;
  }
  await ensureDir(dirname(outPath));
  await Deno.writeTextFile(outPath, html);
}

/**
 * frontmatter パース済みの data/content を受け取りファイルを出力する。
 * src/blog/ 配下のブログ記事であれば Post を、それ以外は PageResult を返す。
 */
async function buildContent(
  filePath: string,
  data: Record<string, unknown>,
  content: string,
  site: SiteData,
  dryRun: boolean,
): Promise<Post | PageResult> {
  const rel = relative(SRC, filePath);
  const isMarkdown = /\.(md|markdown)$/.test(filePath);
  const outRel = isMarkdown ? rel.replace(/\.(md|markdown)$/, ".html") : rel;
  const outPath = join(OUT, outRel);

  let url = "/" + outRel;
  if (url.endsWith("index.html")) url = url.slice(0, -10) || "/";

  const pageCtx: PageContext = {
    title: (data.title as string | undefined) ?? "",
    url,
  };

  const postMeta = parsePostPath(filePath);
  const date = data.date !== undefined
    ? parseDateValue(data.date)
    : postMeta?.date;

  if (date !== undefined) {
    pageCtx.dateIso = toISOString(date);
    pageCtx.dateDisplay = fmtDateDisplay(date);
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
    if (!data.title) {
      throw new Error(`title is required in a post entry: ${filePath}`);
    }
    await writeHtml(outPath, body, ctx, "post", dryRun);
    return {
      type: "post",
      title: String(data.title),
      date,
      url: postMeta.url,
      excerpt: extractExcerpt(body),
      filePath,
    };
  } else {
    if (!("layout" in data)) throw new Error(`layout is required: ${filePath}`);
    if (typeof data.layout !== "string" && data.layout !== null) {
      throw new Error(`layout must be a string or null: ${filePath}`);
    }
    await writeHtml(outPath, body, ctx, data.layout, dryRun);
    return { type: "page", filePath };
  }
}

/**
 * ファイル種別ごとにディスパッチする。
 * - .ts → TsEntry として保留し buildTsEntries に委ねる
 * - use_post_list: true → DeferredEntry として保留し buildPhase2 に委ねる
 * - frontmatter なし → AssetResult としてそのままコピー
 * - それ以外 → buildContent で処理する
 */
async function buildEntry(
  filePath: string,
  site: SiteData,
  dryRun: boolean,
): Promise<TsEntry | DeferredEntry | Post | PageResult | AssetResult> {
  if (filePath.endsWith(".ts")) return { type: "ts", filePath };

  const rel = relative(SRC, filePath);
  const isMarkdown = /\.(md|markdown)$/.test(filePath);
  const outRel = isMarkdown ? rel.replace(/\.(md|markdown)$/, ".html") : rel;
  const outPath = join(OUT, outRel);
  const bytes = await Deno.readFile(filePath);

  if (!hasFrontMatter(bytes)) {
    if (dryRun) {
      console.log("  [dry-run]", outPath);
    } else {
      await ensureDir(dirname(outPath));
      await Deno.writeFile(outPath, bytes);
    }
    return { type: "asset", filePath };
  }

  const raw = new TextDecoder().decode(bytes);
  const { data, content } = parseFrontMatter(raw);

  if (data.use_post_list === true) {
    if (parsePostPath(filePath) !== null) {
      throw new Error(`use_post_list cannot be set on a post: ${filePath}`);
    }
    return { type: "deferred", filePath, data, content };
  }

  return buildContent(filePath, data, content, site, dryRun);
}

async function buildPhase1(dryRun: boolean): Promise<
  { posts: Post[]; deferred: DeferredEntry[]; tsEntries: TsEntry[] }
> {
  const site: SiteData = { config: siteConfig, posts: [] };
  const tsEntries: TsEntry[] = [];
  const deferred: DeferredEntry[] = [];
  const posts: Post[] = [];
  for await (const entry of walk(SRC, { includeDirs: false, skip: [/\/_/] })) {
    const result = await buildEntry(entry.path, site, dryRun);
    switch (result.type) {
      case "post":
        posts.push(result);
        break;
      case "deferred":
        deferred.push(result);
        break;
      case "ts":
        tsEntries.push(result);
        break;
      case "page":
      case "asset":
        break;
    }
  }
  posts.sort((a, b) => Temporal.Instant.compare(b.date, a.date));
  console.log(`  ${posts.length} posts`);
  return { posts, deferred, tsEntries };
}

async function buildTsEntries(
  entries: TsEntry[],
  dryRun: boolean,
): Promise<void> {
  if (entries.length === 0) return;
  const result = await esbuild.build({
    entryPoints: entries.map((e) => e.filePath),
    bundle: true,
    outdir: OUT,
    outbase: SRC,
    format: "iife",
    target: ["es2017"],
    minify: true,
    write: !dryRun,
  });
  esbuild.stop();
  if (dryRun) {
    for (const f of result.outputFiles ?? []) {
      console.log("  [dry-run]", relative(Deno.cwd(), f.path));
    }
  }
}

async function buildPhase2(
  posts: Post[],
  deferred: DeferredEntry[],
  dryRun: boolean,
): Promise<void> {
  const site: SiteData = { config: siteConfig, posts };
  await Promise.all(
    deferred.map((e) =>
      buildContent(e.filePath, e.data, e.content, site, dryRun)
    ),
  );
}

export async function buildEntries(dryRun: boolean): Promise<void> {
  layoutCache.clear();
  const { posts, deferred, tsEntries } = await buildPhase1(dryRun);
  await Promise.all([
    buildPhase2(posts, deferred, dryRun),
    buildTsEntries(tsEntries, dryRun),
  ]);
}
