---
description: 'リモート PostgreSQL サーバー上のデータベースに接続するための機能です。'
sidebar_label: 'PostgreSQL'
sidebar_position: 40
slug: /engines/database-engines/postgresql
title: 'PostgreSQL'
doc_type: 'guide'
---



# PostgreSQL

リモートの [PostgreSQL](https://www.postgresql.org) サーバー上のデータベースに接続できます。ClickHouse と PostgreSQL 間でデータを交換するための読み取りおよび書き込み操作（`SELECT` および `INSERT` クエリ）をサポートします。

`SHOW TABLES` および `DESCRIBE TABLE` クエリを利用して、リモート PostgreSQL のテーブル一覧およびテーブル構造にリアルタイムでアクセスできます。

テーブル構造の変更（`ALTER TABLE ... ADD|DROP COLUMN`）をサポートします。`use_table_cache` パラメータ（エンジンパラメータは下記参照）が `1` に設定されている場合、テーブル構造はキャッシュされ、変更されているかどうかはチェックされませんが、`DETACH` および `ATTACH` クエリで更新できます。



## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーのパスワード。
- `schema` — PostgreSQLスキーマ。
- `use_table_cache` — データベーステーブル構造をキャッシュするかどうかを定義します。オプション。デフォルト値:`0`。


## データ型のサポート {#data_types-support}

| PostgreSQL       | ClickHouse                                                    |
| ---------------- | ------------------------------------------------------------- |
| DATE             | [Date](../../sql-reference/data-types/date.md)                |
| TIMESTAMP        | [DateTime](../../sql-reference/data-types/datetime.md)        |
| REAL             | [Float32](../../sql-reference/data-types/float.md)            |
| DOUBLE           | [Float64](../../sql-reference/data-types/float.md)            |
| DECIMAL, NUMERIC | [Decimal](../../sql-reference/data-types/decimal.md)          |
| SMALLINT         | [Int16](../../sql-reference/data-types/int-uint.md)           |
| INTEGER          | [Int32](../../sql-reference/data-types/int-uint.md)           |
| BIGINT           | [Int64](../../sql-reference/data-types/int-uint.md)           |
| SERIAL           | [UInt32](../../sql-reference/data-types/int-uint.md)          |
| BIGSERIAL        | [UInt64](../../sql-reference/data-types/int-uint.md)          |
| TEXT, CHAR       | [String](../../sql-reference/data-types/string.md)            |
| INTEGER          | Nullable([Int32](../../sql-reference/data-types/int-uint.md)) |
| ARRAY            | [Array](../../sql-reference/data-types/array.md)              |


## 使用例 {#examples-of-use}

PostgreSQLサーバーとデータを交換するClickHouseのデータベース:

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('postgres1:5432', 'test_database', 'postgres', 'mysecretpassword', 'schema_name',1);
```

```sql
SHOW DATABASES;
```

```text
┌─name──────────┐
│ default       │
│ test_database │
│ system        │
└───────────────┘
```

```sql
SHOW TABLES FROM test_database;
```

```text
┌─name───────┐
│ test_table │
└────────────┘
```

PostgreSQLテーブルからのデータ読み取り:

```sql
SELECT * FROM test_database.test_table;
```

```text
┌─id─┬─value─┐
│  1 │     2 │
└────┴───────┘
```

PostgreSQLテーブルへのデータ書き込み:

```sql
INSERT INTO test_database.test_table VALUES (3,4);
SELECT * FROM test_database.test_table;
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```

PostgreSQLでテーブル構造が変更された場合を考えます:

```sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

データベース作成時に`use_table_cache`パラメータが`1`に設定されていたため、ClickHouseのテーブル構造はキャッシュされており、変更されていません:

```sql
DESCRIBE TABLE test_database.test_table;
```

```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

テーブルをデタッチして再度アタッチした後、構造が更新されました:

```sql
DETACH TABLE test_database.test_table;
ATTACH TABLE test_database.test_table;
DESCRIBE TABLE test_database.test_table;
```

```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
│ data   │ Nullable(String)  │
└────────┴───────────────────┘
```


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データ分析における理想的な組み合わせ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データ分析における理想的な組み合わせ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
