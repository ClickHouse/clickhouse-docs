---
slug: /engines/database-engines/postgresql
sidebar_position: 40
sidebar_label: PostgreSQL
title: "PostgreSQL"
description: "リモートPostgreSQLサーバーのデータベースに接続することを可能にします。"
---

# PostgreSQL

リモートの [PostgreSQL](https://www.postgresql.org) サーバーにあるデータベースに接続することを可能にします。ClickHouseとPostgreSQL間でデータを交換するために、読み取りおよび書き込み操作（`SELECT` と `INSERT` クエリ）をサポートしています。

`SHOW TABLES` と `DESCRIBE TABLE` クエリを使用して、リモートPostgreSQLからテーブルのリストとテーブル構造にリアルタイムでアクセスできます。

テーブル構造の変更（`ALTER TABLE ... ADD|DROP COLUMN`）をサポートします。`use_table_cache` パラメータ（以下のエンジンパラメータを参照）が `1` に設定されている場合、テーブル構造はキャッシュされ、変更が確認されませんが、`DETACH` および `ATTACH` クエリで更新できます。

## データベースの作成 {#creating-a-database}

``` sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — PostgreSQLスキーマ。
- `use_table_cache` — データベースのテーブル構造がキャッシュされるかどうかを定義します。オプショナル。デフォルト値：`0`。

## データ型のサポート {#data_types-support}

| PostgreSQL       | ClickHouse                                                   |
|------------------|--------------------------------------------------------------|
| DATE             | [Date](../../sql-reference/data-types/date.md)               |
| TIMESTAMP        | [DateTime](../../sql-reference/data-types/datetime.md)       |
| REAL             | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE           | [Float64](../../sql-reference/data-types/float.md)           |
| DECIMAL, NUMERIC | [Decimal](../../sql-reference/data-types/decimal.md)       |
| SMALLINT         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| INTEGER          | [Int32](../../sql-reference/data-types/int-uint.md)          |
| BIGINT           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| SERIAL           | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| BIGSERIAL        | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| TEXT, CHAR       | [String](../../sql-reference/data-types/string.md)           |
| INTEGER          | Nullable([Int32](../../sql-reference/data-types/int-uint.md))|
| ARRAY            | [Array](../../sql-reference/data-types/array.md)             |


## 使用例 {#examples-of-use}

ClickHouse内のデータベースでPostgreSQLサーバーとデータを交換する例：

``` sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('postgres1:5432', 'test_database', 'postgres', 'mysecretpassword', 'schema_name',1);
```

``` sql
SHOW DATABASES;
```

``` text
┌─name──────────┐
│ default       │
│ test_database │
│ system        │
└───────────────┘
```

``` sql
SHOW TABLES FROM test_database;
```

``` text
┌─name───────┐
│ test_table │
└────────────┘
```

PostgreSQLテーブルからデータを読み取る：

``` sql
SELECT * FROM test_database.test_table;
```

``` text
┌─id─┬─value─┐
│  1 │     2 │
└────┴───────┘
```

PostgreSQLテーブルにデータを書き込む：

``` sql
INSERT INTO test_database.test_table VALUES (3,4);
SELECT * FROM test_database.test_table;
```

``` text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```

PostgreSQLでテーブル構造が変更されたと仮定します：

``` sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

データベースが作成されたときに `use_table_cache` パラメータが `1` に設定されたため、ClickHouse内のテーブル構造はキャッシュされており、したがって変更されていませんでした：

``` sql
DESCRIBE TABLE test_database.test_table;
```
``` text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

テーブルを切り離して再接続した後、構造が更新されました：

``` sql
DETACH TABLE test_database.test_table;
ATTACH TABLE test_database.test_table;
DESCRIBE TABLE test_database.test_table;
```
``` text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
│ data   │ Nullable(String)  │
└────────┴───────────────────┘
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データヘブンでのマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データヘブンでのマッチ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
