---
layout: post
title: "Octopress テーマの開発"
date: 2011-11-13 17:02
comments: true
categories: [octopress, markdown, sass]
---

[Octopress](http://octopress.org) は、`rake install["theme-name"]` によって、
テーマの切り替えができる。ただ、最初からインストールできるテーマは classic しかないので、
`rake install["classic"]` をする。

今回はこのテーマの開発をしてみた。基本的には上記の `classic` に相当する `.theme/classic`
の `sass` と `source` 以下を参考にした。

残念ながらこの `classic` は、機能と見た目がうまく切り分けられておらず、
今回はその切り分け作業から始まった。（といってもすべてできているわけではないんだけど。。。）

で、できたのが今使ってるテーマ。ソースコードは

[kui/k-ui-octopress-theme - GitHub](https://github.com/kui/k-ui-octopress-theme)

使い方は README.md に書いてある通り。追加機能として tumblr の情報を
表示できるようになっている。

ここから開発方法について。

### HTML ソースの改変

編集対象は `rake install["kui"]` 前なら `.theme/kui/source` 以下の HTML ファイル、
`rake install["kui"]` 後なら `source` ディレクトリ以下の HTML ファイルになる。

注意点としては、`source/_layout/{category_index.html,post.html,page.html}`, 
`_includes/asides*` は、削除すると rake サブコマンドがうまく動かなくなる。
各種 rake サブコマンドが直接読みに行っているファイルの様子。

### sass, scss の変更

css を弄るだけなら、`source/stylesheets` 以下に css ファイルを追加していけばいい。

しかしせっかく Octopress 使ってるからには scss (sass) 使いたい！と思うはず。その場合は、
`sass/_kui.scss` を編集する。これをマッサラにすると、ほとんどスタイルシートが
効いていない状態になる。

編集前に `rake preview` コマンドを実行すると、scss を編集すると自動で css に変換してくれ
かつ localhost:4000 でプレビューができる。便利ですね。

### 以上でした

まだまだ、うまく分離できていない上に、ドキュメントも不十分だけれど少しずつ改変したいと思う。
