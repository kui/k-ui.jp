/// <reference lib="dom" />
import { fetchAsJson, formatDateJp } from "./util.ts";

const BASE_URL = "https://qiita.com/api/v2";

interface QiitaItem {
  url: string;
  title: string;
  created_at: string;
}

export async function render(): Promise<void> {
  const tmpls = document.querySelectorAll<HTMLTemplateElement>(
    "[data-qiita-id]",
  );
  await Promise.all(Array.from(tmpls).map(renderOne));
}

async function renderOne(tmpl: HTMLTemplateElement): Promise<void> {
  const userName = tmpl.dataset.qiitaId;
  const mountpoint = tmpl.dataset.mountPoint;
  const perPage = Number(tmpl.dataset.itemsNum ?? 5);
  const containers = mountpoint
    ? Array.from(document.querySelectorAll(mountpoint))
    : [];
  if (!userName || containers.length === 0) {
    console.log("Skipping render: userName or container not found");
    return;
  }

  let items: QiitaItem[];
  try {
    items = await fetchItems(userName, perPage);
  } catch (e) {
    for (const container of containers) {
      container.textContent = (e as Error).message;
    }
    throw e;
  }
  for (const container of containers) {
    container.replaceChildren();
    const ul = document.createElement("ul");
    for (const item of items) {
      const clone = tmpl.content.cloneNode(true) as DocumentFragment;
      const a = clone.querySelector<HTMLAnchorElement>(".js-item-link")!;
      a.href = item.url;
      a.textContent = item.title;
      const time = clone.querySelector<HTMLTimeElement>(".js-item-date")!;
      time.dateTime = item.created_at;
      time.textContent = formatDateJp(item.created_at);
      ul.appendChild(clone);
    }
    container.appendChild(ul);
  }
}

async function fetchItems(
  userName: string,
  perPage: number,
): Promise<QiitaItem[]> {
  const items = await fetchAsJson(
    `${BASE_URL}/users/${userName}/items?per_page=${perPage}`,
  );
  console.log("QiitaProfile: items %o", items);
  return items as QiitaItem[];
}
