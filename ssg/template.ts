import Mustache from "mustache";

// サーバーサイドのデリミタに [[ ]] を使うことで、
// クライアントサイド Mustache の {{ }} と衝突しない
const TAGS: [string, string] = ["[[", "]]"];

// Mustache 4 はデフォルトで '/' や '=' もエスケープするが、
// URL 属性値が壊れるため '&' '<' '>' '"' "'" のみに絞る
(Mustache as unknown as { escape: (s: string) => string }).escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function render(template: string, ctx: Record<string, unknown>): string {
  return Mustache.render(template, ctx, {}, TAGS);
}
