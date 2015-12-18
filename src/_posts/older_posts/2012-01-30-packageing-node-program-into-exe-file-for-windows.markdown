---
layout: post
title: "Node プログラムを Windows 実行形式 (.exe) でパッキング"
date: 2012-01-30 08:51
comments: true
categories: ["javascript", "Node", "Windows"]
---

Node で作ったコードを、Windows 実行形式にまとめて配布しやすいようにします。

インタープリタとコードを一緒にパッキングして exe でまとめるソフトウェアは
他もあるようなのですが、今回は Node が用意している仕組みを使います。

手順としては大まかに、2 ステップです。

* Windows 上で Node のビルド環境を整備
* js の配置/設定/ビルド

また対象にしてる Node のバージョンは、0.7.2 です。


### Windows 上で Node のビルド環境を整備

基本的には、[README.md at master from joyent/node - GitHub](https://github.com/joyent/node/blob/master/README.md) を参考に、Node.exe のビルドできるまで行う。

Node.exe をビルドするために必要なシステムは2つ。

* Microsoft Visual C++ 2010 (Express)
	* 無いなら [Microsoft Visual Studio Express](http://www.microsoft.com/japan/msdn/vstudio/express/) でダウンロード
* Git
	* [Cygwin](http://www.cygwin.com/) 入ってるなら Cygwin の setup.exe でインストールできる
	* 無いなら [msysgit](http://code.google.com/p/msysgit/) をインストール
 
はじめに github からソースコード取得する。

```
> git clone https://github.com/joyent/node.git c:\node
```

試しにビルドしてみましょう。"Windows ボタン" -> "すべてのプログラム" -> "Microsoft Visual Studio 2010 Express" -> "Visual Studio コマンド プロンプト" とたどったあとに下記を実行

```
> cd c:\node
> vcbuild.bat release nosign
  # 色々警告でるけどスルーで
> Release\node.exe # <- 実行してみる
> console.log('foo');
foo
undefined
> # Ctrl+D で node 終了
> 
```

Windows の環境変数 Path に、Cygwin へのパスがあるとマズイらしい（要検証、ソース紛失）

### js の配置/設定/ビルド

目的の js ファイルを下記のような foo.js とします。

~~~~~~~~~~~~~~~~~~~~~
console.log('foo');
~~~~~~~~~~~~~~~~~~~~~

先ほど同様、"Visual Studio コマンド プロンプト" で下記を実行。

```
> cd c:\node
> copy どこか\foo.js lib\_third_party_main.js
> start node.gyp
  # 次に示すように修正
> type node.gyp
  ...
	'library_files': [
	  'src/node.js',
	  'lib/_debugger.js',
	  'lib/_linklist.js',
	  'lib/_third_party_main.js',  # ← この行追加!!
	  'lib/assert.js',
  ...
> vcbuild.bat release nosign
  # やっぱり色々警告でるけどスルー
> Release\node.exe
foo
> # <- 対話モードにならずに node が終了することを確認
```

あとは、`node.exe` を適当な名前（この場合は `foo.exe`）にして終了です。

以上です。ただ、これ誰が得するんでしょうね。。。exe 化するとサイズでかくなりすぎるし。
