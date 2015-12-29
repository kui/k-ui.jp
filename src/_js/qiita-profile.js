import renderElement from './render-element';
import fetchAsJson from './fetch-as-json';

const BASE_URL = 'https://qiita.com/api/v2';

export default class QiitaProfile {
  constructor(userName, itemsNum) {
    this.userName = userName;
    this.perPage = itemsNum || 5;

    console.log('QiitaProfile: Constructor %o', this);
  }

  async render(srcElement, dstElement) {
    return renderElement(
      srcElement,
      dstElement,
      () => this.fetchModel()
    );
  }

  async fetchModel() {
    const [ profile, items ] = await Promise.all([
      fetchAsJson(`${BASE_URL}/users/${this.userName}`),
      fetchAsJson(`${BASE_URL}/users/${this.userName}/items?per_page=${this.perPage}`)
    ]);

    const m = Object.assign({ items }, profile);
    console.log('QiitaProfile: Model %o', m);
    return m;
  }
}
