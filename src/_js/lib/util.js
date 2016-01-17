import "whatwg-fetch";
// import handlebars from 'handlebars';
import Ractive from 'ractive';
import isString from 'lodash/isString';
import toArray from 'lodash/toArray';

Ractive.DEBUG = false;

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

// handlebars.registerHelper('dateformat', (isoString, locale, options) => {
//   const d = new Date(isoString);
//   const f = new Intl.DateTimeFormat(locale, options.hash);
//   return f.format(d);
// });

// async function render(srcElement, dstElement, fetchModel) {
//     if (isString(srcElement)) {
//       srcElement = document.querySelector(srcElement);
//     }

//     if (!srcElement) {
//       throw Error(`source element not found: ${srcElement}`);
//     }

//     const model = await fetchModel();

//     const src = srcElement.innerHTML;
//     const template = handlebars.compile(src);

//     const content = template(model);

//     removeAllChildNodes(dstElement);

//     dstElement.insertAdjacentHTML('afterbegin', content);

//     return content;
// }

async function render(srcElement, dstElement, fetchModel) {
  if (isString(srcElement)) {
    srcElement = document.querySelector(srcElement);
  }

  if (!srcElement) {
    throw Error(`source element not found: ${srcElement}`);
  }

  const model = await fetchModel();
  model.dateformat = (isoString, locale, opts) => {
    const d = new Date(isoString);
    const f = new Intl.DateTimeFormat(locale, opts);
    return f.format(d);
  }

  new Ractive({
    el: dstElement,
    template: srcElement.innerHTML,
    data: model
  });
}

function removeAllChildNodes(element) {
  for (const n of toArray(element.childNodes)) {
    element.removeChild(n);
  }
}
