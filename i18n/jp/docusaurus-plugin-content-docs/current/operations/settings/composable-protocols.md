---
description: 'Composable protocols（コンポーザブルプロトコル）により、ClickHouse サーバーへの TCP アクセスをより柔軟に設定できます。'
sidebar_label: 'コンポーザブルプロトコル'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'コンポーザブルプロトコル'
doc_type: 'reference'
---



# コンポーズ可能なプロトコル



## 概要 {#overview}

コンポーザブルプロトコルを使用すると、ClickHouseサーバーへのTCPアクセスをより柔軟に設定できます。この設定は、従来の設定と併用することも、置き換えることも可能です。


## 組み合わせ可能なプロトコルの設定 {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

組み合わせ可能なプロトコルはXML設定ファイルで設定できます。プロトコルセクションはXML設定ファイル内で`protocols`タグで表されます:

```xml
<protocols>

</protocols>
```

### プロトコルレイヤーの設定 {#basic-modules-define-protocol-layers}

基本モジュールを使用してプロトコルレイヤーを定義できます。例えば、HTTPレイヤーを定義するには、`protocols`セクションに新しい基本モジュールを追加します:

```xml
<protocols>

  <!-- plain_httpモジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

モジュールは以下の項目に従って設定できます:

- `plain_http` - 他のレイヤーから参照可能な名前
- `type` - データを処理するためにインスタンス化されるプロトコルハンドラーを指定します。
  以下の定義済みプロトコルハンドラーが用意されています:
  - `tcp` - ネイティブClickHouseプロトコルハンドラー
  - `http` - HTTP ClickHouseプロトコルハンドラー
  - `tls` - TLS暗号化レイヤー
  - `proxy1` - PROXYv1レイヤー
  - `mysql` - MySQL互換プロトコルハンドラー
  - `postgres` - PostgreSQL互換プロトコルハンドラー
  - `prometheus` - Prometheusプロトコルハンドラー
  - `interserver` - ClickHouseサーバー間ハンドラー

:::note
`gRPC`プロトコルハンドラーは`組み合わせ可能なプロトコル`には実装されていません
:::

### エンドポイントの設定 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

エンドポイント(リスニングポート)は`<port>`タグとオプションの`<host>`タグで指定します。
例えば、先ほど追加したHTTPレイヤーにエンドポイントを設定するには、
次のように設定を変更します:

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

`<host>`タグが省略された場合、ルート設定の`<listen_host>`が使用されます。

### レイヤーシーケンスの設定 {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

レイヤーシーケンスは`<impl>`タグを使用し、別のモジュールを参照することで定義します。例えば、plain_httpモジュールの上にTLSレイヤーを設定するには、
次のように設定をさらに変更します:

```xml
<protocols>

  <!-- httpモジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- plain_httpモジュールの上にtlsレイヤーとして設定されたhttpsモジュール -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### レイヤーへのエンドポイントの接続 {#endpoint-can-be-attached-to-any-layer}

エンドポイントは任意のレイヤーに接続できます。例えば、HTTP(ポート8123)とHTTPS(ポート8443)のエンドポイントを定義できます:

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

### 追加エンドポイントの定義 {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}

追加のエンドポイントは、任意のモジュールを参照し`<type>`タグを省略することで定義できます。例えば、`plain_http`モジュールに対して`another_http`エンドポイントを次のように定義できます:

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

一部のモジュールには追加のレイヤーパラメータを含めることができます。例えば、TLSレイヤーでは秘密鍵（`privateKeyFile`）と証明書ファイル（`certificateFile`）を以下のように指定できます：

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
