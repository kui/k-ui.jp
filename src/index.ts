/// <reference lib="dom" />
import QiitaProfile from "./_js/qiita-profile.ts";
import GithubProfile from "./_js/github-profile.ts";

declare global {
  var topJs: { qiitaId: string; githubId: string } | undefined;
}

async function main(): Promise<void> {
  if (!globalThis.topJs) {
    console.error('main: Abort: "topJs" not found');
    return;
  }
  const { qiitaId, githubId } = globalThis.topJs;
  printBanner();
  console.log("main: Wait DOM content loaded");
  await waitContentLoaded();
  console.log("main: Start");
  await Promise.all([
    renderQiitaProfile(qiitaId),
    renderGithubProfile(githubId),
  ]);
  console.log("main: Done");
}

function printBanner(): void {
  const a = [
    " _                  _      _        ",
    "| | __       _   _ (_)    (_) _ __  ",
    "| |/ /_____ | | | || |    | || '_ \\ ",
    "|   <|_____|| |_| || | _  | || |_) |",
    "|_|\\_\\       \\__,_||_|(_)_/ || .__/ ",
    "                        |__/ |_|    ",
  ].join("\n");
  console.log(a);
}

function waitContentLoaded(): Promise<void> {
  return new Promise((resolve) => {
    const readyState = document.readyState;
    if (readyState === "interactive" || readyState === "complete") {
      resolve();
    } else {
      addEventListener("DOMContentLoaded", () => resolve());
    }
  });
}

async function renderQiitaProfile(uid: string): Promise<void> {
  const qiitaProfile = new QiitaProfile(uid, 5);
  await qiitaProfile.render("#js-qiita-profile-template", "#js-qiita-profile");
}

async function renderGithubProfile(uid: string): Promise<void> {
  const githubProfile = new GithubProfile(uid, 5, {
    type: "all",
    sort: "pushed",
    direction: "desc",
  });
  await githubProfile.render(
    "#js-github-profile-template",
    "#js-github-profile",
  );
}

main();
