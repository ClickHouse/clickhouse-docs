---
description: 'リモート PostgreSQL サーバー上のデータベースへの接続を可能にします。'
sidebar_label: 'PostgreSQL'
sidebar_position: 40
slug: /engines/database-engines/postgresql
title: 'PostgreSQL'
doc_type: 'guide'
---



# PostgreSQL

リモート [PostgreSQL](https://www.postgresql.org) サーバー上のデータベースに接続できます。ClickHouse と PostgreSQL 間でデータをやり取りするために、読み取りおよび書き込み操作（`SELECT` および `INSERT` クエリ）をサポートします。

`SHOW TABLES` および `DESCRIBE TABLE` クエリを利用して、リモート PostgreSQL 上のテーブル一覧およびテーブル構造にリアルタイムでアクセスできます。

テーブル構造の変更（`ALTER TABLE ... ADD|DROP COLUMN`）をサポートします。`use_table_cache` パラメータ（後述の Engine パラメータを参照）が `1` に設定されている場合、テーブル構造はキャッシュされ、変更されているかどうかのチェックは行われませんが、`DETACH` および `ATTACH` クエリで更新できます。



## データベースの作成

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**エンジンパラメータ**

* `host:port` — PostgreSQL サーバーのアドレス。
* `database` — リモートデータベース名。
* `user` — PostgreSQL ユーザー。
* `password` — ユーザーのパスワード。
* `schema` — PostgreSQL スキーマ。
* `use_table_cache` — データベースのテーブル構造をキャッシュするかどうかを指定します。オプション。既定値: `0`。


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



## 利用例

ClickHouse 上のデータベースが PostgreSQL サーバーとデータを交換する例:

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

PostgreSQL テーブルからのデータ読み込み:

```sql
SELECT * FROM test_database.test_table;
```

```text
┌─id─┬─value─┐
│  1 │     2 │
└────┴───────┘
```

PostgreSQL テーブルにデータを書き込む:

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

PostgreSQL 側でテーブル構造を変更したとします。

```sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

データベース作成時に `use_table_cache` パラメータが `1` に設定されていたため、ClickHouse のテーブル構造はキャッシュされており、その結果、変更は行われませんでした。

```sql
DESCRIBE TABLE test_database.test_table;
```

```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

テーブルをデタッチして再度アタッチした後、構造が更新されました。

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

- ブログ: [ClickHouse と PostgreSQL - データ天国で生まれた理想の組み合わせ - パート 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouse と PostgreSQL - データ天国で生まれた理想の組み合わせ - パート 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
