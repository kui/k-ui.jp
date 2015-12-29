import "whatwg-fetch";

export default async function fetchAsJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw Error(`fetch failure. status: ${res.status} ${res.statusText}, URL: ${url}`);
  }
  return res.json();
}
