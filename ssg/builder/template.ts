import Mustache from "mustache";

export function render(template: string, ctx: Record<string, unknown>): string {
  return Mustache.render(template, ctx);
}
