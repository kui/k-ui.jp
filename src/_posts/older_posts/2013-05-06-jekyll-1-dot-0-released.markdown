---
layout: post
title: "Jekyll 1.0 が出た"
date: 2013-05-06 23:40
comments: true
categories: ruby
---

[Jekyll][] の 1.0 がでました。気になった所をメモ。基本的に、何が変わったかは [History.txt][] 見れば書いてあります。

[History.txt]: https://github.com/mojombo/jekyll/blob/master/History.txt
[Jekyll]: https://github.com/mojombo/jekyll

新しいドキュメント
------------------

* <http://jekyllrb.com/>


サブコマンド方式に変更
-----------------------------

* `jekyll build`: サイト生成、以前の引数無し `jekyll` 相当
* `jekyll serve`: サイト作成＋HTTPサーバ、以前の `jekyll --server` 相当。

それぞれのサブコマンドは `-h, --help` でヘルプを見ることもできるようになってます。今風。


jekyll new
-----------------------------

ブログのスケルトンの作成 (Scaffolding) がコマンドでできるようになりました:

```sh
$ ls
$ jekyll new .
 New jekyll site installed in /path/to/current/dir.
$ ls
_config.yml  _layouts/  _posts/  _site/  css/  index.html
$ jekyll serve
# localhost:4000 にアクセスするとスケルトンの閲覧できる。
```


下書き
----------

下書きモードが追加されました。

```sh
$ mkdir _drafts
$ echo '<p>foo' > _drafts/foo.html

$ jekyll build
$ find _site -name foo.html # 生成物に foo.html が作られない

$ jekyll build --drafts
$ find _site -name foo.html # 生成物に foo.html が存在する
```


excerpt
------------

ページ/記事の属性に `excerpt` が追加されました。この属性には、その記事の最初のパラグラフが入っています。
{% raw %}
```sh
$ emacs index.html
# タイトルと一緒に excerpt も表示するように改変
$ diff index.html index.html\~
10c10
<       <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a> post.excerpt</li>
---
>       <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a></li>
$ jekyll serve
# トップページがタイトル一覧に加えて最初のパラグラフも表示するようになっている
```
{% endraw %}

`<meta type="description" ...` に使うのが良さそうなんですが、使い方次第では HTML タグが入ってしまうようなので、 Liquid の `strip_html` が必要になります。

こんな感じ？:

{% raw %}
```html
<meta type="description" content="{{ page.exerpt | strip_html }}">
```
{% endraw %}

ただ、`page.exerpt` と `site.posts` のもつ `post.experpt` が、なんか違うっぽいので要調査です。


おわり
---------

[Octopress][] が持っている機能がインポートされてきてるって印象を受けましたが、これからもたのしみですね。

[Octopress]: http://octopress.org/
