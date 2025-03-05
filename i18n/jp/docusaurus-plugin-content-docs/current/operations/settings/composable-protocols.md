---
slug: /operations/settings/composable-protocols
sidebar_position: 64
sidebar_label: コンプーザブルプロトコル
title: "コンプーザブルプロトコル"
description: "コンプーザブルプロトコルは、ClickHouseサーバーへのTCPアクセスのより柔軟な設定を可能にします。"
---


# コンプーザブルプロトコル

コンプレッサブルプロトコルは、ClickHouseサーバーへのTCPアクセスのより柔軟な設定を可能にします。この設定は、従来の設定と共存することも、置き換えることもできます。

## コンパイルプロトコルセクションは、設定xmlで`protocols`として示されます {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}
**例:**
``` xml
<protocols>

</protocols>
```

## 基本モジュールはプロトコルレイヤーを定義します {#basic-modules-define-protocol-layers}
**例:**
``` xml
<protocols>

  <!-- plain_httpモジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
ここで:
- `plain_http` - 他のレイヤーで参照できる名前
- `type` - データを処理するためにインスタンス化されるプロトコルハンドラーを示します。プロトコルハンドラーのセットは事前に定義されています:
  * `tcp` - ネイティブのClickHouseプロトコルハンドラー
  * `http` - HTTP ClickHouseプロトコルハンドラー
  * `tls` - TLS暗号化レイヤー
  * `proxy1` - PROXYv1レイヤー
  * `mysql` - MySQL互換プロトコルハンドラー
  * `postgres` - PostgreSQL互換プロトコルハンドラー
  * `prometheus` - Prometheusプロトコルハンドラー
  * `interserver` - ClickHouseインターサーバーハンドラー

:::note
`gRPC`プロトコルハンドラーは`コンプーザブルプロトコル`には実装されていません
:::

## エンドポイント（すなわちリスニングポート）は`<port>`および（オプションの）`<host>`タグによって示されます {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}
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
`<host>`が省略された場合、ルート設定の`<listen_host>`が使用されます。

## レイヤーの順序は`<impl>`タグによって定義され、別のモジュールを参照します {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}
**例:** HTTPSプロトコルの定義
``` xml
<protocols>

  <!-- httpモジュール -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- plaintext_httpモジュールの上にTLSレイヤーとして設定されたhttpsモジュール -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

## エンドポイントは任意のレイヤーに付加できます {#endpoint-can-be-attached-to-any-layer}
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
**例:** `another_http`エンドポイントが`plain_http`モジュールのために定義されています
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

## 一部のモジュールはそのレイヤー固有のパラメーターを含むことができます {#some-modules-can-contain-specific-for-its-layer-parameters}
**例:** TLSレイヤーのために、秘密鍵（`privateKeyFile`）および証明書ファイル（`certificateFile`）を指定できます
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
