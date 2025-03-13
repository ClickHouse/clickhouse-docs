---
slug: /engines/database-engines/postgresql
sidebar_position: 40
sidebar_label: PostgreSQL
title: "PostgreSQL"
description: "リモートのPostgreSQLサーバーにあるデータベースに接続します。"
---


# PostgreSQL

リモートの [PostgreSQL](https://www.postgresql.org) サーバーにあるデータベースに接続します。ClickHouseとPostgreSQL間でデータを交換するために、読み書き操作（`SELECT` および `INSERT` クエリ）をサポートしています。

`SHOW TABLES` および `DESCRIBE TABLE` クエリを使用して、リモートPostgreSQLからテーブル一覧とテーブル構造へのリアルタイムアクセスを提供します。

テーブル構造の変更（`ALTER TABLE ... ADD|DROP COLUMN`）もサポートしています。`use_table_cache` パラメータ（下記のエンジンパラメータを参照）が `1` に設定されている場合、テーブル構造はキャッシュされ、変更がチェックされませんが、`DETACH` および `ATTACH` クエリで更新することができます。

## データベースの作成 {#creating-a-database}

``` sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーアドレス。
- `database` — リモートデータベース名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーのパスワード。
- `schema` — PostgreSQLスキーマ。
- `use_table_cache` — データベースのテーブル構造がキャッシュされるかどうかを定義します。オプション。デフォルト値: `0`。

## データ型のサポート {#data_types-support}

| PostgreSQL       | ClickHouse                                                   |
|------------------|--------------------------------------------------------------|
| DATE             | [Date](../../sql-reference/data-types/date.md)               |
| TIMESTAMP        | [DateTime](../../sql-reference/data-types/datetime.md)       |
| REAL             | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE           | [Float64](../../sql-reference/data-types/float.md)           |
| DECIMAL, NUMERIC | [Decimal](../../sql-reference/data-types/decimal.md)         |
| SMALLINT         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| INTEGER          | [Int32](../../sql-reference/data-types/int-uint.md)          |
| BIGINT           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| SERIAL           | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| BIGSERIAL        | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| TEXT, CHAR       | [String](../../sql-reference/data-types/string.md)           |
| INTEGER          | Nullable([Int32](../../sql-reference/data-types/int-uint.md))|
| ARRAY            | [Array](../../sql-reference/data-types/array.md)             |


## 使用例 {#examples-of-use}

ClickHouse内のデータベースがPostgreSQLサーバーとデータを交換します:

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

PostgreSQLテーブルからデータを読み取ります:

``` sql
SELECT * FROM test_database.test_table;
```

``` text
┌─id─┬─value─┐
│  1 │     2 │
└────┴───────┘
```

PostgreSQLテーブルにデータを書き込みます:

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

PostgreSQLでテーブル構造が変更されたことを考慮します:

``` sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

データベース作成時に `use_table_cache` パラメータが `1` に設定されていたため、ClickHouseでのテーブル構造はキャッシュされ、したがって変更されませんでした:

``` sql
DESCRIBE TABLE test_database.test_table;
```
``` text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

テーブルをディタッチして再びアタッチした後、構造が更新されました:

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

- ブログ: [ClickHouseとPostgreSQL - データの天国における出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国における出会い - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
