import { fetchAsJson, formatDateJp } from './util';

const BASE_URL = 'https://api.github.com';

export default class GithubProfile {
  constructor(uid, reposNum = 5, options = {}) {
    this.uid = uid;
    this.perPage = reposNum;
    this.opts = options;

    console.log('GithubProfile: Constructor %o', this);
  }

  async render(templateSelector, containerSelector) {
    const tmpl = document.querySelector(templateSelector);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.log('Ignore render: not found container');
      return;
    }

    try {
      const { repos } = await this.fetchModel();
      container.replaceChildren();
      const ul = document.createElement('ul');
      for (const repo of repos) {
        const clone = tmpl.content.cloneNode(true);
        const a = clone.querySelector('.js-repo-link');
        a.href = repo.html_url;
        a.textContent = repo.name;
        clone.querySelector('.js-repo-desc').textContent = repo.description ?? '';
        const time = clone.querySelector('.js-repo-pushed');
        time.dateTime = repo.pushed_at;
        time.textContent = formatDateJp(repo.pushed_at);
        ul.appendChild(clone);
      }
      container.appendChild(ul);
    } catch (e) {
      container.textContent = e.message;
      throw e;
    }
  }

  async fetchModel() {
    const query = Object.entries(this.opts)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const [profile, repos] = await Promise.all([
      fetchAsJson(`${BASE_URL}/users/${this.uid}`),
      fetchAsJson(`${BASE_URL}/users/${this.uid}/repos?per_page=${this.perPage}&${query}`)
    ]);

    const m = Object.assign({ repos }, profile);
    console.log('GithubProfile: Model %o', m);
    return m;
  }
}
