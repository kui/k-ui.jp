import Mustache from "mustache";

// サーバーサイドのデリミタに [[ ]] を使うことで、
// クライアントサイド Mustache の {{ }} と衝突しない
const TAGS: [string, string] = ["[[", "]]"];

export function render(template: string, ctx: Record<string, unknown>): string {
  return Mustache.render(template, ctx, {}, TAGS);
}
