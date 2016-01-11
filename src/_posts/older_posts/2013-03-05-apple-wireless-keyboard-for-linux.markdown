---
layout: post
title: "Linux で Apple Wireless Keyboard 使う"
date: 2013-03-05 21:48
comments: true
categories: [linux, keyboard]
---

**tl;dr** Apple Wireless Keyboard の Fn キーが機能してなかったので
既存のドライバに [手を加えたものを作った][hid-apple]。

Linux でデスクトップ環境使ってるくせに、Apple Wireless Keyboard と
Magic Trackpad を合体して使う [BulletTrain の Express][Express]
を買ってしまった。

![Express の画像](/assets/2013/03/express.jpg)

↑こんな見た目。同じ合体でも [MagicWand][] みたいに横並びのやつより、
ノート PC みたいな配置が欲しかったので Express にしました。

[hid-apple]: https://github.com/kui/hid-apple "kui/hid-apple · GitHub"
[Express]: http://www.bullettrain.com/express.html "Express | Features "
[MagicWand]: https://www.google.co.jp/search?channel=fs&q=MagicWand%20TWS-KY-000001&oe=utf-8&hl=ja&um=1&ie=UTF-8&tbm=isch] "キーボード トラックパッド 合体 - Google 検索"




### Apple Wireless Keyboard

Fn キーが効かない。。。

英語配列の Apple Wireless Keyboard を買ったのですが、これが Linux だと
Bluetooth 一般キーボードとして認識されてしまい、Fn キー周りをきちんと
解決してくれない。

ちなみにこんな環境:

```sh
$ uname -mrs
Linux 3.2.0-38-generic x86_64
$ lsinput
 ...
/dev/input/event13
   bustype : BUS_BLUETOOTH
   vendor  : 0x5ac
   product : 0x255
   version : 80
   name    : "..."
   phys    : "xx:xx:xx:xx:xx:xx"
   uniq    : "xx:xx:xx:xx:xx:xx"
   bits ev : EV_SYN EV_KEY EV_ABS EV_MSC EV_LED EV_REP
 ...
```

仕方が無いので、既存の Apple キーボードドライバに手を加えた:

* kui/hid-apple · GitHub <https://github.com/kui/hid-apple>

今回買ったキーボードの vendor, product を認識してくれるようにしただけです。

Magic Trackpad は割と苦労したので、別エントリにします。
