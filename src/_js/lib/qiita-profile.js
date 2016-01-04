import { renderElement, fetchAsJson } from './util';

const BASE_URL = 'https://qiita.com/api/v2';

export default class QiitaProfile {
  constructor(userName, itemsNum = 5) {
    this.userName = userName;
    this.perPage = itemsNum;

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
