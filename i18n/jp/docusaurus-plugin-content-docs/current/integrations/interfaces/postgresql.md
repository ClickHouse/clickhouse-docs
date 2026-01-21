---
description: 'ClickHouse の PostgreSQL ワイヤープロトコルインターフェイスに関するドキュメント'
sidebar_label: 'PostgreSQL インターフェイス'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL インターフェイス'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# PostgreSQL インターフェイス \{#postgresql-interface\}

<CloudNotSupportedBadge />

ClickHouse は PostgreSQL ワイヤープロトコルをサポートしており、Postgres クライアントを使用して ClickHouse に接続できます。言い換えると、ClickHouse は PostgreSQL インスタンスとして振る舞うことができるため、ClickHouse でまだ直接サポートされていない PostgreSQL クライアントアプリケーション（例: Amazon Redshift）を ClickHouse に接続できます。

PostgreSQL ワイヤープロトコルを有効にするには、[postgresql&#95;port](/operations/server-configuration-parameters/settings#postgresql_port) 設定をサーバーの構成ファイルに追加します。たとえば、`config.d` フォルダ内の新しい XML ファイルでポートを定義できます。

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、**Listening for PostgreSQL compatibility protocol** といった内容のログメッセージを探します。

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## psql を ClickHouse に接続する \{#connect-psql-to-clickhouse\}

以下のコマンドは、PostgreSQL クライアント `psql` を ClickHouse に接続する方法を示します。

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例：

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` クライアントではパスワードによるログインが必須のため、パスワードなしの `default` ユーザーでは接続できません。`default` ユーザーにパスワードを設定するか、別のユーザーとしてログインしてください。
:::

`psql` クライアントはパスワードの入力を求めます。

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

以上です。これで ClickHouse に接続された PostgreSQL クライアントが利用でき、すべてのコマンドおよびクエリは ClickHouse 上で実行されます。

:::note
PostgreSQL プロトコルは現在、プレーンテキストのパスワードのみをサポートしています。
:::

## SSL の使用 \{#using-ssl\}

ClickHouse インスタンスで SSL/TLS が構成されている場合、`postgresql_port` は同じ設定を使用します（ポートはセキュアクライアントと非セキュアクライアントの両方で共有されます）。

各クライアントには、SSL を使用して接続するための固有の方法があります。次のコマンドは、証明書と鍵を指定して `psql` を ClickHouse にセキュアに接続する方法を示しています。

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## SCRAM-SHA-256 を使用した ClickHouse のユーザー認証設定 \{#using-scram-sha256\}

ClickHouse でのユーザー認証を安全に行うには、SCRAM-SHA-256 プロトコルを使用することが推奨されます。`users.xml` ファイル内で `password_scram_sha256_hex` 要素を指定してユーザーを設定します。パスワードハッシュは num&#95;iterations=4096 で生成する必要があります。

接続時に、`psql` クライアントが SCRAM-SHA-256 をサポートし、SCRAM-SHA-256 でネゴシエートできることを確認してください。

パスワード `abacaba` を持つユーザー `user_with_sha256` の設定例:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

SSL 設定の詳細については、[PostgreSQL のドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html)を参照してください。
