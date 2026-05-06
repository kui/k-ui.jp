import { marked } from "marked";

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ text, depth }) {
      const plain = text.replace(/<[^>]+>/g, "").trim();
      const id = escAttr(plain.replace(/\s+/g, "-"));
      return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}"></a>${text}</h${depth}>\n`;
    },
  },
});

export function renderMarkdown(src: string): string {
  return marked.parse(src, { async: false });
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
