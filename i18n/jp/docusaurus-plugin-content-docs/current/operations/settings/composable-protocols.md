---
description: 'Composable protocols allows more flexible configuration of TCP access
  to the ClickHouse server.'
sidebar_label: 'Composable Protocols'
sidebar_position: 64
slug: '/operations/settings/composable-protocols'
title: 'Composable Protocols'
---




# コンポーザブルプロトコル

## 概要 {#overview}

コンポーザブルプロトコルは、ClickHouseサーバーへのTCPアクセスの柔軟な構成を可能にします。この構成は、従来の構成と共存するか、または置き換えられることができます。

## コンポーザブルプロトコルの構成 {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

コンポーザブルプロトコルは、XML構成ファイルで構成できます。プロトコルセクションは、XML設定ファイル内の `protocols` タグで示されます:

```xml
<protocols>

</protocols>
```

### プロトコルレイヤーの構成 {#basic-modules-define-protocol-layers}

基本モジュールを使用してプロトコルレイヤーを定義できます。たとえば、HTTPレイヤーを定義するには、`protocols` セクションに新しい基本モジュールを追加できます:

```xml
<protocols>

  <!-- plain_http モジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
モジュールは以下に基づいて構成できます:

- `plain_http` - 他のレイヤーで参照できる名前
- `type` - データを処理するためにインスタンス化されるプロトコルハンドラーを示します。
   予め定義されたプロトコルハンドラーのセットは次の通りです：
  * `tcp` - ネイティブClickHouseプロトコルハンドラー
  * `http` - HTTP ClickHouseプロトコルハンドラー
  * `tls` - TLS暗号化レイヤー
  * `proxy1` - PROXYv1レイヤー
  * `mysql` - MySQL互換プロトコルハンドラー
  * `postgres` - PostgreSQL互換プロトコルハンドラー
  * `prometheus` - Prometheusプロトコルハンドラー
  * `interserver` - ClickHouseインターサーバーハンドラー

:::note
`gRPC`プロトコルハンドラーは`コンポーザブルプロトコル`には実装されていません
:::

### エンドポイントの構成 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

エンドポイント（リスニングポート）は、`<port>` およびオプションの `<host>` タグで示されます。
たとえば、前に追加したHTTPレイヤーにエンドポイントを構成するには、次のように設定を変更できます:

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

`<host>` タグが省略された場合は、ルート構成の `<listen_host>` が使用されます。

### レイヤーの順序の構成 {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

レイヤーの順序は、`<impl>` タグを使用して定義され、別のモジュールを参照します。たとえば、plain_http モジュールの上にTLSレイヤーを構成するには、次のように設定をさらに変更できます:

```xml
<protocols>

  <!-- httpモジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- plain_httpモジュールの上に構成されたtlsレイヤーとしてのhttpsモジュール -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### レイヤーにエンドポイントを添付する {#endpoint-can-be-attached-to-any-layer}

エンドポイントは任意のレイヤーに添付できます。たとえば、HTTP（ポート8123）およびHTTPS（ポート8443）のエンドポイントを定義できます:

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

追加のエンドポイントは、任意のモジュールを参照し `<type>` タグを省略することで定義できます。たとえば、`plain_http` モジュールの `another_http` エンドポイントを次のように定義できます:

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

一部のモジュールは、追加のレイヤーパラメータを含むことができます。たとえば、TLSレイヤーは次のようにプライベートキー（`privateKeyFile`）および証明書ファイル（`certificateFile`）を指定できます:

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
