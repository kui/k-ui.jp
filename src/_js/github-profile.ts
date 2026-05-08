/// <reference lib="dom" />
import { fetchAsJson, formatDateJp } from "./util.ts";

const BASE_URL = "https://api.github.com";

interface GithubRepo {
  html_url: string;
  name: string;
  description: string | null;
  pushed_at: string;
}

type RepoQueryOptions = Record<string, string>;

export default class GithubProfile {
  private uid: string;
  private perPage: number;
  private opts: RepoQueryOptions;

  constructor(uid: string, reposNum = 5, options: RepoQueryOptions = {}) {
    this.uid = uid;
    this.perPage = reposNum;
    this.opts = options;

    console.log("GithubProfile: Constructor %o", this);
  }

  async render(
    templateSelector: string,
    containerSelector: string,
  ): Promise<void> {
    const tmpl = document.querySelector<HTMLTemplateElement>(templateSelector);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.log("Ignore render: not found container");
      return;
    }

    try {
      const repos = await this.fetchRepos();
      container.replaceChildren();
      const ul = document.createElement("ul");
      for (const repo of repos) {
        const clone = tmpl!.content.cloneNode(true) as DocumentFragment;
        const a = clone.querySelector<HTMLAnchorElement>(".js-repo-link")!;
        a.href = repo.html_url;
        a.textContent = repo.name;
        clone.querySelector(".js-repo-desc")!.textContent = repo.description ??
          "";
        const time = clone.querySelector<HTMLTimeElement>(".js-repo-pushed")!;
        time.dateTime = repo.pushed_at;
        time.textContent = formatDateJp(repo.pushed_at);
        ul.appendChild(clone);
      }
      container.appendChild(ul);
    } catch (e) {
      container.textContent = (e as Error).message;
      throw e;
    }
  }

  private async fetchRepos(): Promise<GithubRepo[]> {
    const query = Object.entries(this.opts)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const repos = await fetchAsJson(
      `${BASE_URL}/users/${this.uid}/repos?per_page=${this.perPage}&${query}`,
    );
    console.log("GithubProfile: repos %o", repos);
    return repos as GithubRepo[];
  }
}
