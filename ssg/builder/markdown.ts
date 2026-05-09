import {
  type BundledLanguage,
  bundledLanguages,
  createHighlighter,
  type Highlighter,
} from "shiki";
import { marked, type Tokens } from "marked";

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["catppuccin-latte"],
    langs: [],
  });
  return highlighterPromise;
}

function isBundledLanguage(lang: string): lang is BundledLanguage {
  return lang in bundledLanguages;
}

type CodeTokenWithHighlighted = Tokens.Code & { highlighted?: string };

marked.use({
  gfm: true,
  breaks: false,
  async: true,
  async walkTokens(token) {
    if (token.type !== "code") return;
    const t = token as CodeTokenWithHighlighted;
    const hl = await getHighlighter();
    const lang = t.lang;
    if (lang) {
      if (!isBundledLanguage(lang)) {
        throw new Error(`Unsupported language in code block: "${lang}"`);
      }
      if (!hl.getLoadedLanguages().includes(lang)) {
        await hl.loadLanguage(lang);
      }
      t.highlighted = hl.codeToHtml(t.text, {
        lang,
        theme: "catppuccin-latte",
      });
    } else {
      t.highlighted = hl.codeToHtml(t.text, {
        lang: "text",
        theme: "catppuccin-latte",
      });
    }
  },
  renderer: {
    heading({ text, depth }) {
      const plain = text.replace(/<[^>]+>/g, "").trim();
      const id = escAttr(plain.replace(/\s+/g, "-"));
      return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}">${text}</a></h${depth}>\n`;
    },
    code(token) {
      return (token as CodeTokenWithHighlighted).highlighted ??
        `<pre><code>${token.text}</code></pre>`;
    },
  },
});

export async function render(src: string): Promise<string> {
  return await marked.parse(src, { async: true });
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
