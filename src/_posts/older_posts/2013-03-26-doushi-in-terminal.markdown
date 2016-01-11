---
layout: post
title: "ターミナルに FF3 の導師"
date: 2013-03-26 23:29
comments: true
categories: terminal
---

![実行例](/assets/2013/03/doushi.png)

元ネタはこちら:

* [vallog: ターミナルに黒魔道士][origin]

これに、[割と人気のある（？）][1] FF3 の導師データを追加した: 

* <https://gist.github.com/kui/5245790>

白魔道士の色を自分の好みのものに変更もしている。

[1]: https://www.google.co.jp/search?q=%22%E5%B0%8E%E5%B8%AB%E5%A4%9A%E7%99%BA%E3%83%86%E3%83%AD%22

### 試しに実行してみる

連結したものの実行は、[valvallow さんのエントリ][origin]を参考していただくとして、
「Gauche をこのためだけに入れるの嫌だけど表示はしたい」
って場合は:

```sh
# 導師のデータをダウンロード
wget https://gist.github.com/kui/5245790/raw/doushi.dat

# 導師の表示
ruby -ne 'print $_.gsub(/ /){"  "}.gsub(/\d/){"\e[4#{$&}m  \e[0m"}' dousi.dat
# もしくは
ruby -ne 'print $_.gsub(/ /){"0"}.gsub(/\d/){"\e[4#{$&}m  \e[0m"}' dousi.dat
```

で ruby があれば実行できる。perl や python でも似たようなワンライナ書けるはず。

本当は <s>もちろんさん</s> 瀕死の白魔道士が可愛いんだけど・・・


[origin]: http://valvallow.blogspot.jp/2013/03/blog-post.html "vallog: ターミナルに黒魔道士"
