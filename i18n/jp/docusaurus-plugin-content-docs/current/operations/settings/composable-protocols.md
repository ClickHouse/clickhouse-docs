---
description: 'コンポーザブルプロトコルにより、ClickHouse サーバーへの TCP アクセスをより柔軟に構成できます。'
sidebar_label: 'コンポーザブルプロトコル'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'コンポーザブルプロトコル'
doc_type: 'reference'
---



# 合成可能なプロトコル



## 概要 {#overview}

Composable プロトコルを使用すると、ClickHouse サーバーへの TCP アクセスをより柔軟に設定できます。この設定は、従来の設定と併用することも、置き換えることもできます。



## コンポーザブルプロトコルの設定

コンポーザブルプロトコルは、XML 設定ファイル内で設定できます。`protocols` セクションは、XML 設定ファイル内で `protocols` タグによって表されます。

```xml
<protocols>

</protocols>
```

### プロトコル層の構成

基本モジュールを使用してプロトコル層を定義できます。たとえば、HTTP 層を定義するには、`protocols` セクションに新しい基本モジュールを追加します。

```xml
<protocols>

  <!-- plain_http モジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

モジュールは次のように構成できます:

* `plain_http` - 別のレイヤーから参照できる名前
* `type` - データを処理するためにインスタンス化されるプロトコルハンドラーを示します。
  あらかじめ定義されているプロトコルハンドラーは次のとおりです:
  * `tcp` - ネイティブな ClickHouse プロトコルハンドラー
  * `http` - HTTP ClickHouse プロトコルハンドラー
  * `tls` - TLS 暗号化レイヤー
  * `proxy1` - PROXYv1 レイヤー
  * `mysql` - MySQL 互換プロトコルハンドラー
  * `postgres` - PostgreSQL 互換プロトコルハンドラー
  * `prometheus` - Prometheus プロトコルハンドラー
  * `interserver` - ClickHouse インターサーバーハンドラー

:::note
`gRPC` プロトコルハンドラーは `Composable protocols` には実装されていません。
:::

### エンドポイントの設定

エンドポイント（リッスンポート）は `<port>` と、オプションの `<host>` タグで指定されます。
たとえば、先ほど追加した HTTP レイヤー上にエンドポイントを構成するには、
設定を次のように変更できます:

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- エンドポイント -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

`&lt;host&gt;` タグが省略された場合は、ルート設定の `&lt;listen_host&gt;` が使用されます。

### レイヤーシーケンスの設定

レイヤーシーケンスは `&lt;impl&gt;` タグを使用し、別のモジュールを参照して定義します。たとえば、plain&#95;http モジュールの上に TLS レイヤーを構成するには、設定を次のようにさらに変更できます。

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

### エンドポイントをレイヤーに関連付ける

エンドポイントは任意のレイヤーに関連付けることができます。たとえば、HTTP（ポート 8123）および HTTPS（ポート 8443）のエンドポイントを定義できます。

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

### 追加のエンドポイントの定義

追加のエンドポイントは、任意のモジュールを参照して `<type>` タグを省略することで定義できます。たとえば、`plain_http` モジュール用に `another_http` エンドポイントを次のように定義できます。

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
```


</protocols>
```

### 追加のレイヤーパラメータの指定 {#some-modules-can-contain-specific-for-its-layer-parameters}

一部のモジュールでは、追加のレイヤーパラメータを含めることができます。例えば、TLSレイヤーでは、秘密鍵(`privateKeyFile`)と証明書ファイル(`certificateFile`)を以下のように指定できます:

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
