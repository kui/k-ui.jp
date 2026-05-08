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
  async render(): Promise<void> {
    const tmpls = document.querySelectorAll<HTMLTemplateElement>(
      "[data-github-id]",
    );
    await Promise.all(Array.from(tmpls).map((tmpl) => this.renderOne(tmpl)));
  }

  private async renderOne(tmpl: HTMLTemplateElement): Promise<void> {
    const uid = tmpl.dataset.githubId;
    const mountpoint = tmpl.dataset.mountPoint;
    const perPage = Number(tmpl.dataset.itemsNum ?? 5);
    const opts: RepoQueryOptions = {};
    if (tmpl.dataset.repoType) opts.type = tmpl.dataset.repoType;
    if (tmpl.dataset.repoSort) opts.sort = tmpl.dataset.repoSort;
    if (tmpl.dataset.repoDirection) opts.direction = tmpl.dataset.repoDirection;
    const containers = mountpoint
      ? Array.from(document.querySelectorAll(mountpoint))
      : [];
    if (!uid || containers.length === 0) {
      console.log("Ignore render: not found uid or container");
      return;
    }

    let repos: GithubRepo[];
    try {
      repos = await this.fetchRepos(uid, perPage, opts);
    } catch (e) {
      for (const container of containers) {
        container.textContent = (e as Error).message;
      }
      throw e;
    }
    for (const container of containers) {
      container.replaceChildren();
      const ul = document.createElement("ul");
      for (const repo of repos) {
        const clone = tmpl.content.cloneNode(true) as DocumentFragment;
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
    }
  }

  private async fetchRepos(
    uid: string,
    perPage: number,
    opts: RepoQueryOptions,
  ): Promise<GithubRepo[]> {
    const query = Object.entries(opts)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const repos = await fetchAsJson(
      `${BASE_URL}/users/${uid}/repos?per_page=${perPage}&${query}`,
    );
    console.log("GithubProfile: repos %o", repos);
    return repos as GithubRepo[];
  }
}
