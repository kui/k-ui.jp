---
---

import QiitaProfile from './src/_js/qiita-profile';
import GitHubProfile from './src/_js/github-profile';

const QIITA_ID = '{{ site.qiita_id }}';
const GITHUB_ID = '{{ site.github_id }}';

async function main() {
  printBanner();
  console.log('main: Wait DOM content loaded');
  await waitContentLoaded();
  console.log('main: Start');
  await Promise.all([
    renderQiitaProfile(),
    renderGithubProfile(),
  ]);
  console.log('main: Done');
}

function printBanner() {
  const a = [
    ' _                  _      _        ',
    '| | __       _   _ (_)    (_) _ __  ',
    '| |/ /_____ | | | || |    | || \'_ \\ ',
    '|   <|_____|| |_| || | _  | || |_) |',
    '|_|\\_\\       \\__,_||_|(_)_/ || .__/ ',
    '                        |__/ |_|    ',
  ].join('\n')
  console.log(a);
}

async function waitContentLoaded() {
  return new Promise(function (resolve, reject) {
    const readyState = document.readyState;
    if (readyState === 'interactive' || readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('DOMContentLoaded', resolve);
    }
  });
}

async function renderQiitaProfile() {
  const srcElement = '#js-qiita-profile-source';
  const dstElement = '#js-qiita-profile';
  const qiitaProfile = new QiitaProfile(QIITA_ID, 5);
  await qiitaProfile.render(srcElement, dstElement);
}

async function renderGithubProfile() {
  const srcElement = '#js-github-profile-source';
  const dstElement = '#js-github-profile';

  const qiitaProfile = new GitHubProfile(GITHUB_ID, 5, {
    // see https://developer.github.com/v3/repos/#list-user-repositories
    type: 'all',
    sort: 'pushed',
    direction: 'desc',
  });
  await qiitaProfile.render(srcElement, dstElement);
}

main().catch(e => console.error(e));
