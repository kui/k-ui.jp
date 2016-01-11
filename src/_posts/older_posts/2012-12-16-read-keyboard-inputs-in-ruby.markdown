---
layout: post
title: "Linux でのキーボードからの入力を Ruby で読み取る"
date: 2012-12-16 14:56
comments: true
categories: [Linux, Ruby]
---

この記事では、Linux でのキーボード入力を読み取る Ruby Gem パッケージについて
簡単な解説をします。また、このパッケージは、[Linux + X11 向けのキーリマッパー][1]
を作るにあたって、新たに作成したものです。

* [kui/revdev - GitHub][2]


### そもそも Linux でのキーボード入力を読み取る方法

主に2通り考えられます。

* evdev から読み取る
* X から読み取る

この2つの関係としては

* `キーボード -> ドライバ -> evdev -> X -> アプリケーション`

という階層関係になっています。そのためより生（？）の入力情報がほしい場合は、
evdev から読み取るのがよいです。

X に解釈してもらったあとのものがほしい場合は X から読み取るのがよいのですが、
今回の記事のスコープ外なので割愛します。


### インストール

普通の Gem パッケージ同様で良いかと思います。
evdev 自体は Linux カーネルに組み込まれている機能なので特別なライブラリは
要らないかはずですが、もしかしたら、カーネル周りのパッケージが必要かもです。

端末で、`$ gem install revdev` を実行するか、`bundler` を使っている場合は、Gemfile に:

```ruby
gem 'revdev'
```

を書き、端末で `$ bundle` を実行すればよいです。


### 使い方

基本的には、[revdev/sample][3] の例を見ていただければ問題ないのです。今回の記事に最も
適当なサンプルは、[revdev/sample/key_dump][4] になります。

[revdev/sample/key_dump][4] は、指定されたイベントデバイスを読み取り、
端末に読み取った情報を吐き出すだけのスクリプトです。

イベントデバイスとは、Linux カーネルが認識している入力出力装置を抽象化したものです。
通常、`/dev/input/event?` （?:整数） という添字と共に配置されます。


### key_dump の使い方

どのイベントデバイスがキーボードなのかは、そのパスを見ただけではわかりません。
それらが分かるようにするには、`ioctl` というシステムコールが必要なのですが、
今回は同じディレクトリにある、[revdev/sample/device_info][5] を使います。

試しに手元の私の環境で実行してみます:

```sh
$ sudo ruby device_info /dev/input/event*
path    name    version bustype vendor  product id.version
/dev/input/event0       Power Button    1.0.1   BUS_HOST(25)    0       1       0.0.0
/dev/input/event1       Power Button    1.0.1   BUS_HOST(25)    0       1       0.0.0
  ...
/dev/input/event12      HDA Intel PCH Line-Out  1.0.1   (0)     0       0       0.0.0
/dev/input/event13      "kui" のトラックパッド   1.0.1   BUS_BLUETOOTH(5)        1452    782     0.1.96
/dev/input/event14      kui のキーボード        1.0.1   BUS_BLUETOOTH(5)        1452    597     0.0.80
```

この環境では、Bluetooth で接続した Apple Keyboard が、`/dev/input/event14`
として認識されているようです。USB や PS/2 接続したキーボードは、
BT 装置より早い段階で認識されるので、"/dev/input/event?" の添字はより小さい値に
なるはずです。

次についに `key_dump` を実行します:

```sh
$ sudo ruby key_dump /dev/input/event14
## Device Name: kui のキーボード
type:EV_MSC(4)  code:MSC_SCAN(4)        value:458792
type:EV_KEY(1)  code:KEY_ENTER(28)      value:1
type:EV_SYN(0)  code:SYN_REPORT(0)      value:0

type:EV_MSC(4)  code:MSC_SCAN(4)        value:458792
type:EV_KEY(1)  code:KEY_ENTER(28)      value:0
type:EV_SYN(0)  code:SYN_REPORT(0)      value:0
^C# recieve :INT
$
```

上記の実行例では、実行直後に、Enter キーを **一度** 押し、Ctrl+C で実行終了しています。

一度のはずなのに、二度 KEY_ENTER を出力しているのは、キーを押した時のイベントと、
キーをリリースした時のイベントの2つを出力しているためです。

注意: `key_dump` に `-g` もしくは `--grab` オプションをつけると、
読み取ったイベントを文字通り「握って」しまいます。つまり、
読み取ってしまったイベントは、上のレイヤである X などに伝播しないようになります。
そのため、キーボードのイベントデバイスに対して `-g` オプションを付けると、
Ctrl+C さえ入力できなくなってしまい、スクリプトの停止がかなり面倒になります。


### key_dump の解説

[revdev/sample/key_dump][4] の 43 行目:

```ruby
  evdev = EventDevice.new ARGV.first
```

`EventDevice.new イベントデバイスへのパス` でイベントデバイスを抽象化したオブジェクトを作成しています。

メインのキーボード読み取るループは、[revdev/sample/key_dump][4] の 55 行目からのブロックになります:

```ruby
  loop do
    ie = evdev.read_input_event
    next if spec_type and spec_type != ie.hr_type.to_s
    t = ie.hr_type ? "#{ie.hr_type.to_s}(#{ie.type})" : ie.type
    c = ie.hr_code ? "#{ie.hr_code.to_s}(#{ie.code})" : ie.code
    v = ie.hr_value ? "#{ie.hr_value.to_s}(#{ie.value})" : ie.value
    puts "type:#{t}	code:#{c}	value:#{v}"
  end
```

43 行目で作成したオブジェクトから、`#read_input_evet` でイベント読み取りをします。ここで、
イベントがあるまで読み込みブロックが発生します。つまり、イベントが発生するまで待つことになります。

残りのループの中身は、読み取ったものの出力になります。

### キーボード入力の読み取りは分かったけど、書き込みは？

[revdev][2] だけではできません。

[ruinput][6] を用いて、書き込み用の仮想のイベントデバイスを作成することになります。


[1]: /blog/2012/06/06/rbindkeys-configurable-key-remapper-in-ruby/ "Ruby で設定できる Linux 環境向けキーリマッパー作った - 電卓片手に"
[2]: https://github.com/kui/revdev "kui/revdev · GitHub"
[3]: https://github.com/kui/revdev/tree/master/sample "revdev/sample at master · kui/revdev · GitHub "
[4]: https://github.com/kui/revdev/blob/master/sample/key_dump "revdev/sample/key_dump at master · kui/revdev · GitHub"
[5]: https://github.com/kui/revdev/blob/master/sample/device_info "revdev/sample/device_info at master · kui/revdev · GitHub"
[6]: https://github.com/kui/ruinput "kui/ruinput · GitHub"
