---
slug: /engines/table-engines/integrations/ExternalDistributed
sidebar_position: 55
sidebar_label: ExternalDistributed
title: ExternalDistributed
description: "`ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行することを可能にします。シャーディングが可能なため、MySQLまたはPostgreSQLエンジンを引数として受け入れます。"
---

`ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行することを可能にします。[MySQL](../../../engines/table-engines/integrations/mysql.md)または[PostgreSQL](../../../engines/table-engines/integrations/postgresql.md)エンジンを引数として受け入れるため、シャーディングが可能です。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query)クエリの詳細な説明を参照してください。

テーブルの構造は元のテーブルの構造と異なる場合があります：

- カラム名は元のテーブルと同じにする必要がありますが、これらのカラムの一部を使用することもでき、順番も自由です。
- カラムタイプは元のテーブルとは異なる場合があります。ClickHouseは値をClickHouseのデータタイプに[キャスト](../../../sql-reference/functions/type-conversion-functions.md#type_conversion_function-cast)しようとします。

**エンジンパラメーター**

- `engine` — テーブルエンジン `MySQL` または `PostgreSQL`。
- `host:port` — MySQLまたはPostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — ユーザー名。
- `password` — ユーザーパスワード。

## 実装の詳細 {#implementation-details}

複数のレプリカをサポートしており、`|`で区切ってリストする必要があります。シャードは`,`で区切ってリストする必要があります。例えば：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカを指定する際、読み取り時に各シャードのために利用可能なレプリカの中から1つが選択されます。接続が失敗した場合は、次のレプリカが選択され、すべてのレプリカに対してこのプロセスが続きます。すべてのレプリカに対して接続試行が失敗した場合、同じ方法でこの試行は複数回繰り返されます。

任意の数のシャードと各シャードに対して任意の数のレプリカを指定できます。

**関連情報**

- [MySQLテーブルエンジン](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQLテーブルエンジン](../../../engines/table-engines/integrations/postgresql.md)
- [分散テーブルエンジン](../../../engines/table-engines/special/distributed.md)
