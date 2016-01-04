---
---

import main from './src/_js/main.js';

main({
  qiitaId:  '{{ site.qiita_id }}',
  githubId: '{{ site.github_id }}',
}).catch(e => console.error(e));
