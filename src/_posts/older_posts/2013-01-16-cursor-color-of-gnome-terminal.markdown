---
layout: post
title: "gnome-terminal のカーソルの色を変更"
date: 2013-01-16 15:49
comments: true
categories:
---

端末で:

```sh
$ echo -ne '\e]12;#009900\a'
```

`#009900` 部分は、CSS の色の指定方法と同じで `#RRGGBB` で指定する。

これ、xterm 由来の仕様らしい。その影響か、GNU screen 上で実行しても
うまくできないので注意。tmux は知らない。

なので、`.zshrc`/`.bashrc`に書くといいかも。

`.{z,ba}shrc`:

```sh
...
# カーソルの色指定（暗めの緑色）
echo -ne '\e]12;#009900\a'
...
```

残念ながらカーソルの前景色の指定がわからなかった。。。

本当は gnome-terminal のカラースキーム設定で一緒に設定できるのが
一番楽なんだけどなー
