---
layout: post
title: "Ubuntu Unity の Launcher で Eclipse のアイコンをちゃんと表示する"
date: 2012-06-14 11:25
comments: true
categories: [eclipse, unbuntu]
---

Ubuntu の左端のランチャーで、Eclipse がちゃんと表示されない。こんな感じ。

![Eclipse アイコンが表示されない Unity Launcher のスクリーンショット](http://k-ui.jp/d/2012-06-14-unknown_icon_eclipse.png)

これはこのままだと登録してもアイコンがこのまま。

そこでこれをどうにかする。


### 手順

端末でこんな感じのコマンドうつ。

```sh
cd ~/.local/share/applications
wget https://gist.github.com/raw/2922285/eclipse.desktop
chmod u+x eclipse.desktop
vim eclipse.desktop
# <ECLIPSE_DIR> を Eclipse のコマンドやアイコンがあるディレクトリに書き換える
xdg-open .
# 現在のカレントディレクトリをファイルブラウザで開き、
# Eclipse をダブルクリックしてみる
```

最初のスクリーンショットの状態で上記の操作をすると、一定時間経過後、
下の画像のようになる。

![Eclipse アイコンがきちんと表示された Unity Launcher のスクリーンショット](http://k-ui.jp/d/2012-06-14-known_icon_eclipse.png)


### 終わり

これは、[Eclipse のサイトからダウンロード](http://www.eclipse.org/downloads/)
したものを実行したせいかもしれない。

`sudo apt-get install eclipse` でインストールしてみると違うのかもしれないが、
ソースコードみたかぎりだと `eclipse.desktop` に `StartupWMClass=Eclipse`
が書いてないので似たような現象が起きるはず。
