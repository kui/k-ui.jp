/// <reference lib="dom" />
import { render as renderQiitaProfile } from "./_js/qiita-profile.ts";
import { render as renderGithubProfile } from "./_js/github-profile.ts";

async function main(): Promise<void> {
  printBanner();
  console.log("main: Waiting for DOMContentLoaded");
  await waitContentLoaded();
  console.log("main: Start");
  await Promise.all([
    renderQiitaProfile(),
    renderGithubProfile(),
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
