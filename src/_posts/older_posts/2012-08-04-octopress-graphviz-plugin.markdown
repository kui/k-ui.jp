---
layout: post
title: "Octopress/Jekyll でテキストだけでグラフを書くプラグイン作った"
date: 2012-08-04 05:58
comments: true
categories: 
---

Octopress や Jekyll を使って、markdown などでブログエントリ書くことで、
謎ショートカットキーなどを使わないとテキストの修飾が出来ずセマンティックな
情報が失われがちで、ひどいソースコードを垂れ流す WYSIWIG から解放された。

しかし、簡単な有向グラフを用いてフロー図書いたりするには、結局、ペイント
など画像編集ソフトや Office ソフトなどに頼る必要があり、キーボードから
手を離す機会が増えて大変苦痛だった。

なので、テキストベースで有向/無向グラフが作成できる
[Graphviz](http://www.graphviz.org/) を、Octopress で利用できるような
プラグインを作成した。

[kui/octopress-graphviz](https://github.com/kui/octopress-graphviz)

### サンプル

こう書く:

```
{{ "{" }}% graph 無向グラフサンプル %}
a -- b
b -- c
c -- a
{{ "{" }}% endgraph %}
```

そうすると、Octopress はこんな感じのグラフに置換してくれる: 

{% graph 無向グラフサンプル %}
a -- b
b -- c
c -- a
{% endgraph %}

有向グラフも書ける:

```
{{ "{" }}% digraph 有向グラフサンプル %}
a -> b -> c -> a -> c
{{ "{" }}% enddigraph %}
```

こうなる:

{% digraph 有向グラフサンプル %}
a -> b -> c -> a -> c
{% enddigraph %}

インストール方法は
[kui/octopress-graphviz](https://github.com/kui/octopress-graphviz)
を参考にしてみてください。

特徴としては:

* インライン svg 要素によるグラフ
	* わざわざ画像生成して img 要素でリンクするとファイル増えるので
	* 上の図の HTML 要素やソースコードを確認してみてください。
* インライン SVG 向けの Altnative Text も用意してる
	* ただ、インライン SVG を解釈できないブラウザでどうなるかは未確認

といったところでしょうか。

[こういうようなこと](http://daftbeats.tumblr.com/post/28651724772) もできる: 

{% digraph わいせつな画像！！ %}
a [label="仕事のストレス"]
b [label="わいせつなビデオを見る"]
c [label="わいせつなビデオを見る"]
d [label="わいせつなビデオを見る"]
e [label="わいせつなビデオを見る", shape=tripleoctagon]
a -> b -> c -> d -> e
a -> c -> e [style=invis]
{% enddigraph %}

これでわかるように Graphviz は細かいノード配置調節は苦手だったりします。
