# k-ui.jp

<k-ui.jp> のソースコード

## ブログ投稿手順

ブラウザのみで投稿:

1. [New Post](https://github.com/kui/k-ui.jp/actions/workflows/new-post.yml) を開く
2. 必要な情報を入力し "Run workflow" をクリック
3. workflow が完了すると自動的に PR が作成
4. PR に書かれた github.dev へのリンクを開いて編集
5. 編集が完了したらコミット＆プッシュ
6. PR ページで CI の結果を確認・プレビュー
7. 問題なければマージして投稿

CLI のみでも投稿できる:

```sh
# 新規記事作成
deno task new-post

# 編集
editor ...

# プレビュー
deno task build
deno task serve

# もしくは post/* ブランチを作成して master 宛に PR を作成すると Cloudflare Pages でプレビュー用のページが用意される

# フォーマット
deno fmt

# master ブランチにプッシュすると公開
git commit -am "..."
git push
```

## 品質チェック

```sh
deno fmt
deno check
deno lint
```
