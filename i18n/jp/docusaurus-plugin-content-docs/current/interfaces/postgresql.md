---
description: 'ClickHouse の PostgreSQL ワイヤープロトコルインターフェイスに関するドキュメント'
sidebar_label: 'PostgreSQL インターフェイス'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL インターフェイス'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# PostgreSQL インターフェイス

<CloudNotSupportedBadge />

ClickHouse は PostgreSQL ワイヤープロトコルをサポートしており、PostgreSQL クライアントを使用して ClickHouse に接続できます。ある意味で、ClickHouse は PostgreSQL インスタンスとして振る舞うことができるため、ClickHouse がまだ直接サポートしていない PostgreSQL クライアントアプリケーション（例: Amazon Redshift）を ClickHouse に接続できるようになります。

PostgreSQL ワイヤープロトコルを有効にするには、サーバーの設定ファイルに [postgresql&#95;port](../operations/server-configuration-parameters/settings.md#postgresql_port) という設定項目を追加します。たとえば、`config.d` ディレクトリ内の新しい XML ファイルでポートを定義できます。

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、**Listening for PostgreSQL compatibility protocol** といった記述を含む、次のようなログメッセージを探します。

```response
{} <Information> Application: PostgreSQL互換プロトコルをリッスン中: 127.0.0.1:9005
```


## psqlをClickHouseに接続する {#connect-psql-to-clickhouse}

以下のコマンドは、PostgreSQLクライアント`psql`をClickHouseに接続する方法を示しています:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql`クライアントはパスワード付きのログインが必要なため、パスワードなしの`default`ユーザーでは接続できません。`default`ユーザーにパスワードを設定するか、別のユーザーでログインしてください。
:::

`psql`クライアントはパスワードの入力を求めます:

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

以上です!これでPostgreSQLクライアントがClickHouseに接続され、すべてのコマンドとクエリはClickHouse上で実行されます。

:::note
PostgreSQLプロトコルは現在、平文パスワードのみをサポートしています。
:::


## SSLの使用 {#using-ssl}

ClickHouseインスタンスでSSL/TLSが設定されている場合、`postgresql_port`は同じ設定を使用します（このポートは、セキュアな接続と非セキュアな接続の両方のクライアントで共有されます）。

各クライアントには、SSLを使用して接続するための独自の方法があります。以下のコマンドは、証明書と鍵を指定して`psql`をClickHouseに安全に接続する方法を示しています：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```


## SCRAM-SHA-256によるClickHouseユーザー認証の設定 {#using-scram-sha256}

ClickHouseで安全なユーザー認証を確保するには、SCRAM-SHA-256プロトコルの使用を推奨します。users.xmlファイル内で`password_scram_sha256_hex`要素を指定してユーザーを設定してください。パスワードハッシュはnum_iterations=4096で生成する必要があります。

psqlクライアントが接続時にSCRAM-SHA-256をサポートし、ネゴシエーションを行うことを確認してください。

パスワード`abacaba`を持つユーザー`user_with_sha256`の設定例:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

SSL設定の詳細については、[PostgreSQLドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html)を参照してください。
