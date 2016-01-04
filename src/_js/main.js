import QiitaProfile from './lib/qiita-profile';
import GitHubProfile from './lib/github-profile';

export default async function main({ qiitaId, githubId }) {
  printBanner();
  console.log('main: Wait DOM content loaded');
  await waitContentLoaded();
  console.log('main: Start');
  await Promise.all([
    renderQiitaProfile(qiitaId),
    renderGithubProfile(githubId),
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

async function renderQiitaProfile(uid) {
  const srcElement = '#js-qiita-profile-source';
  const dstElement = '#js-qiita-profile';
  const qiitaProfile = new QiitaProfile(uid, 5);
  await qiitaProfile.render(srcElement, dstElement);
}

async function renderGithubProfile(uid) {
  const srcElement = '#js-github-profile-source';
  const dstElement = '#js-github-profile';

  const qiitaProfile = new GitHubProfile(uid, 5, {
    // see https://developer.github.com/v3/repos/#list-user-repositories
    type: 'all',
    sort: 'pushed',
    direction: 'desc',
  });
  await qiitaProfile.render(srcElement, dstElement);
}
