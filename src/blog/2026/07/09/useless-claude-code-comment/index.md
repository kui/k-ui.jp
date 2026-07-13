---
title: Claude Code の作るコードコメントが虚無なので
date: 2026-07-09T22:40:14.759718018+09:00
---

Claude Code が作る無駄なコメントの問題点と対策


## 問題: ソースコードから新たに情報付与されていないコメント

Claude Code に限らず LLM が生成するソースコードには、ソースコードが実現している事柄をそのままコメントでも出力しているケースがよくある。

無駄コメント実例:

https://github.com/kui/7dtd-map/blob/749d812e090c3ad7f2eaaa0971c50be0b488ad64/lib/map-files.ts#L291-L292

```ts
// Edit in place
copyAndEdit(src, src);
```

これは画像を編集するメソッドだが、メソッド名とその引数でやっていることがわかりコメントは不要。だがLLMはおそらくユーザへの説明のために書いてしまう。

もちろんコードから意図のわかるわからないは人によって違うとは思うが、それはレビュー時点でレビュワーが判断することで基本的にはコードで表明していることをコメントで再表明するのは人間にもAIにも認知負荷にもなるし、無駄なトークンの消費にもなる。

逆に残してほしいコメントもある。例えばソースコードからは読み取れない背景がある実装や、実装内容と同じコメントであってもそれが契約であるケース。

有用コメント実例:

https://github.com/kui/7dtd-map/pull/242/changes#diff-74c66c2b0e239deff33b7215bef1fca1dfab93b7eaa368309a4c7c4e53d76518L200-L204

```ts
    // Batch fill and stroke rects by color into Path2D objects so each unique
    // color requires only two GPU draw calls (fill + stroke) instead of one
    // pair per prefab. A Chrome trace showed CrGpuMain tasks of 300–865 ms
    // during footprint redraws (~10 k ops for 1000 prefabs), stalling the
    // compositor and causing visible slider stutter.
```

これはパフォーマンス最適化という背景があってややこしい運用をしているため補足のためにコメントが生成された。これは残しておかないと人間が無駄な実装として削除したりAIが削除を提案してくる可能性がある。

Claude Code のリポジトリには余計なコメントについてのイシューがたつくらいにはみんな困ってるのかな？

- [MODEL] Claude verbose code comments by default — ignores instructions to stop. https://github.com/anthropics/claude-code/issues/65961

OpenCode も使ってるとこれは特定の LLM モデルの問題というより、ハーネスソフトか LLM の性質そのものという感覚がある。

どのみち LLM が生成するコメントも玉石混交であることは事実で人間がレビューするのも不安定なので、仕組みで解決する。

## 対策: lint でエラーを返し、コメントを消すか、残す価値があると明示させる

今回は deno プロジェクトだったので小さい lint プラグインを作成した:

- https://github.com/kui/7dtd-map/blob/fa983a61ea6b3de7f672523532e7061cc0eb27c1/tools/lint-plugins/require-comment-rationale.ts

コメント冒頭に WHY, HACK, SAFETY, INVARIANT をつけるか jdoc にしないと `deno lint` が失敗するようになる。

LLM はその性質から必ずこれらのキーワードに紐づくコメントを出力するようになるか削除をするようになる。はず。重要なのは削除も選択肢に入れるために、エラーメッセージにそれを含めること。

それぞれのキーワードの用途はそのままの通りだが WHY だけフワッとしていて LLM がどうしても無駄コメント残したくて乱用されてしまう懸念がある。しかしキーワードを増やしすぎるとそれはそれでハルシネーションのもとになりそう。という妥協的な結果。

### 既存プロダクト1: uncomment

https://github.com/Goldziher/uncomment

おおむねよさそうなんだけど `--check` 相当 (`--dry-run` +  non-zero exit code) がない。ラッパースクリプトを書いてもいいがそれを管理するくらいなら試しに自作 lint スクリプトの管理をしてみる。

こっちは tree-sitter を利用しているので多言語に対応しているのが大変なアドバンテージなので、また後日再度参照して開発が続いていてまだ `--check` がないようだったらPRするかな？

### 既存プロダクト2: eslint-plugin-no-comments

https://github.com/wisniewski94/eslint-plugin-no-comments

実装みると今回やったこととあんまり変わりがない。しかし eslint なので使えない。

## おわり

暫くこれで運用してみる。運用してみた所感はまた後日。

