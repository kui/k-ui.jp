interface CacheEntry {
  date: string;
  content: unknown;
}

export async function fetchAsJson(url: string): Promise<unknown> {
  const cachekey = `fetch-cache-${url}`;
  const cached = localStorage.getItem(cachekey);
  const cachedJson: CacheEntry | null = cached ? JSON.parse(cached) : null;
  if (cachedJson && isNew(cachedJson.date)) {
    console.log(`Use cache: ${url}`);
    return cachedJson.content;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw Error(
      `fetch failure. status: ${res.status} ${res.statusText}, URL: ${url}`,
    );
  }

  const json: unknown = await res.json();
  localStorage.setItem(
    cachekey,
    JSON.stringify({ date: new Date(), content: json }),
  );
  return json;
}

function isNew(dateString: string): boolean {
  const d = new Date(dateString);
  return new Date().getTime() - d.getTime() < 30 * 60 * 1000;
}

export function formatDateJp(dateString: string): string {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat(
    "ja-JP",
    { year: "numeric", month: "numeric", day: "numeric" },
  ).format(d);
}
