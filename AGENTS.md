# Rules

- 新しいソフトウェア（Deno、GitHub Actions、npm パッケージなど）に依存するときは、必ず最新バージョンを使用すること。
- Deno のバージョンは mise で管理しているため、Deno を実行するときは `mise x deno -- <command>` または `mise exec -- deno <command>` を利用すること。
- 関連する変更・生成をしたら、`mise exec -- deno fmt`、`mise exec -- deno check`、`mise exec -- deno lint`、`mise exec -- deno task build` を実行してからユーザーに応答を返すこと。
