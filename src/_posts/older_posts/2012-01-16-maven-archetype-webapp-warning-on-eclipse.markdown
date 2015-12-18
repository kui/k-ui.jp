---
layout: post
title: "Maven Project を作成すると警告が出る"
date: 2012-01-16 02:38
comments: true
categories: [java, eclipse, maven]
---

[eclipse (3.7, indigo) + maven で WTP 使う](http://k-ui.jp/blog/2011/07/20/using_eclipse_and_maven_with_wtp/) で紹介した通りの環境を作成した。

しかし、WTP との連携するか否かに関わらず、"File" -> "New..." -> "Maven Project"
で作成すると、作成されたプロジェクトから下記のような警告が出る。

```
Build path specifies execution environment J2SE-1.5. There are no JREs installed in the workspace that are strictly compatible with this environment.
```

今の環境には 1.6 しかないのに j2se-1.5 で動こうとしているのが原因の様子。どうしてこうなった。

### 解決方法

pom.xml の書き換えと、その反映の 2 つの作業で済む。

<ol>
<li>pom.xml の build 要素直下に、下記の XML を書く。
```xml pom.xml
...
	<build>
	...
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>2.3.2</version>
				<configuration>
					<source>1.6</source>
					<target>1.6</target>
				</configuration>
			</plugin>
		</plugins>
	...
	</build>
...
```
</li>
<li>プロジェクトを右クリックして "Maven" -> "Update Project Configuration"</li>
</ol>

### 以上です

[java - Problems to make webapp with maven - Stack Overflow](http://stackoverflow.com/questions/5884486/problems-to-make-webapp-with-maven) を参考にさせて頂きました。

1.7 とかにも対応できるのかな。
