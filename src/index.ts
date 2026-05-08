/// <reference lib="dom" />
import QiitaProfile from "./_js/qiita-profile.ts";
import GithubProfile from "./_js/github-profile.ts";

async function main(): Promise<void> {
  printBanner();
  console.log("main: Wait DOM content loaded");
  await waitContentLoaded();
  console.log("main: Start");
  await Promise.all([
    new QiitaProfile().render(),
    new GithubProfile().render(),
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

main();
