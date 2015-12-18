---
layout: post
title: "WeakHashMap はキャッシュじゃない"
date: 2012-12-25 14:26
comments: true
categories: [java]
---

Java の話。もうすぐ EOL なのに、Java SE 6 を基準に話をします。

__追記__: [ズバリそのものの英語記事][10] あるので、正確なモノを求めるならこちらを参照してください。

Java は標準で [`WeakHashMap`][1] というクラスがあります。
これは、エントリ（キーバリューペア）が [弱参照][2] されているため、
「簡単にキャッシュしたいけど OOM は困る」という時に使われることがあります。

しかし、ふとした機会に `WeakHashMap`、弱参照の仕様を調べたところ、
キャッシュとして使うには不適切な仕様が二点ほどあることが分かりました。
メモ代わりに書いておこうと思います。

`WeakhashMap` をキャッシュとして使うべきじゃない理由としては簡潔に書くと:

* 弱参照を使っている
* 元になる参照はバリューじゃなくてキーである

こんな感じです。順に詳しく説明をします。



### 弱参照を使っている

なんで弱参照使ってるとキャッシュに不適かって言うと、弱参照だと `System.gc()`
されたらすぐに参照先が消えてしまうためです。
なので、キャッシュとして再利用する前に消えてしまう可能性が高すぎるのです。

例えば:

```java
	Map<Object, Object> map = new WeakHashMap<Object, Object>();

	// 強参照を残さず put
	map.put(new String("foo"), new String("bar"));

	System.out.println(map.toString());

	System.out.println("# gc");
	System.gc(); // 明示的に GC

	System.out.println(map.toString());
```

と書き、実行すると:

	before: {foo=bar}
	# gc
	after: {}

というようにアッサリ消えてしまいます。

キャッシュとして使う際に、用いるべき参照は、[ソフト参照 (`SoftReference`)][3] です。

> このクラスの直接のインスタンスは、単純なキャッシュを実装するために使用できます。

ソフト参照に限らず各種参照は JVM の実装に依存する部分が大きいので触れるのは避けます。
しかし、弱参照ほどアッサリ消えず、ヒープに困らなければ消えないことが読み取れます。

各種参照の仕様に関しては、[java.lang.ref][4] やそこから辿ることができる
各種参照のドキュメントを読んでみてください。
（といっても、この javadoc、日本語も英語も説明が微妙なのでググったほうが良いかも）

> 「じゃー `WeakHashMap` 使うのやめて `SoftHashMap` を使えばいいんだね。」
> 
> 「[えっ Java SE に標準で付いて来ない][6]の？じゃあ、`WeakHashMap` コピペして `s/Weak/Soft/` すればいいんでしょ」

となる（なった）のですが、もうひとつの理由が存在するため、そうも行かないことがわかりました。



### 元になる参照がバリューじゃなくてキーである

コレは少しわかりにくいのですが、なんで困るかというと、
*バリューオブジェクトに強参照が残っていても消えてしまう* という点が困ってしまう点です。

例えば:

```java
	Map<Object, Object> map = new WeakHashMap<Object, Object>();

	// 強参照を残さないエントリ。GC 起きると消える。
	map.put(new String("key1"), new String("val1"));

	// キーに強参照を残したエントリ。GC 起きても残る。
	String key2 = new String("key2");
	map.put(key2, new String("val2"));

	// バリューに強参照を残したエントリ。GC 起きると消える。
	String val3 = new String("val3");
	map.put(new String("key3"), val3);

	System.out.println("before: " + map.toString());

	System.out.println("# gc");
	System.gc();

	System.out.println("after: " + map.toString());

	// 試しに値をきちんと引き出してみる
	System.out.println("key1: " + map.get("key1"));
	System.out.println("key2: " + map.get("key2"));
	System.out.println("key3: " + map.get("key3"));
```

コレを実行すると:

	before: {key1=val1, key2=val2, key3=val3}
	# gc
	after: {key2=val2}
	key1: null
	key2: val2
	key3: null

上記の例の `key3` のエントリのように、バリューを強参照してるのに、
キャッシュから消されてしまうのはキャッシュとしてはあまり一般的でない挙動であると思います。


### じゃあどうすればいいの・・・

残念ながら、明確な答えを持ち合わせてません。。。

現状考えられるのは、2つです。

* キャッシュのためのライブラリ（[Ehcache][5] など）を使う
* `Collections.synchronizedMap(new HashMap<Object, SoftReference<Object>>())`

前者は割と身も蓋もない感じなので置いておくとして、後者を使う際には、
「`HashMap` から強参照されたまなのキーオブジェクトと `SoftReference` そのモノは、
ヒープ領域に困っても GC されない」という点に注意しなければならないです。


[1]: http://docs.oracle.com/javase/jp/6/api/java/util/WeakHashMap.html "クラス WeakHashMap<K,V> (Java Platform SE 6)"
[2]: http://docs.oracle.com/javase/jp/6/api/java/lang/ref/WeakReference.html "クラス WeakReference<T> (Java Platform SE 6)"
[3]: http://docs.oracle.com/javase/jp/6/api/java/lang/ref/SoftReference.html "クラス SoftReference<T> (Java Platform SE 6)"
[4]: http://docs.oracle.com/javase/jp/6/api/java/lang/ref/package-summary.html "パッケージ java.lang.ref (Java Platform SE 6)"
[5]: http://ehcache.org/ "Ehcache | Performance at Any Scale"
[6]: https://www.google.co.jp/search?q=%22SoftHashMap%22+site%3Adocs.oracle.com%2Fjavase%2Fjp%2F6%2Fapi%2F "SoftHashMap site:docs.oracle.com/javase/jp/6/api/ - Google 検索"
[10]: http://www.codeinstructions.com/2008/09/weakhashmap-is-not-cache-understanding.html "Code Instructions: WeakHashMap is not a cache! Understanding WeakReference and SoftReference"
