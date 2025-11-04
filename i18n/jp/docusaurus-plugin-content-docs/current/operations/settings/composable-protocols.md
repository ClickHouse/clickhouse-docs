---
'description': 'コンポーザブル プロトコルは、ClickHouseサーバーへのTCPアクセスのより柔軟な構成を可能にします。'
'sidebar_label': 'コンポーザブル プロトコル'
'sidebar_position': 64
'slug': '/operations/settings/composable-protocols'
'title': 'コンポーザブル プロトコル'
'doc_type': 'reference'
---


# コンポーザブルプロトコル

## 概要 {#overview}

コンポーザブルプロトコルは、ClickHouseサーバーへのTCPアクセスのより柔軟な構成を可能にします。この構成は、従来の構成と共存するか、またはそれを置き換えることができます。

## コンポーザブルプロトコルの構成 {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

コンポーザブルプロトコルは、XML構成ファイルで構成できます。プロトコルセクションは、XML構成ファイル内の`protocols`タグによって示されます:

```xml
<protocols>

</protocols>
```

### プロトコル層の構成 {#basic-modules-define-protocol-layers}

基本モジュールを使用してプロトコル層を定義できます。たとえば、HTTP層を定義するには、`protocols`セクションに新しい基本モジュールを追加します:

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
モジュールは次のように構成できます:

- `plain_http` - 他の層によって参照される名前
- `type` - データを処理するためにインスタンス化されるプロトコルハンドラーを示します。
   以下の一連の事前定義されたプロトコルハンドラーがあります:
  * `tcp` - ネイティブClickHouseプロトコルハンドラー
  * `http` - HTTP ClickHouseプロトコルハンドラー
  * `tls` - TLS暗号化層
  * `proxy1` - PROXYv1層
  * `mysql` - MySQL互換プロトコルハンドラー
  * `postgres` - PostgreSQL互換プロトコルハンドラー
  * `prometheus` - Prometheusプロトコルハンドラー
  * `interserver` - ClickHouseインターサーバーハンドラー

:::note
`gRPC`プロトコルハンドラーは`コンポーザブルプロトコル`には実装されていません。
:::

### エンドポイントの構成 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

エンドポイント（リスニングポート）は、`<port>`およびオプションの`<host>`タグによって示されます。たとえば、以前に追加したHTTP層にエンドポイントを構成するには、次のように構成を変更できます:

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

`<host>`タグが省略されると、ルート構成の`<listen_host>`が使用されます。

### 層のシーケンスを構成する {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

層のシーケンスは、`<impl>`タグを使用して、別のモジュールを参照し定義されます。たとえば、plain_httpモジュールの上にTLS層を構成するには、構成を次のようにさらに変更できます:

```xml
<protocols>

  <!-- http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https module configured as a tls layer on top of plain_http module -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### エンドポイントを層に接続する {#endpoint-can-be-attached-to-any-layer}

エンドポイントは任意の層に接続できます。たとえば、HTTP（ポート8123）とHTTPS（ポート8443）のためのエンドポイントを定義できます:

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

追加のエンドポイントは、任意のモジュールを参照し、`<type>`タグを省略することで定義できます。たとえば、`plain_http`モジュールのために`another_http`エンドポイントを次のように定義できます:

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

### 追加の層パラメータの指定 {#some-modules-can-contain-specific-for-its-layer-parameters}

いくつかのモジュールには、追加の層パラメータを含めることができます。たとえば、TLS層では、プライベートキー（`privateKeyFile`）および証明書ファイル（`certificateFile`）を次のように指定できます:

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
