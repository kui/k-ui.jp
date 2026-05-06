export async function fetchAsJson(url) {
  const cachekey = `fetch-cache-${url}`;
  const cache = localStorage[cachekey];
  const cachedJson = cache && JSON.parse(cache);
  if (cachedJson && isNew(cachedJson.date)) {
    console.log(`Use cache: ${url}`);
    return cachedJson.content;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw Error(`fetch failure. status: ${res.status} ${res.statusText}, URL: ${url}`);
  }

  const json = await res.json();
  localStorage[cachekey] = JSON.stringify({
    date: new Date(),
    content: json
  });
  return json;
}

function isNew(dateString) {
  const d = new Date(dateString);
  return new Date().getTime() - d.getTime() < 30 * 60 * 1000;
}

export function formatDateJp(dateString) {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat(
    'ja-JP',
    { year: 'numeric', month: 'numeric', day: 'numeric' }
  ).format(d);
}
