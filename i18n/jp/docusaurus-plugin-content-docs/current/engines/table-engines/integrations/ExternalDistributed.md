---
slug: /engines/table-engines/integrations/ExternalDistributed
sidebar_position: 55
sidebar_label: ExternalDistributed
title: ExternalDistributed
description: "The `ExternalDistributed` engine allows to perform `SELECT` queries on data that is stored on a remote servers MySQL or PostgreSQL. Accepts MySQL or PostgreSQL engines as an argument so sharding is possible."
---

`ExternalDistributed`エンジンを使用すると、リモートサーバーのMySQLまたはPostgreSQLに保存されているデータに対して`SELECT`クエリを実行できます。MySQLまたはPostgreSQLエンジンを引数として受け入れるため、シャーディングが可能です。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

テーブル構造は元のテーブル構造と異なる場合があります：

- カラム名は元のテーブルと同じである必要がありますが、これらのカラムの一部のみを使用することや、いかなる順序で使用することも可能です。
- カラムタイプは元のテーブルのものと異なる場合があります。ClickHouseは値をClickHouseのデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。

**エンジンパラメータ**

- `engine` — テーブルエンジン `MySQL` または `PostgreSQL`。
- `host:port` — MySQLまたはPostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — ユーザー名。
- `password` — ユーザーパスワード。

## 実装の詳細 {#implementation-details}

複数のレプリカをサポートしており、`|`で列挙する必要があります。また、シャードは`,`で列挙する必要があります。例えば：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカを指定する際、リーディング時に各シャードの利用可能なレプリカの1つが選択されます。接続に失敗した場合は次のレプリカが選択され、すべてのレプリカに対してそのように続きます。すべてのレプリカで接続試行が失敗した場合は、同じ方法で何度も試みられます。

各シャードに対して任意の数のシャードと任意の数のレプリカを指定できます。

**参照**

- [MySQLテーブルエンジン](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQLテーブルエンジン](../../../engines/table-engines/integrations/postgresql.md)
- [分散テーブルエンジン](../../../engines/table-engines/special/distributed.md)
