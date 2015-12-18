---
layout: post
title: "\"cannot set LC_CTYPE locale\" への対処法"
date: 2012-03-29 03:24
comments: true
categories:
---

zsh のプロンプトで、バージョンコントロール情報を表示するようにしたら、
subversion 管理下のディレクトリで、こんなメッセージが出るようになった。

```
svn: warning: cannot set LC_CTYPE locale
svn: warning: environment variable LANG is en_US.UTF-8
svn: warning: please check that your locale name is correct
```

この警告メッセージを消すためには、下記の2コマンドを実行する。

```
# echo en_US.UTF-8 UTF-8 >> /etc/locale.gen
# locale-gen
```

原因としては、subversion が、"en\_US.UTF-8" っていう存在しないロケールを
`LANG` にセットして実行しようとしてるため、「そんなロケールしらねーよ」
って言ってきてる感じだろうか。

なので利用可能なロケールに "en_US.UTF-8" を追加してあげれば解決できる。
