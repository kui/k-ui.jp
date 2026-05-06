/// <reference lib="dom" />
import { fetchAsJson, formatDateJp } from "./util.ts";

const BASE_URL = "https://qiita.com/api/v2";

interface QiitaItem {
  url: string;
  title: string;
  created_at: string;
}

export default class QiitaProfile {
  private userName: string;
  private perPage: number;

  constructor(userName: string, itemsNum = 5) {
    this.userName = userName;
    this.perPage = itemsNum;

    console.log("QiitaProfile: Constructor %o", this);
  }

  async render(
    templateSelector: string,
    containerSelector: string,
  ): Promise<void> {
    const tmpl = document.querySelector<HTMLTemplateElement>(templateSelector);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.log("Ignore render: not found container");
      return;
    }

    try {
      const items = await this.fetchItems();
      container.replaceChildren();
      const ul = document.createElement("ul");
      for (const item of items) {
        const clone = tmpl!.content.cloneNode(true) as DocumentFragment;
        const a = clone.querySelector<HTMLAnchorElement>(".js-item-link")!;
        a.href = item.url;
        a.textContent = item.title;
        const time = clone.querySelector<HTMLTimeElement>(".js-item-date")!;
        time.dateTime = item.created_at;
        time.textContent = formatDateJp(item.created_at);
        ul.appendChild(clone);
      }
      container.appendChild(ul);
    } catch (e) {
      container.textContent = (e as Error).message;
      throw e;
    }
  }

  private async fetchItems(): Promise<QiitaItem[]> {
    const items = await fetchAsJson(
      `${BASE_URL}/users/${this.userName}/items?per_page=${this.perPage}`,
    );
    console.log("QiitaProfile: items %o", items);
    return items as QiitaItem[];
  }
}
