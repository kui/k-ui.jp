import 'whatwg-fetch';
import Mustache from 'mustache';
import isString from 'lodash/isString';
import toArray from 'lodash/toArray';

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

export async function renderElement(srcElement, dstElement, fetchModel) {
  if (isString(dstElement)) {
    dstElement = document.querySelector(dstElement);
  }

  if (!dstElement) {
    console.log('Ignore render: not found dstElement');
    return;
  }

  try {
    return render(srcElement, dstElement, fetchModel);
  } catch (e) {
    dstElement.textContent = e.message;
    throw e;
  }
}

async function render(srcElement, dstElement, fetchModel) {
  if (isString(srcElement)) {
    srcElement = document.querySelector(srcElement);
  }

  if (!srcElement) {
    throw Error(`source element not found: ${srcElement}`);
  }

  const model = await fetchModel();
  model.dateformatJp = () => (template, render) => {
    const d = new Date(render(template));
    const f = new Intl.DateTimeFormat(
      'ja-JP',
      { year: 'numeric', month: 'numeric', day: 'numeric' }
    );
    return f.format(d);
  };
  const content = Mustache.render(srcElement.innerHTML, model);
  removeAllChildNodes(dstElement);
  dstElement.insertAdjacentHTML('afterbegin', content);
}

function removeAllChildNodes(element) {
  for (const n of toArray(element.childNodes)) {
    element.removeChild(n);
  }
}
