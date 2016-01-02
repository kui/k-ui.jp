---
layout: post
title: "Thinkpad X230 に Ubuntu 14.04 を暗号化しつつインストール"
date: 2014-03-01 21:03:06 +0900
comments: true
categories: Ubuntu
---

手元にとある事情で Windows 7 がインストールされてる Thinkpad X230 があるんですが、
Windows 7 よりも Linux デスクトップのほうが慣れてるので、Ubuntu インストールしてみた。

ラップトップ PC に Linux 入れるの初めてだし、各種デバイス対応しているか不安だったが、
思いの外簡単に快適に使えたので、参考にしたリンクなど含めてメモ書き。

Windows 7 潰すのはなんとなく勿体無いので、せっかく空いてる mSATA 対応 mPCIe を使う。
mSATA には、[480GB Crucial M500 SATA 6Gbps mSATA SSD][msata] を使った。

[msata]: http://www.ask-corp.jp/products/crucial/msata-ssd/m500-msata.html

多少環境に余裕があるのでまだデイリービルド版しかない Ubuntu 14.04 をいれてみた。
<ins>追記: Beta1 でてた・・・<ins>

USB からインストールするための準備
----------------------------------

X230 には CD/DVD のドライバがないため、USB フラッシュメモリからインストールする。

中身が消えても良い USB フラッシュメモリないので、USB の SD カードリーダーに使ってない
3DS にバンドルされた SD カード使う。

端末で:

```sh
wget http://cdimage.ubuntu.com/daily-live/current/trusty-desktop-amd64.iso
sudo dd bs=4M if=trusty-desktop-amd64.iso of=/dev/sdc
```

Ubuntu インストール
-------------------

用意したメディアを X230 の USB 端子に指してふつーにインストール。

ただし、/boot 以外の、/ にマウントするパーティションとスワップ領域を暗号化してインストールする。

具体的な方法はこれみる:

* [Manual full disk encryption setup guide for Ubuntu 13.10 & Linux Mint 16 \| LinuxBSDos.com](http://www.linuxbsdos.com/2014/01/16/manual-full-disk-encryption-setup-guide-for-ubuntu-13-10-linux-mint-16/)

今回の件に合わせるとだいたいこんな感じ（順番が大事）:

1. 手動でパーティションの設定する
2. `/boot` にマウントするパーティション(254MB, ext2)
3. スワップ領域のためのパーティション(8000MB, 暗号化された云々)
	* リストに `/dev/mapper/sda5_crypt` が載る。名前はちょっと違うかも。
4. `/` にマウントするパーティション(残り全部MB, 暗号化された云々)
	* リストに `/dev/mapper/sda6_crypt` が載る。名前はちょっと違うかも。
5. `/dev/mapper/sda6_crypt` を `/` にマウントするように設定
6. `/dev/mapper/sda5_crypt` をスワップに設定

注意点としては、このインストーラーのバグ？の影響で 5 と 6 の順番を逆にすると、
「暗号化されていないスワップ領域あるのやばいから中止するわ」
という旨のメッセージがでて、中途半端な状態になってしまう。
こうなると、これ以上は意図しない挙動ばかりになって詰むので、電源切って最初からやり直しましょう。

省電力のための設定
-------------------

基本的には、[Kernel/PowerManagement/PowerSavingTweaks - Ubuntu Wiki](https://wiki.ubuntu.com/Kernel/PowerManagement/PowerSavingTweaks) を参考に設定する。

`/etc/default/grub` を編集する:

```sh
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```

この行をこうする:

```sh
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash i915.i915_enable_rc6=1 i915.i915_enable_fbc=1 i915.lvds_downclock=1 drm.vblankoffdelay=1"
```

編集後は `sudo update-grub` を実行する。各設定の意味に関しては、上述のサイトを参照。

ほかにも、みんな大好き ArchWiki も参考にできそうな項目がある。

* https://wiki.archlinux.org/index.php/Power_saving

ただ、省電力の設定っていまいち効果を実感しにくいので効果あるのか不安になる。

これだけでおわり
---------------

これだけで、輝度/音量設定キーなど特殊なキーも潰れずに使えていて満足。

暗号化も省電力周りの設定もしないなら、この記事を参照する意味がほどんどないですね。
去年からモンハンでて最近更新してなかったのでリハビリということで。

[thinkfan](http://thinkfan.sourceforge.net/) とか気になるんですが、動機がいまいち分からないので保留。
