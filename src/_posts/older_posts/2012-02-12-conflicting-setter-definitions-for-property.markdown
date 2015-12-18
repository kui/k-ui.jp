---
layout: post
title: "Jackson がデシリアライズしてくれない"
date: 2012-02-12 02:35
comments: true
categories: ["java", "json"]
---

例えば、こんな POJO を、Jackson 使ってシリアライズ/デシリアライズしようとする。

```java Foo.java
package jp.k_ui.sample.json_sample.model;

import java.net.MalformedURLException;
import java.net.URL;

public class Foo {

	private URL url;

	// getter
	public URL getUrl() {
		return url;
	}
  
	// setter
	public void setUrl(URL url) {
		this.url = url;
	}
	public void setUrl(String url) throws MalformedURLException{
		this.url = new URL(url);
	}

	@Override
	public String toString(){
		return "[Foo url="+url+"]";
	}
	
}
```

シリアライズとデシリアライズするコードがこれ。

```java SandBox.java
package jp.k_ui.sample.json_sample;

import java.io.IOException;
import org.codehaus.jackson.map.ObjectMapper;
import jp.k_ui.sample.json_sample.model.Foo;

public class SandBox {

	public static void main(String[] args) throws IOException{

		Foo foo = new Foo();
		foo.setUrl("http://k-ui.jp/");
		ObjectMapper om = new ObjectMapper();
	
		System.out.println("// seialize");
		System.out.println(om.canSerialize(Foo.class));	   // => true
		System.out.println(om.writeValueAsString(foo));	   // => {"url":"http://k-ui.jp/"}

		System.out.println("// deseialize");
		System.out.println(om.canDeserialize(om.constructType(Foo.class)));	   // => false
		System.out.println(om.readValue("{\"url\":\"http://k-ui.jp/\"}", Foo.class));
		// => Exception in thread "main" org.codehaus.jackson.map.JsonMappingException: Conflicting setter definitions for property "url": jp.k_ui.sample....
	}
	
}
```

とデシリアライズだけできない。これは setter が2つあるせいで、Jackson が
「どっち使えばいいかわからないから、とりあえず変換できないってことにする！！」
って感じらしい。

アノテーション `@JsonIgnore` を使って POJO (Foo) に片方の setter
を無視するよう指示します。

```java Foo.java
package jp.k_ui.sample.json_sample.model;

import java.net.MalformedURLException;
import java.net.URL;

public class Foo {

	private URL url;

	// getter
	public URL getUrl() {
		return url;
	}
  
	// setter
	public void setUrl(URL url) {
		this.url = url;
	}
	
	@JsonIgnore // <- これ！！
	public void setUrl(String url) throws MalformedURLException{
		this.url = new URL(url);
	}

	@Override
	public String toString(){
		return "[Foo url="+url+"]";
	}
	
}
```

これでデシリアライズもできるようになります。
