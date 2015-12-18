---
layout: post
title: "クライアント証明書 + SSL通信な HTTP サーバのセットアップ"
date: 2013-03-13 00:23
comments: true
categories:
---

クライアント証明書と SSL 通信使った HTTP サーバのセットアップ、
毎回ググってる気がするので、簡単にまとめておく。

プライベート認証局に HTTP サーバの証明書と、クライアント証明書の署名を
させた環境を使って、お手軽にクライアント認証と暗号通信したいと考えてる。

また `CA.sh` を使うのを今回は避けてる。シリアル番号の管理が便利そうだけど、
その他何してるかよくわからなかった。。。
それっぽく使ってもうまく行かなかったですし。

だいたいやるべきことは:

* 認証局（の秘密鍵・証明書）の作成
* HTTP サーバの秘密鍵・証明書の作成
* クライアントの秘密鍵・証明書の作成

「*認証局からみたら、HTTPサーバもクライアントも扱いが大して変わらない*」
ってのを忘れると、主体がよくわからなくなり、頭の中が
ゴチャゴチャになりそうになります。



前準備
----------------------------------------------------------------------------

デフォルト値のセットアップをして、証明証の各フィールドの入力を楽に
しておくとよいかも。

具体的には、`/etc/ssl/openssl.cnf` の `[ req_distinguished_name ]`
から下に配置されていて、フィールド名が `_default` で終わるやつらを
設定する。

例えば、こんな感じ:

```sh
$ sudo vi /etc/ssl/openssl.cnf
 ...
countryName_default = JP
 ...
stateOrProvinceName_default = Tokyo
 ...
localityName_default = Shibuya
 ...
0.organizationName_default = k-ui.jp
 ...
#organizationalUnitName_default =
```

作業領域を用意しておくと、あとあと便利かも。
一度やってしまうとしばらく必要のない作業なので忘れがちですし。

```sh
cd HTTP サーバのホーム的なディレクトリ
mkdir ssl
cd ssl
echo "see http://k-ui.jp/blog/2013/03/13/setup-client-certificate/" > README
```

認証局のセットアップ
----------------------------------------------------------------------------

証明書の発行時の各項目は、それらしく埋める。

```sh
# 認証局の秘密鍵
openssl genrsa -des3 -out ca.key 4096
# 認証局の自己署名証明書
openssl req -new -x509 -days 4000 -key ca.key -out ca.crt
```

`-days` に引数は認証局の有効期限なので **要調整**。

これで出来上がるファイルは:

* `ca.key`: 認証局の秘密鍵
* `ca.crt`: 認証局の証明書



HTTP サーバのセットアップ
----------------------------------------------------------------------------

署名要求の発行時の各項目は、それらしく埋める。ただし、`commonName` は、
運営するドメイン名じゃないとまずいかも。

```sh
# サーバの秘密鍵
openssl genrsa -des3 -out server.key 1024
# サーバの署名要求
openssl req -new -key server.key -out server.csr
# 認証局による署名
openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
```

`-days` の引数は、証明書の有効期間なので **要調整**。

`server.key` を HTTP サーバの秘密鍵として使うと、サーバ起動毎に秘密鍵の
パスフレーズ入力が必要になる。これが面倒なら、パスフレーズ無しの鍵を生成しておく:

```sh
openssl rsa -in server.key -out server_nopass.key
```

これで生成されるファイルは:

* `server.key`: サーバの秘密鍵
* `server.csr`: サーバの証明書署名要求
* `server.crt`: サーバの証明書
* （`server_nopass.key`: サーバのパスフレーズ無し秘密鍵）

あとは HTTP サーバに今回生成した秘密鍵と証明書を読み込ませるようにする。
このへんはサーバによって違うので割愛。



クライアントのセットアップ
----------------------------------------------------------------------------

署名要求の発行時の各項目は（ｒｙ

```sh
# クライアントの秘密鍵
openssl genrsa -des3 -out client.key 1024
# クライアントの署名要求
openssl req -new -key client.key -out client.csr
# 認証局による署名
openssl x509 -req -days 3650 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 02 -out client.crt
# ブラウザなどに組み込むために、認証局証明書と一緒にパッキング
cat client.key client.crt ca.crt | openssl pkcs12 -export -clcerts -out client.p12 -name "k-ui.jp client key"
```

`-days` の引数は、証明書の有効期限なので **要調整**。

`-set_serial` は、サーバの時と別の番号にしないと、*SSL 通信に失敗するので注意*。

`-name` は、分かりやすい名前にすると、忘れた頃に幸せになるかも。

これで生成されるファイルは:

* `client.key`: クライアントの秘密鍵
* `client.csr`: クライアントの署名要求
* `client.crt`: クライアントの証明書
* `client.p12`: ブラウザに組み込むためのパッケージ

`client.p12` をブラウザにインポートさせて終了。
対象の HTTP サーバに SSL でアクセスしてみる。

iPhone Safari にインポートさせるときは少し複雑なので、
[プライベートな CA で自宅サーバと通信するための iPhone の設定][iphone-setup]
を参照してください。

`nsCertType` の設定など、ネスケ（だけ?）に必要らしい項目は今回無視してます。

[iphone-setup]: /blog/2012/10/15/installing-a-private-certificate-in-your-iphone


### 参考

* [Client Side Certificate Auth in Nginx - The Good Word](http://blog.nategood.com/client-side-certificate-authentication-in-ngi)
