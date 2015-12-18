---
layout: post
title: "Ruby で設定できる Linux 環境向けキーリマッパー作った"
date: 2012-06-06 22:33
comments: true
categories: [ruby, rbindkeys]
---

まだ洗練されてないところたくさんあるけど、とりあえず作った。

キーリマッパーっていろいろあるけれど、どれも設定ファイルが独特な記法だったりして
覚えるの辛いから作った。

実行までには大体、

* インストールする
* 設定ファイル書く
* リマップするキーボード選ぶ
* 実行する

なので順に書く。

### インストール

ruby 1.8 で動くように作った。`sudo apt-get install ruby` でインストールされるの
1.8 なので。

```sh
$ sudo apt-get install libx11-dev
$ sudo gem install rbindkeys
```

### 設定ファイル書く

`~/.rbindkeys.rb` を作成し、キーバインドなどを書く。
（参考:
[emacs.rb](https://github.com/kui/rbindkeys/blob/master/sample/emacs.rb),
`rbindkeys -e`, 次から上げる例）

設定例を挙げていく。

#### Ctrl+F を右矢印にバインド

```ruby
bind_key [KEY_LEFTCTRL, KEY_F], KEY_RIGHT
```

#### Ctrl+K で一行マルっと削除してクリップボードにしまう

まだあんまり洗練されてないが、`Shift + End` -> `Ctrl + X` を連続して
入力する。

```ruby
bind_key [KEY_LEFTCTRL, KEY_K] do |event, operator|

  # Shift+End : select text to end of line
  operator.press_key KEY_LEFTSHIFT
  operator.press_key KEY_END
  operator.release_key KEY_END
  operator.release_key KEY_LEFTSHIFT

  # Ctrl+X : cut
  operator.press_key KEY_LEFTCTRL
  operator.press_key KEY_X
  operator.release_key KEY_X
  operator.release_key KEY_LEFTCTRL
end
```

#### CapsLock を押した時に、Caps LED を光らせたい

別の仮想キーボードを作成してしまってるので、実キーボードに「LED つけろよ」
って命令が届かなくなってる。

このへんももっと綺麗にまとめたい。

```ruby
@caps_led_state = 0
bind_key KEY_CAPSLOCK do |event, operator|
  # トグルしてる
  @caps_led_state = @caps_led_state ^ 1
  operator.send_event EV_LED, LED_CAPSL, @caps_led_state
end
```

#### emacs の C-x などプレフィックスキー

2 ストロークキーバインドのことです。

```ruby
bind_prefix_key [KEY_LEFTCTRL, KEY_X] do

  # C-xk -> Ctrl + W
  bind_key KEY_K, [KEY_LEFTCTRL, KEY_W]

  # C-xC-s -> Ctrl + S
  bind_key [KEY_LEFTCTRL, KEY_S], [KEY_LEFTCTRL, KEY_S]

  # C-xb -> Ctrl + TAB
  bind_key KEY_B, [KEY_LEFTCTRL, KEY_TAB]

  # C-xC-g -> quit the C-x prefix binds
  bind_key [KEY_LEFTCTRL, KEY_G], :ignore

  # C-xC-c -> Alt + F4
  bind_key [KEY_LEFTCTRL, KEY_C], [KEY_LEFTALT, KEY_F4]
end
```

#### 特定のウィンドウがアクティブな時だけ切り替え

端末とか使ってる時はキーリマップ機能を切りたい

```ruby
# アクティブなアプリケーションの名前が gnome-terminal の時
# すべての入力をリマップせずそのままにする
window(:through, :class => /gnome-terminal/)

# 通常のキーバインドに加えて、C-s で検索
window(@default_bind_resolver, :class => /google-chrome/) do
  bind_key [KEY_LEFTCTRL, KEY_S], [KEY_LEFTCTRL, KEY_F]
end
```

#### CapsLock キー と 左 Ctrl キーを入れ替えたい

`pre_bind_key` を使う。

`bind_key` や `window` などあらゆるバインド処理より早く評価される。単純なキー
入れ替えしかできないようになってる。

`bind_prefix_key` と似てるのでどうにかしたい。

```ruby
pre_bind_key KEY_CAPSLOCK, KEY_LEFTCTRL
pre_bind_key KEY_LEFTCTRL, KEY_CAPSLOCK
```

設定例は以上。

こんな感じで設定できる。


### リマップするキーボードデバイスを選ぶ

`sudo rbindkey -l` で選択可能なデバイス一覧みて、キーボードっぽい名前の
`/dev/input/event*` を覚えておく。

### 実行する

```
sudo rbindkey /dev/input/event2
```

選んだデバイスが `/dev/input/event2` の時はこうなる

### 終

ツッコミよろしくお願いします。


### 参考

おなじく Linux で動くことを想定したキーリマッパー

* [私家版 窓使いの憂鬱 Linux & Mac (Darwin) 対応版](http://www42.tok2.com/home/negidakude/)
	* キーリマッパーでは AutoHotKey に並んで有名な窓使いの憂鬱の移植版
	* Windows ではこれの派生版[のどか](http://www.appletkan.com/nodoka.htm)
	  使ってる
	* ウィンドウごとのリマップ機能がない、これに追加機能すればよかったか。。。
* [x11keymacs](http://yashiromann.sakura.ne.jp/x11keymacs/)
	* リマップ部分を C+(?) で書く必要あり
	* 参考になる情報たくさん
* [xfumble](http://endoh-namazu.tierra.ne.jp/xfumble/)
	* キー入力を盗むレイヤが rbindkeys, x11keymacs などと違う
	* 設定ファイルが XML
* [AutoKey](http://code.google.com/p/autokey/)
	* ちょっとちがう。リマッパーっていうよりキーボードランチャー。
* [evrouter](http://www.bedroomlan.org/projects/evrouter),
  [evrouter 2](http://www.bedroomlan.org/projects/evrouter2)
	* 2 の方が楽しみ。無印のほううまく動かなかった。
