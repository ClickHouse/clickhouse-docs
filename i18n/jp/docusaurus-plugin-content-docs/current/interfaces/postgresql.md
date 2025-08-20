---
description: 'Documentation for the PostgreSQL wire protocol interface in ClickHouse'
sidebar_label: 'PostgreSQL Interface'
sidebar_position: 20
slug: '/interfaces/postgresql'
title: 'PostgreSQL Interface'
---




# PostgreSQL インターフェース

ClickHouse は PostgreSQL ワイヤプロトコルをサポートしており、これにより PostgreSQL クライアントを使用して ClickHouse に接続できます。言い換えれば、ClickHouse は PostgreSQL インスタンスのように振る舞うことができるため、ClickHouse に直接サポートされていない PostgreSQL クライアントアプリケーション（例えば、Amazon Redshift）を接続することが可能です。

PostgreSQL ワイヤプロトコルを有効にするには、サーバーの構成ファイルに [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) 設定を追加します。例えば、`config.d` フォルダ内に新しい XML ファイルでポートを定義できます：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、**Listening for PostgreSQL compatibility protocol** に言及している以下のようなログメッセージを探します：

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## psql を ClickHouse に接続する {#connect-psql-to-clickhouse}

以下のコマンドは、PostgreSQL クライアント `psql` を ClickHouse に接続する方法を示しています：

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例えば：

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` クライアントはパスワードでのログインを要求するため、パスワードなしの `default` ユーザーで接続することはできません。`default` ユーザーにパスワードを設定するか、別のユーザーとしてログインしてください。
:::

`psql` クライアントはパスワードを求めます：

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

これで終了です！ PostgreSQL クライアントが ClickHouse に接続され、すべてのコマンドおよびクエリは ClickHouse 上で実行されます。

:::note
PostgreSQL プロトコルは現在、プレーンテキストパスワードのみをサポートしています。
:::

## SSL の使用 {#using-ssl}

ClickHouse インスタンスに SSL/TLS が設定されている場合、`postgresql_port` は同じ設定を使用します（ポートは安全なクライアントと安全でないクライアントで共有されます）。

各クライアントには、SSL を使用して接続する方法があります。以下のコマンドは、証明書とキーを渡して `psql` を ClickHouse に安全に接続する方法を示しています：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## SCRAM-SHA-256 を使用した ClickHouse ユーザー認証の設定 {#using-scram-sha256}

ClickHouse での安全なユーザー認証を確保するために、SCRAM-SHA-256 プロトコルを使用することを推奨します。`users.xml` ファイルに `password_scram_sha256_hex` 要素を指定してユーザーを設定します。パスワードハッシュは num_iterations=4096 で生成する必要があります。

psql クライアントが接続時に SCRAM-SHA-256 をサポートおよび交渉することを確認します。

パスワード `abacaba` のユーザー `user_with_sha256` の例の設定：

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

彼らの SSL 設定について詳しくは [PostgreSQL ドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html) を参照してください。
