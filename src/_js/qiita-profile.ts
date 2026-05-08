/// <reference lib="dom" />
import { fetchAsJson, formatDateJp } from "./util.ts";

const BASE_URL = "https://qiita.com/api/v2";

interface QiitaItem {
  url: string;
  title: string;
  created_at: string;
}

export default class QiitaProfile {
  async render(): Promise<void> {
    const tmpl = document.querySelector<HTMLTemplateElement>("[data-qiita-id]");
    const userName = tmpl?.dataset.qiitaId;
    const mountpoint = tmpl?.dataset.mountPoint;
    const perPage = Number(tmpl?.dataset.itemsNum ?? 5);
    const container = mountpoint
      ? document.querySelector(mountpoint)
      : null;
    if (!userName || !container) {
      console.log("Ignore render: not found userName or container");
      return;
    }

    try {
      const items = await this.fetchItems(userName, perPage);
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

  private async fetchItems(
    userName: string,
    perPage: number,
  ): Promise<QiitaItem[]> {
    const items = await fetchAsJson(
      `${BASE_URL}/users/${userName}/items?per_page=${perPage}`,
    );
    console.log("QiitaProfile: items %o", items);
    return items as QiitaItem[];
  }
}
