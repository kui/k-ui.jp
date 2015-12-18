---
layout: post
title: "jenkins.war みたいな実行可能な war ファイルの作成"
date: 2013-05-08 22:24
comments: true
categories: [java, maven]
---

[Jenkins][] が配布している war ファイルは、サーブレットコンテナに読み込ませれば
war ファイルとして機能するし、さらに以下のように単体で実行可能になっている:

```sh
java -jar jenkins.war
```

これを実現するための簡単なサンプルを作ったので、これを実現するための要所を
簡単に書いていきたい。

* 実行可能な war サンプル: [kui/executable-war-sample · GitHub](https://github.com/kui/executable-war-sample)
	* `jetty/`: Jetty 9 を使ったサンプル
	* `winstone/`: winstone を使ったサンプル
	* `non-executable/`: war ファイルサイズ比較のために用意した、なんの変哲もない war

[Jenkins]: http://jenkins-ci.org/


サンプルのビルド方法
---------------------

ビルドには [Maven 3][] が必要になる。

```sh
git clone git@github.com:kui/executable-war-sample.git
cd executable-war-sample
mvn package
ls **/sample.war
java -jar winstone/target/sample.war
```

[Maven 3]: http://maven.apache.org/


依存関係
--------------

winstone をサーブレットコンテナとして使う場合は依存関係にこう書く:

```xml
<project ...>
  ...
  <repositories>
    <!-- jenkins が管理してる winstone 使うためにリポジトリ追加 -->
    <repository>
      <id>repo.jenkins-ci.org</id>
      <url>http://repo.jenkins-ci.org/public/</url>
    </repository>
  </repositories>
  ...
  <dependencies>
    <dependency>
      <groupId>org.jenkins-ci</groupId>
      <artifactId>winstone</artifactId>
      <version>0.9.10-jenkins-43</version>
      <!-- scope=provided である必要は無いが、plugin 使って winstone の class
           ファイルのコピーをするので、Jar にアクセスできれば何でも良い
           compile にしてしまうと war のサイズが無駄に大きくなるので非推奨 -->
      <scope>provided</scope>
    </dependency>
  </dependencies>
  ...
```

[本家 winstone](http://winstone.sourceforge.net/) は、[最近更新がない][winstone-versions] のが気になったので、
比較的更新頻度の高い Jenkins が管理している winstone を使っている。

* jenkinsci/winstone · GitHub <https://github.com/jenkinsci/winstone>

[winstone-versions]: http://sourceforge.net/projects/winstone/files/winstone/


Main.java
------------------------

`java -jar sample.war` を実行した時に呼ばれるメソッドを定義している。

主にやるべきことは:

* war ファイル自身の場所の取得
* 自分自身をサーブレットコンテナに読み込ませる

の二点になる。

winston 版の例:

```java
package jp.k_ui.sample;
import java.net.URL;
import java.util.*;
import winstone.Launcher;

public class Main {
    public static void main(String[] args) throws Exception {
        // war 自身の場所を取得
        URL warLocation = Main.class.getProtectionDomain().getCodeSource()
                .getLocation();

        // コマンドライン引数ほぼそのまま winstone に渡す。
        // war ファイルの場所だけ加える。
        List<String> argList = new ArrayList<String>(Arrays.asList(args));
        argList.add("--warfile=" + warLocation.getPath());
        System.out.println(argList);

        Launcher.main(argList.toArray(new String[0]));
    }
}
```

pom.xml
-------

つまるところ、実行可能 war は、その war に梱包するファイル配置を実行可能
jar と同じようなファイル配置にすればよい。

そのファイル配置を Maven にやらせる設定をする。ただし、通常は war を
構築するだけのファイル配置になってしまうので、少々面倒な設定が必要になる。


### Main-Class の指定

どのクラスの `main(String[])` を呼べば良いのか、という指定をする設定:

```xml
<project ...>
  <build>
    ...
    <plugins>
      ...
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>2.3</version>
        <configuration>
          <archive>
            <manifest>
              <mainClass>jp.k_ui.sample.Main</mainClass>
            </manifest>
          </archive>
        </configuration>
      </plugin>
```

この状態で `mvn package` もできるし、`java -jar sample.jar` で実行も可能。
ただし失敗する。

失敗する理由は `unzip -l sample.jar` で中身を見てみるとわかるけれど、
呼び出すはずの `jp.k_ui.sample.Main` が梱包されていなため。


### Main.java のコピー

上で梱包されていないことが分かった `Main` クラスをコピーする設定:

```xml
<project ...>
  <build>
    ...
    <plugins>
      ...
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-antrun-plugin</artifactId>
        <version>1.7</version>
        <executions>
          <execution>
            <id>main-class-placement</id>
            <phase>prepare-package</phase>
            <configuration>
              <tasks>
                <move todir="${project.build.directory}/${project.build.finalName}/">
                  <fileset dir="${project.build.directory}/classes/">
                    <include name="jp/k_ui/sample/Main.class" />
                  </fileset>
                </move>
              </tasks>
            </configuration>
            <goals>
              <goal>run</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
```

[Apache Ant][] を使って、war 化する前のディレクトリにコピーしている。

この状態で `java -jar sample.war` を実行すると、`Main` 見つからないという文句は消える代わりに、
`Launcher` が見つからないと言ってくるはず。

先程同様、`unzip -l sample.jar` で中身を見てみると、サーブレットを実行するためのクラスが
war に梱包されていない。

[Apache Ant]: http://ant.apache.org/

### サーブレットコンテナが使うクラスのコピー

`Main.java` が利用しているサーブレットコンテナに関わるクラス全てを、
これから war 化する前のディレクトリにコピーする設定:

```xml
<project ...>
  <build>
    ...
    <plugins>
      ...
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <version>2.7</version>
        <executions>
          <execution>
            <id>winstone-classpath</id>
            <phase>prepare-package</phase>
            <goals>
              <goal>unpack-dependencies</goal>
            </goals>
            <configuration>
              <includeGroupIds>org.jenkins-ci</includeGroupIds>
              <includeArtifactIds>winstone</includeArtifactIds>
              <includeScope>provided</includeScope>
              <excludes></excludes>
              <outputDirectory>
                ${project.build.directory}/${project.build.finalName}
              </outputDirectory>
            </configuration>
          </execution>
        </executions>
      </plugin>
      ...
```

### 設定おわり

以上で、実行可能 war を作成するための設定が完了したことになる。

`mvn clean package` をしたあと、`java -jar sample.war` で実行できるはず。



Winstone 対 Jetty
-----------------

結論から書くと Winstone のほうが向いているかなと感じました。理由としては:

* 実行可能 war のファイルサイズ
* `Main.java` の作りやすさ

### 実行可能 war のファイルサイズ

察しはついていたが、今回のために用意したサンプルをビルドしてみて改めて理解した。


```sh
$ git clone git@github.com:kui/executable-war-sample.git
$ cd executable-war-sample
$ mvn package
$ ls -1sh **/sample.war
1.4M jetty/target/sample.war          # Jetty 9 版
 80K non-executable/target/sample.war # 比較のために用意した単なる war
360K winstone/target/sample.war       # winstone 版
```

実行可能 war にした時のファイルサイズの増分は:

* Winstone: +280KB
* Jetty: +1264KB

となり、Winstone のほうがファイルサイズが小さいことが分かった。ただし、
元の war ファイルのサイズ次第では無視できるような差分かも。


### Main.java の作りやすさ

これは、実際のコードと、作られた `sample.jar` の出来栄えを比較するのが一番早いかと。

* [Winstone 版 Main.java](https://github.com/kui/executable-war-sample/blob/master/winstone/src/main/java/jp/k_ui/sample/Main.java)
* [Jetty 版 Main.java](https://github.com/kui/executable-war-sample/blob/master/jetty/src/main/java/jp/k_ui/sample/Main.java)

Winstone は `Launcher` にそのままコマンドライン引数を渡せば、`winstone.jar`
として機能してくれるため、このようなお手軽 `Main.java` でも、ポートの指定、SSL の云々、
ログファイルの指定、`--help` でヘルプメッセージ出力などができてしまう。
面倒なコマンドライン引数のオプションパースをしないで済む。嬉しい。

Jetty には `Launcher` 相当がパッと調べた限りでは見当らない。（報告求む）


おわり
--------------

ここまで書いてしまいましたが Jenkins の `Main.java` は、少し違う方法をとっている:

* Jenkins の `Main.java` 相当: [extras-executable-war/src/main/java/Main.java at master · jenkinsci/extras-executable-war · GitHub](https://github.com/jenkinsci/extras-executable-war/blob/master/src/main/java/Main.java)

`ClassLoader` を `new` したり、`winstone.jar` はバラさずに war に梱包している。
ここまで複雑な方法を取る理由がよくわからない。。。どういうことなんだろう。。。

* TODO [Tomcat][] 使ったバージョン
* TODO [Tiny Java Web Server][tjws] を使ったバージョン

[Tomcat]: http://tomcat.apache.org/
[tjws]: http://tjws.sourceforge.net/


参考
------

このへん参考にしたんですが、情報古かったり、設定が間違ってたり、Jetty
しか使ってなかったりだったで手を加えてる。

* [Internna - Geared towards Open Source: Step by step: Executable WAR files](http://internna.blogspot.jp/2011/08/step-by-step-executable-war-files.html)
* [Embedded jetty executable war with Maven and Jetty 8.1](http://uguptablog.blogspot.jp/2012/09/embedded-jetty-executable-war-with.html)
