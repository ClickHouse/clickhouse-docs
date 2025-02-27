---
slug: /operations/settings/composable-protocols
sidebar_position: 64
sidebar_label: コンポーザブルプロトコル
title: "コンポーザブルプロトコル"
description: "コンポーザブルプロトコルを使用すると、ClickHouseサーバーへのTCPアクセスの設定をより柔軟に構成できます。"
---

# コンポーザブルプロトコル

コンポーザブルプロトコルを使用すると、ClickHouseサーバーへのTCPアクセスの設定をより柔軟に構成できます。この設定は従来の設定と共存することも、置き換えることも可能です。

## コンポーザブルプロトコルセクションは設定XML内で`protocols`として表されます {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}
**例:**
``` xml
<protocols>

</protocols>
```

## 基本モジュールはプロトコルレイヤーを定義します {#basic-modules-define-protocol-layers}
**例:**
``` xml
<protocols>

  <!-- plain_http モジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
ここで:
- `plain_http` - 他のレイヤーから参照できる名前
- `type` - データを処理するためにインスタンス化されるプロトコルハンドラを表します。プロトコルハンドラのセットは事前に定義されています:
  * `tcp` - ネイティブClickHouseプロトコルハンドラ
  * `http` - HTTP ClickHouseプロトコルハンドラ
  * `tls` - TLS暗号化レイヤー
  * `proxy1` - PROXYv1レイヤー
  * `mysql` - MySQL互換プロトコルハンドラ
  * `postgres` - PostgreSQL互換プロトコルハンドラ
  * `prometheus` - Prometheusプロトコルハンドラ
  * `interserver` - ClickHouseインターサーバーハンドラ

:::note
`gRPC`プロトコルハンドラは`コンポーザブルプロトコル`には実装されていません
:::
 
## エンドポイント（つまり、リスニングポート）は`<port>`および（オプションの）`<host>`タグによって表されます {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}
**例:**
``` xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- エンドポイント -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```
`<host>`が省略されている場合、ルート設定の`<listen_host>`が使用されます。

## レイヤーの順序は`<impl>`タグによって定義され、他のモジュールを参照します {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}
**例:** HTTPSプロトコルの定義
``` xml
<protocols>

  <!-- http モジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- plain_httpモジュールの上に設定されたtlsレイヤーとしてのhttpsモジュール -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

## エンドポイントは任意のレイヤーに添付できます {#endpoint-can-be-attached-to-any-layer}
**例:** HTTP（ポート8123）およびHTTPS（ポート8443）エンドポイントの定義
``` xml
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

## 追加のエンドポイントは任意のモジュールを参照して`<type>`タグを省略することで定義できます {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}
**例:** `plain_http`モジュールのために`another_http`エンドポイントが定義されています
``` xml
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

## 一部のモジュールはそのレイヤー専用のパラメータを含むことができます {#some-modules-can-contain-specific-for-its-layer-parameters}
**例:** TLSレイヤーでは、プライベートキー（`privateKeyFile`）および証明書ファイル（`certificateFile`）を指定できます
``` xml
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
