---
layout: post
title: "Vagrant のゲストOSで dist-upgrade すると shared_folder のマウントが失敗する"
date: 2013-07-05 16:22
comments: true
categories: vagrant
---

Vagrant 便利で色々いじってるんですが、ゲスト OS で `apt-get dist-upgrade` して、
再起動すると、共有ファイルとしてマウントしていた `/vagrant` がマウントでこけてしまいます。
この解決方法についてメモ。

現象と原因
--------

端末で:

```sh
$ vagrant up
 ...
[default] Mounting shared folders...
[default] -- /vagrant # ←マウントできてる
$ vagrant ssh # ゲストOSにログイン
$ sudo apt-get update
 ...
$ sudo apt-get dist-upgrade # カーネル更新
 ...
   # grub 入れなくても大丈夫
 ...
$ exit # ゲストOS抜ける
$ vagrant reload
[default] Attempting graceful shutdown of VM...
[default] Setting the name of the VM...
[default] Clearing any previously set forwarded ports...
[default] Creating shared folders metadata...
[default] Clearing any previously set network interfaces...
[default] Preparing network interfaces based on configuration...
[default] Forwarding ports...
[default] -- 22 => 2222 (adapter 1)
[default] Booting VM...
[default] Waiting for VM to boot. This can take a few minutes.
[default] VM booted and ready for use!
[default] Configuring and enabling network interfaces...
[default] Mounting shared folders...
[default] -- /vagrant # ↓ 失敗してる
The following SSH command responded with a non-zero exit status.
Vagrant assumes that this means the command failed!

mount -t vboxsf -o uid=`id -u vagrant`,gid=`id -g vagrant` /vagrant /vagrant

# 試しに手動でマウントしてみる
$ vagrant ssh
$ sudo mount -t vboxsf -o uid=`id -u vagrant`,gid=`id -g vagrant` /vagrant /vagrant
/sbin/mount.vboxsf: mounting failed with the error: No such device
```

原因は、カーネルアップデートしたことでファイル共有するためのカーネルモジュール？が
うまく機能しなくなっているようです。

解決策
---------------

一番直接的な方法としては、上記の状態から `virtualbox-ose-guest-utils` と
カーネルヘッダをインストールしてしまうことです。

今回は自動で更新してくれる Vagrant プラグイン [vagrant-vbguest][] を使ってみます。

先述の端末の状態から:

```sh
$ vagrant plugin install vagrant-vbguest
$ vagrant reload
 ...
[default] Mounting shared folders...
[default] -- /vagrant
$ vagrant ssh -c 'ls -a /vagrant'
.
..
.vagrant
Vagrantfile
Vagrantfile~
```

うまくいっていることがわかると思います。

以上です。

そもそも共有フォルダ使わないので、機能自体を無効化することになりそうですが。

[vagrant-vbguest]: https://github.com/dotless-de/vagrant-vbguest "dotless-de/vagrant-vbguest"
