---
layout: post
title: "Linux で Apple Magic Trackpad 使う"
date: 2013-03-05 22:47
comments: true
categories: linux
---

Apple Wireless Keyboard に関しては [前回の投稿][apple-keyboard] を参照。

Linux で Magic Trackpad 使うには少し工夫が必要になる。

[apple-keyboard]: /blog/2013/03/05/apple-wireless-keyboard-for-linux/ "Linux で Apple Wireless Keyboard 使う - 電卓片手に"

### 接続

Ubuntu や Mint など多くのデスクトップ環境に使われている Gnome, Gnome
フォークだとは、まずここで詰まる。

Gnome 系で最初から用意されている Bluetooth 設定画面は、Magic Trackpad
に使う時にバグがあるらしく使い物にならない。
（Mint 13 Cinnamon, Ubuntu 12.04 で確認）

変わりのソフトウェアを使う:

```sh
$ apt-get install blueman
```

インジケーターに2つ Bluetooth アイコンが並んでしまいますが、
接続のセットアップが終わったら blueman の方のインジケーターは消してしまって
問題無い。

\# もしかして: utouch も必要かも

### ジェスチャの設定

Magic Trackpad に限らず、トラックパットのドライバは、evdev か synaptic のどちらかを
選ぶことになる。

ただ、evdev だとうまく動かなかったので、synaptics を選びました。

指定方法は、環境によって違うみたいだけど、Mint や Ubuntu だとこう書く:

```sh
$ cat /etc/X11/xorg.conf.d/70-magic-trackpad.conf
Section "InputClass"
  Identifier "Apple Magic Trackpad"
  #Driver "evdev"
  Driver "synaptics"
  # lsinput で確認して "vender:product"、だいたい変更する必要ないはず
  MatchUSBID "05ac:030e"

  # 以下 synaptic の設定（要: man synaptics）
  ...
EndSection
```

細かい設定は、↑のファイルで設定するか、標準でついてくるマウス設定画面で
設定できます。


### さらにジェスチャの設定

上記2つのドライバだと簡単なジェスチャしか設定できない。evdev だと一本指、
synaptics だと2-3本指。

今回は、2本指までのジェスチャを synaptic に任せ、3本指以上は [ginn][] に任せました。
（touchegg というのもあるようです。）

ただこの ginn に関するドキュメントが少なすぎる・・・[サンプル XML][sample-xml]
とか `/usr/share/ginn/wishes.xml` くらいしか参考にしていません。

とりあえず現状はこんな感じで落ち着きました:

```xml
<ginn>
  <global>
    <!-- 3 本指タップ: 中クリック -->
    <wish gesture="Tap" fingers="3">
      <action name="action1" when="update">
        <trigger prop="tap time" min="20" max="400"/>
        <button>2</button>
      </action>
    </wish>

    <!-- 4 本指上スワイプ: mac os の expose みたいな表示にする -->
    <wish gesture="Drag" fingers="4">
      <action name="action1" when="update">
        <trigger prop="delta y" max="-700" min="-2000"/>
        <key modifier1="Alt_L" modifier2="Control_L">Down</key>
      </action>
    </wish>

    <!-- 4 本指下スワイプ: デスクトップ表示 -->
    <wish gesture="Drag" fingers="4">
      <action name="action1" when="update">
        <trigger prop="delta y" min="700" max="2000"/>
        <key modifier1="Super_L">D</key>
      </action>
    </wish>
  </global>

  <applications>

    <!-- Google Chrome -->
    <application name="google-chrome">
      <!-- 三本指右スワイプ: 進む -->
      <wish gesture="Drag" fingers="3">
        <action name="action1" when="update">
          <trigger prop="delta x" min="700" max="2000"/>
          <key modifier1="Alt_L">Right</key>
        </action>
      </wish>
      <!-- 三本指左スワイプ: 戻る -->
      <wish gesture="Drag" fingers="3">
        <action name="action1" when="update">
          <trigger prop="delta x" max="-700" min="-2000"/>
          <key modifier1="Alt_L">Left</key>
        </action>
      </wish>
      <!-- 三本指上スワイプ: 消したタブを復活 -->
      <wish gesture="Drag" fingers="3">
        <action name="action1" when="update">
          <trigger prop="delta y" max="-700" min="-2000"/>
          <key modifier1="Control_L" modifier2="Shift_L">T</key>
        </action>
      </wish>
      <!-- 三本指下スワイプ: タブ削除 -->
      <wish gesture="Drag" fingers="3">
        <action name="action1" when="update">
          <trigger prop="delta y" min="700" max="2000"/>
          <key modifier1="Control_L">W</key>
        </action>
      </wish>
    </application>
  </applications>
</ginn>
```

これらを使う上で注意したいのは、最近の Ubuntu に標準で入ってくる Unity という
デスクトップ環境（？）と ginn との相性があまりよくないという点です。

Unity はどうやら、マルチタッチジェスチャーのイベントの大部分を奪ってしまい、
ginn までそのイベントが届かないようです。

\# そのくせ設定項目も無いし、大したことも出来ない。。。それを訴えても[こんな感じだし][bug-report]。

なので、Unity を使ってかつ ginn を使うならば、Unity のソースコードから、
マルチタッチジェスチャーイベントを奪ってる部分をコメントアウトして、
ビルド・インストールする。という方法を取る他無いようです。残念な感じですね。

[ginn]: https://wiki.ubuntu.com/Multitouch/Ginn "Multitouch/Ginn - Ubuntu Wiki "
[sample-xml]: https://wiki.ubuntu.com/Multitouch/AppleMagicTrackpad?action=AttachFile&do=view&target=wishes.xml
[bug-report]: https://bugs.launchpad.net/unity/+bug/898853 "Bug #898853 “Touch: Unity hijacks multitouch gestures” : Bugs : Unity"

### おわり

他にいい方法・ソフトなどあれば教えてください。。。
