---
layout: post
title: "Linux 版 Google Chrome で、バックスペースをブラウザの「戻る」として使う"
date: 2012-06-14 01:50
comments: true
categories: [coffeescript, javascript, node ]
---

[前回の投稿](http://k-ui.jp/blog/2012/06/06/rbindkeys-configurable-key-remapper-in-ruby/)
に引き続き、Ubuntu によるデスクトップ環境を整えてる。

Linux 版 Google Chrome (or Chromium) を使っていると、バックスペースで
ブラウザ右上のボタンの「戻る」相当の挙動ができないのが非常に辛い。

なので、それ相当の機能を作った。

「拡張機能同期が発動して、Win, Mac 環境に影響与える」 みたいなのを避けたいし、
拡張機能にするほど大げさな機能でもないかと思い、ユーザスクリプトにしている。

### インストール

[backspace_as_browser_back_on_linux.user.js](http://k-ui.jp/d/backspace_as_browser_back_on_linux.user.js)
をクリックすると、下から生えてくるバーで何やら聞かれるので「続行」を押す。

### どうして XXX 使わなかったの？

類似のものあるんだけど、今回の用途には合わなかった。

[Keyconfig](https://chrome.google.com/webstore/detail/okneonigbfnolfkmfgjmaeniipdjkgkl?hl=ja)
を使えばそれ相当のことが実現できるんだろうけれど、同様の機能は、
[前回の投稿のキーリマッパー](http://k-ui.jp/blog/2012/06/06/rbindkeys-configurable-key-remapper-in-ruby/)
と昔作った [knavi](https://chrome.google.com/webstore/detail/pfcgnkljgjobpkbgcifmpnhglafhkifg)
で実現してしまっているため、Keyconfig が大げさになってしまう。
（そもそも Keyconfig の HaH 機能に不満があって knavi 作ったんだけど。）

[Backspace As Back for Linux](http://www.chromeextensions.org/appearance-functioning/backspace-as-back-for-linux-2/)
という名前がズバリそのものな拡張機能があるので、どうだろうと手を出してみたが、
問題点がいくつかあった。

1. 拡張機能同期されてしまった時に Mac のGoogle Chrome で妙な挙動をとってしまう
2. contenteditable な div 要素などにフォーカスが当たってると、「戻る」が
   機能してしまう
3. ソースコード読んでみたら、どうやら利用統計データを送信してるっぽい

### ほかの理由

上記のように、既存のものに不満があったことに加えて、「CoffeeScript による
ユーザスクリプトの開発をしたかった」というのも理由だったりする。

* [kui/Backspace-as-History-Back-on-Linux - Github](https://github.com/kui/Backspace-as-History-Back-on-Linux)

CoffeeScript で BDD するのに [mocha](http://visionmedia.github.com/mocha/)、
history.back などのモックに [sinon](http://sinonjs.org/) を使った。

色々苦労があったのだけれど、それはまた別の記事にできたらなぁとおもう。
