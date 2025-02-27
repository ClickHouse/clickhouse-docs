---
slug: /interfaces/postgresql
sidebar_position: 20
sidebar_label: PostgreSQLインターフェース
---

# PostgreSQLインターフェース

ClickHouseはPostgreSQLのワイヤプロトコルをサポートしており、これによりPostgresクライアントを使ってClickHouseに接続することができます。言い換えれば、ClickHouseはPostgreSQLインスタンスのように振る舞うことができ、ClickHouseに直接サポートされていないPostgreSQLクライアントアプリケーション（例えば、Amazon Redshift）を接続することが可能です。

PostgreSQLワイヤプロトコルを有効にするには、サーバの設定ファイルに[postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port)設定を追加します。例えば、次のように`config.d`フォルダ内の新しいXMLファイルでポートを定義することができます：

```xml
<clickhouse>
	<postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouseサーバを起動し、以下のような**Listening for PostgreSQL compatibility protocol**と記載されたログメッセージが出力されるのを確認します：

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
`psql`クライアントはパスワードでのログインを必要とするため、パスワードなしの`default`ユーザーで接続することはできません。`default`ユーザーにパスワードを設定するか、異なるユーザーでログインしてください。
:::

`psql`クライアントはパスワードを求めます：

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

これで完了です！PostgreSQLクライアントがClickHouseに接続され、すべてのコマンドとクエリはClickHouseで実行されます。

:::note
PostgreSQLプロトコルは現在、プレーンテキストパスワードのみをサポートしています。
:::

## SSLの使用 {#using-ssl}

ClickHouseインスタンスにSSL/TLSが設定されている場合、`postgresql_port`は同じ設定を使用します（ポートは安全なクライアントと安全でないクライアントで共有されます）。

各クライアントにはSSLを使用して接続するための独自の方法があります。以下のコマンドは、証明書とキーを使用して`psql`をClickHouseに安全に接続する方法を示しています：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

SSL設定に関する詳細は[PostgreSQLのドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html)を参照してください。
