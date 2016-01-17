import 'whatwg-fetch';
import Mustache from 'mustache';
import isString from 'lodash/isString';
import toArray from 'lodash/toArray';

export async function fetchAsJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw Error(`fetch failure. status: ${res.status} ${res.statusText}, URL: ${url}`);
  }
  return res.json();
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
