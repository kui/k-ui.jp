import { fetchAsJson, formatDateJp } from './util';

const BASE_URL = 'https://qiita.com/api/v2';

export default class QiitaProfile {
  constructor(userName, itemsNum = 5) {
    this.userName = userName;
    this.perPage = itemsNum;

    console.log('QiitaProfile: Constructor %o', this);
  }

  async render(templateSelector, containerSelector) {
    const tmpl = document.querySelector(templateSelector);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.log('Ignore render: not found container');
      return;
    }

    try {
      const { items } = await this.fetchModel();
      container.replaceChildren();
      const ul = document.createElement('ul');
      for (const item of items) {
        const clone = tmpl.content.cloneNode(true);
        const a = clone.querySelector('.js-item-link');
        a.href = item.url;
        a.textContent = item.title;
        const time = clone.querySelector('.js-item-date');
        time.dateTime = item.created_at;
        time.textContent = formatDateJp(item.created_at);
        ul.appendChild(clone);
      }
      container.appendChild(ul);
    } catch (e) {
      container.textContent = e.message;
      throw e;
    }
  }

  async fetchModel() {
    const [profile, items] = await Promise.all([
      fetchAsJson(`${BASE_URL}/users/${this.userName}`),
      fetchAsJson(`${BASE_URL}/users/${this.userName}/items?per_page=${this.perPage}`)
    ]);

    const m = Object.assign({ items }, profile);
    console.log('QiitaProfile: Model %o', m);
    return m;
  }
}
