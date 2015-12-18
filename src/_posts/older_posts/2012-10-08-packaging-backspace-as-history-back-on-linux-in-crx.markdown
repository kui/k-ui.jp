---
layout: post
title: "バックスペースをブラウザ「戻る」にバインドするやつの拡張機能"
date: 2012-10-08 18:34
comments: true
categories: [coffescript, javascript, node]
---

[以前作ったユーザスクリプト](http://k-ui.jp/blog/2012/06/14/backspace-as-browser-hhistory-back-on-linux-google-chrome/ "Linux 版 Google Chrome で、バックスペースをブラウザの「戻る」として使う - 電卓片手に") を拡張機能にしました。

* [Backspace-as-History-Back-on-Linux.crx](http://k-ui.jp/d/Backspace-as-History-Back-on-Linux.crx)

### インストール方法

いつからのバージョンからか、野良拡張機能、ユーザスクリプトのインストールには[ひと手間必要になりました。](http://support.google.com/chrome_webstore/bin/answer.py?hl=ja&answer=2664769)

1. [crx をダウンロード](http://k-ui.jp/d/Backspace-as-History-Back-on-Linux.crx)
2. 拡張機能のページを開く
3. ダウンロードした crx ファイルを拡張機能ページにドラッグ&ドロップ
4. **インストール** をクリック

### おわり

[Knavi を CoffeeScript に書き換えてる](https://github.com/kui/KNavi) 最中にできた [Cakefile](https://github.com/kui/KNavi/blob/master/Cakefile) の出来を調べたくて拡張機能化してみた。すんなりできたので問題なさそう。

加えて、Octopress の使い方忘れそうだったので更新した。忘れてしまいそうってことは合ってないってことかもしれない・・・

