---
title: Deno 所感
date: 2026-07-04T13:49:55.637842041+09:00
---

この[ブログのビルド](https://k-ui.jp)や [7 Days to Die Map Renderer][7dtd-map] は試験的に Deno を利用してビルドやツールの起動をするようにしている。無職になってこの数か月使い続けた所感を書く。

[7dtd-map]: https://kui.github.io/7dtd-map/

## Lint, Formatter に迷わなくてよい、ということはなかった

`deno lint`, `deno fmt` でいいでしょ。逆にここから離れる必要あるなら Deno の利用そのものを考え直したほうがいいかも。

というのが最初の印象だったが、prettier/eslint に比べるとまだ物足りない。

### `deno lint` vs `eslint` + `ts-eslint`

`deno lint` の実装では deno 2.9 の現状では型情報の参照ができない様子。

[Type-aware lints · Issue #1138 · denoland/deno_lint](https://github.com/denoland/deno_lint/issues/1138)

コメントで補足があり「参照できない」は正確ではないが現行バージョンではどちらにせよ利用できない。

### `deno fmt` vs `prettier`

prettier の厳しさが好きだったので deno fmt だと物足りない。

`deno fmt` 適用例

```html
<button title="Clear" data-input-block-filter=""
  data-input-min-matched-block-count="">×</button>
```

手修正して再度 `deno fmt` 適用すると

```html
<button
  title="Clear"
  data-input-block-filter=""
  data-input-min-matched-block-count="">×</button>
```

`prettier` はどう編集しても必ず以下のフォーマットがされる:

```html
<button
  title="Clear"
  data-input-block-filter=""
  data-input-min-matched-block-count=""
>
  ×
</button>
```

人間を信じず心底どうでもよい改行の議論の余地をなるべくなくしたい非人間な運用をしたい身には prettier の強制力が恋しい。

とはいえ textContent の前後に空白文字や改行入れてしまうのは破壊的な変更な気がするけど無効化できるんだろか。

今回に限らず deno は人間を信じるような仕様がいくつかあった気がする。

### `deno check` vs `tsc --noEmit`

ちょっと前なら `deno.jsonc` のほうが設定量が抑えられて幸せだった記憶だけど、[typescript も今や default strict][ts6] なので大差ないかな。

jsonc が使えるのは良い。

[ts6]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html#simple-default-changes

### Biome 的なものを期待していた

lint/fmt/check/bundler で何度も AST 作るの無駄だよね、みたいな問題へのアプローチがあるのかと思ったけどそうではなかった。deno lint は tsgo-lint だし、deno fmt は dprint、deno bundle はまた何か別の何かだった

## パーミッションモデルを使うには強い気持ちかAIが必要

deno はスクリプト実行時に、どのファイルを読んでいいか、書いていいかを宣言する必要がある。これにより意図しない依存関係の挙動によるサプライチェーン攻撃対策になるんだと思う。

`-A` （全部OK的なフラグ）でとりあえずいいか、となってそのままになってしまった。仕事で使うならちゃんとするかも。機能があること自体が大事。

## URL インポートは非推奨とのことで使わなかった

deno.jsonc に書かなくても ts ファイルで依存関係が書けて便利だよねって機能がある。

```ts
import { join } from "jsr:@std/path@0.224.0";
```

これ書き捨てるスクリプトにはいいけど、運用することになったらバージョンの一元化の観点から deno.jsonc に宣言したほうが良い。

deno lint か deno の LSP がこの書き方は非推奨だと警告まで出してくる。

## deno 言語サーバーでしか参照できない警告がある

どの警告か忘れてしまったが、エディタの警告はすべてつぶさないと気が済まない人間にはかなりつらい。言語サーバーでしかでてこないとなると、CI に組み込むのが大変。

## task depencency と cache は良い

タスクの依存関係が表現できるのと、入出力ファイルを定義することで更新のないタスクをスキップする機能があるのは良い。Makefile書くたびに文法忘れるし。

ただこれもメンテナンスが大変なのでパーミッションモデル同様AIアシスタントがあるとよいかも。というかパーミッションモデルとどうきできないかな。

## 次の TypeScript 環境はどうしよう

今のところ Deno らしい使い方ができていないので、ぴったりの用途でない限り次採用するなさそう。パーミッションモデルのために仕事で採用するのはありそう。

Bun も気になって https://github.com/kui/webcomics-rss で使ってみたけど規模が小さすぎてあんまり実感がない。Claudeflare Worker デプロイのための wrangler 使うのに Deno だと互換の不安があるが Bun ならちょうどいいのかもしれない？程度の認識。
