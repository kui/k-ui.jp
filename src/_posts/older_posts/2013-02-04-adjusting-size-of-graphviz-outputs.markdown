---
layout: post
title: "Graphviz 出力のサイズを調節する方法"
date: 2013-02-04 13:06
comments: true
categories: graphviz
---

Graphviz の標準の出力サイズだと少し大きめだと感じる人が
そこそこ存在するようなので、簡単にまとめます。

Graphviz 出力結果のサイズを調節する方法は幾つか存在します。
リストアップしてしまうと:

* グラフ属性 `size` の指定
* グラフ属性 `dpi` の指定
* その他
  * フォントサイズの指定
  * ノードの間隔を詰める
  * 不要なボーダーを消す
  * グラフの向きを返る

基本的に `size` か `dpi` の指定でどうにかなります。

ただし、両方使うとわけがわからなくなるので、どちらか一方の指定で良いと思います。

この Graphviz を例に、詳しく書きます。

	graph g{
	editor -- Emacs;
	editor -- SublimeText;
	editor -- vim;
	editor -- nano;
	editor -- TextMate;
	}

出力結果:

{% graphviz %}
graph g{
editor -- Emacs;
editor -- SublimeText;
editor -- vim;
editor -- nano;
editor -- TextMate;
}
{% endgraphviz %}

出力結果も [octopress-graphviz][] を使って載せられると良いのですが、
svg で出力してしまうとうまく行かないものも幾つかありました。

[octopress-graphviz]: https://github.com/kui/octopress-graphviz "kui/octopress-graphviz · GitHub"

### グラフ属性 `size` の指定

グラフ属性 `size` を指定します。`size="10"` や `size="10,5"` という感じの
指定方法になります。

これは、出力結果の最大インチ幅（後者は幅、高さ）を指定する属性になります。
ただし指定しているサイズの単位は **インチ** なので、
日本人にはよくわからないですね。

用例:

	graph g{
	# 最大横幅を 5 インチ
	size="5"
	# 最大縦横の指定は
	# size="5,6"
	editor -- Emacs;
	editor -- SublimeText;
	editor -- vim;
	editor -- nano;
	editor -- TextMate;
	}

出力結果は、octopress-graphviz だとうまく反映されなかったので載せません。
どうやら、svg 形式の出力だと反映されないようです。
png 形式うまく行くことを確認しました。

### グラフ属性 `dpi` の指定

グラフ属性 `dpi` を指定します。`dpi="60.0"` という書き方になります。

この属性は、1 インチ辺りのピクセル数の指定になります。こちらは `size` と違い、
デフォルト値が 96.0 と決まっているので、「3分の2くらいにしたいな」と
思ったら、`dpi="62"` と指定すればよいのでとてもわかり易いですね。

用例:

	graph g{
	# 半分のサイズに
	dpi="48";
	editor -- Emacs;
	editor -- SublimeText;
	editor -- vim;
	editor -- nano;
	editor -- TextMate;
	}

出力結果:

{% graphviz %}
graph g{
dpi="48";
editor -- Emacs;
editor -- SublimeText;
editor -- vim;
editor -- nano;
editor -- TextMate;
}
{% endgraphviz %}

### その他

基本的には [StackOverFlow のソレっぽいエントリ][sof] を参考にして頂ければ問題無いです。

> * **reduce the minimum separation between nodes**, via 'nodesep'; e.g., nodes[nodesep=0.75]; this will make your graph being "too compact." (nodesep and ranksep probably affect how dot draws a graph more than any other adjustable parameter)
> * **reduce the minimum distance between nodes of different ranks**, e.g, nodes[ranksep=0.75]; 'ranksep' sets the minimum distance between nodes of different ranks--this will affect your graph layout significantly if your graph is comprised of many ranks
> * **increase the edge weights**, eg, edges[weight=1.2]; this will make the edges shorter, in turn making the entire graph more compact
> * **remove node borders and node fill**, e.g., nodes[color=none; shape=plaintext], especially for oval-shaped nodes, a substantial fraction of the total node space is 'unused' (ie, not used to display the node label); each node's footprint is now reduced to just its text
> * **explicitly set the font size for the nodes** (the node borders are enlarged so that they surround the node text, which means that the font size and amount of text for a given node has a significant effect on its size); [fontsize=11] should be large enough to be legible yet also reduce the 'cluttered' appearance (the default size is 14)
> * **use different colors for nodes and edges** -- this will make your graph easier to read; e.g., set the node 'text' fontcolor to blue and the edge fontcolor to "grey" to help the eye distinguish the two sets of graph structures. This will make a bigger difference than you might think.
> * **explicitly set total graph size**, eg, graph[size="7.75,10.25] (ensures that your graph fits on an 8.5 x 11 page and that it occupies the entire space)
>
> via: [Reducing graph size in graphviz - Stack Overflow][sof]

[sof]: http://stackoverflow.com/questions/3428448/reducing-graph-size-in-graphviz "Reducing graph size in graphviz - Stack Overflow"

これらのサイズ調整は、フォントサイズの指定やノードサイズの指定を組み合わせることで効果を発揮しますが、
見た目が大きく変わってしまう可能性が高いです。

### 少し違うアプローチ

例のように、ノードが幾つか横並びしているグラフは、グラフ属性 `rankdir`で、
グラフの向きを変えると良いです。

用例(`rankdir=LR`):

	graph g{
	rankdir=LR;
	editor -- Emacs;
	editor -- SublimeText;
	editor -- vim;
	editor -- nano;
	editor -- TextMate;
	}

出力結果（左から右に）:

{% graphviz %}
graph g{
rankdir=LR;
editor -- Emacs;
editor -- SublimeText;
editor -- vim;
editor -- nano;
editor -- TextMate;
}
{% endgraphviz %}

用例(`rankdir=RL`):

	graph g{
	rankdir=RL;
	editor -- Emacs;
	editor -- SublimeText;
	editor -- vim;
	editor -- nano;
	editor -- TextMate;
	}

出力結果（右から左に）:

{% graphviz %}
graph g{
rankdir=RL;
editor -- Emacs;
editor-- SublimeText;
editor -- vim;
editor -- nano;
editor -- TextMate;
}
{% endgraphviz %}

以上です。

他にこんな方法あるよ！ってコメントお待ちしてます。
