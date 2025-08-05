---
description: 'The `ExternalDistributed` engine allows to perform `SELECT` queries
  on data that is stored on a remote servers MySQL or PostgreSQL. Accepts MySQL or
  PostgreSQL engines as an argument so sharding is possible.'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: '/engines/table-engines/integrations/ExternalDistributed'
title: 'ExternalDistributed'
---



`ExternalDistributed` エンジンは、リモートサーバーの MySQL または PostgreSQL に保存されたデータに対して `SELECT` クエリを実行することを可能にします。シャーディングが可能なように、引数として [MySQL](../../../engines/table-engines/integrations/mysql.md) または [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) エンジンを受け入れます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

テーブルの構造は元のテーブルの構造と異なる場合があります：

- カラム名は元のテーブルと同じである必要がありますが、これらのカラムの一部のみを使用し、任意の順序で指定することができます。
- カラムタイプは元のテーブルのものと異なる場合があります。ClickHouse は [cast](/sql-reference/functions/type-conversion-functions#cast) 関数を使用して値を ClickHouse データ型に変換しようとします。

**エンジンのパラメータ**

- `engine` — テーブルエンジン `MySQL` または `PostgreSQL`。
- `host:port` — MySQL または PostgreSQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — ユーザー名。
- `password` — ユーザーパスワード。

## 実装の詳細 {#implementation-details}

複数のレプリカをサポートしており、`|` でリストされる必要があります。また、シャードは `,` でリストされる必要があります。例えば：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカを指定すると、読み取り時に各シャードの利用可能なレプリカのうちの1つが選択されます。接続が失敗した場合は、次のレプリカが選択され、全てのレプリカに対してそのように続けられます。もし全てのレプリカの接続試行が失敗した場合、同様の方法で数回試行されます。

各シャードに対して任意の数のシャードおよびレプリカを指定できます。

**関連情報**

- [MySQL テーブルエンジン](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQL テーブルエンジン](../../../engines/table-engines/integrations/postgresql.md)
- [分散テーブルエンジン](../../../engines/table-engines/special/distributed.md)
