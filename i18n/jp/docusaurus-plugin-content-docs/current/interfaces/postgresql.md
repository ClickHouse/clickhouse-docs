---
slug: /interfaces/postgresql
sidebar_position: 20
sidebar_label: PostgreSQL インターフェース
---


# PostgreSQL インターフェース

ClickHouseはPostgreSQLワイヤプロトコルをサポートしており、Postgresクライアントを使用してClickHouseに接続することができます。言い換えれば、ClickHouseはPostgreSQLインスタンスのように振る舞うことができ、ClickHouseによって直接サポートされていないPostgreSQLクライアントアプリケーション（例えば、Amazon Redshift）をClickHouseに接続することが可能です。

PostgreSQLワイヤプロトコルを有効にするには、サーバーの設定ファイルに[postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port)設定を追加します。例えば、`config.d`フォルダー内の新しいXMLファイルにポートを定義することができます：

```xml
<clickhouse>
	<postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouseサーバーを起動し、次のような**PostgreSQL互換プロトコルをリッスン中**と記載されたログメッセージを探します：

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## psqlをClickHouseに接続する {#connect-psql-to-clickhouse}

以下のコマンドは、PostgreSQLクライアント`psql`をClickHouseに接続する方法を示しています：

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例えば：

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql`クライアントはパスワードによるログインを必要とするため、パスワードなしで`default`ユーザーを使用して接続することはできません。`default`ユーザーにパスワードを設定するか、他のユーザーとしてログインしてください。
:::

`psql`クライアントはパスワードを要求します：

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

これで完了です！あなたは今、ClickHouseに接続されたPostgreSQLクライアントを持ち、すべてのコマンドとクエリはClickHouse上で実行されます。

:::note
PostgreSQLプロトコルは現在、プレーンテキストのパスワードのみをサポートしています。
:::

## SSLの使用 {#using-ssl}

ClickHouseインスタンスにSSL/TLSが構成されている場合、`postgresql_port`は同じ設定を使用します（ポートは安全なクライアントと非安全なクライアントの両方で共有されます）。

各クライアントはSSLを使用して接続する方法が異なります。以下のコマンドは、証明書とキーを渡して`psql`をClickHouseに安全に接続する方法を示しています：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

詳細については、[PostgreSQLのドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html)を参照してください。
