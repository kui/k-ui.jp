import { renderElement, fetchAsJson } from './util';
import toPairs from 'lodash/toPairs';

const BASE_URL = 'https://api.github.com';

export default class GithubProfile {
  constructor(uid, reposNum = 5, options = {}) {
    this.uid = uid;
    this.perPage = reposNum;
    this.opts = options;

    console.log('GithubProfile: Constructor %o', this);
  }

  async render(srcElement, dstElement) {
    return renderElement(
      srcElement,
      dstElement,
      () => this.fetchModel()
    );
  }

  async fetchModel() {
    const query = toPairs(this.opts)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
    const [ profile, repos ] = await Promise.all([
      fetchAsJson(`${BASE_URL}/users/${this.uid}`),
      fetchAsJson(`${BASE_URL}/users/${this.uid}/repos?per_page=${this.perPage}&${query}`)
    ]);

    const m = Object.assign({ repos }, profile);
    console.log('GithubProfile: Model %o', m);
    return m;
  }
}
