description: 'ClickHouse の PostgreSQL ワイヤプロトコルインターフェイスに関するドキュメント'
sidebar_label: 'PostgreSQL インターフェイス'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL インターフェイス'
```


# PostgreSQL インターフェイス

ClickHouse は PostgreSQL ワイヤプロトコルをサポートしており、これにより Postgres クライアントを使用して ClickHouse に接続できます。言い換えれば、ClickHouse は PostgreSQL インスタンスのように振る舞うことができ、直接サポートされていない PostgreSQL クライアントアプリケーション（例：Amazon Redshift）を ClickHouse に接続できます。

PostgreSQL ワイヤプロトコルを有効にするには、サーバーの設定ファイルに [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) 設定を追加します。例えば、`config.d` フォルダー内の新しい XML ファイルにポートを定義することができます：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、**Listening for PostgreSQL compatibility protocol** と述べているログメッセージを探します：

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
`psql` クライアントはパスワードでのログインを必要とするため、パスワードなしで `default` ユーザーで接続することはできません。`default` ユーザーにパスワードを設定するか、別のユーザーとしてログインしてください。
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

これで、PostgreSQL クライアントが ClickHouse に接続され、すべてのコマンドとクエリは ClickHouse 上で実行されます。

:::note
PostgreSQL プロトコルは現在、プレーンテキストパスワードのみをサポートしています。
:::

## SSL を使用する {#using-ssl}

ClickHouse インスタンスに SSL/TLS が設定されている場合、`postgresql_port` は同じ設定を使用します（ポートは安全なクライアントと安全でないクライアントで共有されます）。

各クライアントには SSL を使用して接続するための独自の方法があります。以下のコマンドは、証明書とキーを渡して `psql` を ClickHouse に安全に接続する方法を示しています：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## SCRAM-SHA-256 で ClickHouse ユーザー認証を設定する {#using-scram-sha256}

ClickHouse で安全なユーザー認証を確保するために、SCRAM-SHA-256 プロトコルの使用をお勧めします。users.xml ファイルで `password_scram_sha256_hex` 要素を指定してユーザーを構成します。パスワードハッシュは num_iterations=4096 で生成する必要があります。

psql クライアントが接続時に SCRAM-SHA-256 をサポートおよび交渉していることを確認します。

ユーザー `user_with_sha256` の例設定で、パスワードが `abacaba` の場合：

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

[PostgreSQL ドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html) で SSL 設定の詳細を確認してください。

