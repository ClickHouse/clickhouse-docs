---
description: 'コンポーザブルプロトコルを使用すると、ClickHouse サーバーへの TCP アクセスの構成をより柔軟に行えます。'
sidebar_label: 'コンポーザブルプロトコル'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'コンポーザブルプロトコル'
doc_type: 'reference'
---

# 合成可能なプロトコル {#composable-protocols}

## 概要 {#overview}

Composable プロトコルを使用すると、ClickHouse サーバーへの TCP アクセスをより柔軟に設定できます。この設定は、従来の設定と併用することも、置き換えることもできます。

## コンポーザブルプロトコルの設定 {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

コンポーザブルプロトコルは XML 設定ファイルで設定できます。`protocols` セクションは、XML 設定ファイル内で `protocols` タグで表されます。

```xml
<protocols>

</protocols>
```


### プロトコルレイヤーの設定 {#basic-modules-define-protocol-layers}

プロトコルレイヤーは基本モジュールを使用して定義できます。たとえば、HTTP レイヤーを定義するには、`protocols` セクションに新しい基本モジュールを追加します。

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

モジュールは次の項目で構成できます:

* `plain_http` - 別のレイヤーから参照される名前
* `type` - データを処理するためにインスタンス化されるプロトコルハンドラを示します。
  あらかじめ定義されているプロトコルハンドラは次のとおりです:
  * `tcp` - ネイティブな ClickHouse プロトコルハンドラ
  * `http` - HTTP ClickHouse プロトコルハンドラ
  * `tls` - TLS 暗号化レイヤー
  * `proxy1` - PROXYv1 レイヤー
  * `mysql` - MySQL 互換プロトコルハンドラ
  * `postgres` - PostgreSQL 互換プロトコルハンドラ
  * `prometheus` - Prometheus プロトコルハンドラ
  * `interserver` - ClickHouse インターサーバープロトコルハンドラ

:::note
`gRPC` プロトコルハンドラは `Composable protocols` では実装されていません。
:::


### エンドポイントの設定 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

エンドポイント（待ち受けポート）は `<port>` と、任意の `<host>` タグで指定します。
例えば、先ほど追加した HTTP レイヤーに対してエンドポイントを設定するには、
次のように設定を変更します。

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- endpoint -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

`<host>` タグが省略された場合は、ルート設定の `<listen_host>` が使用されます。


### レイヤーシーケンスの設定 {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

レイヤーシーケンスは `<impl>` タグを使用し、別のモジュールを参照することで定義します。例えば、`plain_http` モジュールの上に TLS レイヤーを構成するには、設定を次のようにさらに変更できます。

```xml
<protocols>

  <!-- httpモジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- plain_httpモジュール上にTLSレイヤーとして設定されたhttpsモジュール -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```


### レイヤーにエンドポイントを関連付ける {#endpoint-can-be-attached-to-any-layer}

エンドポイントは任意のレイヤーに関連付けることができます。たとえば、HTTP（ポート 8123）および HTTPS（ポート 8443）向けのエンドポイントを定義できます。

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```


### 追加のエンドポイントの定義 {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}

追加のエンドポイントは、任意のモジュールを参照し、`<type>` タグを省略することで定義できます。たとえば、`plain_http` モジュールに対する `another_http` エンドポイントを次のように定義できます。

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

  <another_http>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8223</port>
  </another_http>

</protocols>
```


### 追加のレイヤーパラメータの指定 {#some-modules-can-contain-specific-for-its-layer-parameters}

一部のモジュールには、追加のレイヤーパラメータが含まれる場合があります。たとえば、TLS レイヤーでは
秘密鍵ファイル（`privateKeyFile`）および証明書ファイル（`certificateFile`）を
次のように指定できます。

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
    <privateKeyFile>another_server.key</privateKeyFile>
    <certificateFile>another_server.crt</certificateFile>
  </https>

</protocols>
```
