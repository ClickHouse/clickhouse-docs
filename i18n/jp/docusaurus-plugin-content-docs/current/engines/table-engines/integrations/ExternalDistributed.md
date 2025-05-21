---
description: '`ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行できるようにします。MySQLまたはPostgreSQLエンジンを引数として受け付けるため、シャーディングが可能です。'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'ExternalDistributed'
---

`ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行できるようにします。 [MySQL](../../../engines/table-engines/integrations/mysql.md)または[PostgreSQL](../../../engines/table-engines/integrations/postgresql.md)エンジンを引数として受け付けるため、シャーディングが可能です。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

テーブル構造は元のテーブル構造と異なる場合があります：

- カラム名は元のテーブルと同じである必要がありますが、これらのカラムの一部だけを使用し、順番を変更することができます。
- カラムタイプは元のテーブルのものと異なる場合があります。ClickHouseは値をClickHouseデータタイプに[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。

**エンジンパラメータ**

- `engine` — テーブルエンジン `MySQL`または`PostgreSQL`。
- `host:port` — MySQLまたはPostgreSQLサーバーアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — ユーザー名。
- `password` — ユーザーパスワード。

## 実装の詳細 {#implementation-details}

複数のレプリカをサポートしており、`|`で区切って一覧表示する必要があります。また、シャードは`,`で区切って一覧表示する必要があります。例えば：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカを指定する際、読み取り時に各シャードに対して利用可能なレプリカの1つが選択されます。接続が失敗した場合、次のレプリカが選択され、すべてのレプリカに対して同様に処理が行われます。すべてのレプリカに対して接続試行が失敗した場合、同じ方法で試行が数回繰り返されます。

各シャードに対して任意の数のシャードと任意の数のレプリカを指定できます。

**参照**

- [MySQLテーブルエンジン](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQLテーブルエンジン](../../../engines/table-engines/integrations/postgresql.md)
- [分散テーブルエンジン](../../../engines/table-engines/special/distributed.md)
