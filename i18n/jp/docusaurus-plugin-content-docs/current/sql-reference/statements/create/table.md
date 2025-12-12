---
description: 'テーブルのドキュメント'
keywords: ['圧縮', 'コーデック', 'スキーマ', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

新しいテーブルを作成します。このクエリは、ユースケースに応じてさまざまな構文が利用できます。

デフォルトでは、テーブルは現在のサーバー上にのみ作成されます。分散 DDL クエリは `ON CLUSTER` 句として実装されており、[別途説明されています](../../../sql-reference/distributed-ddl.md)。

## 構文形式 {#syntax-forms}

### 明示的なスキーマ指定 {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

`db` データベース、もしくは `db` が設定されていない場合は現在のデータベースに、括弧内で指定された構造と `engine` エンジンを持つ `table_name` という名前のテーブルを作成します。
テーブルの構造は、列定義、セカンダリインデックス、および制約の一覧です。エンジンが [primary key](#primary-key) をサポートしている場合、テーブルエンジンのパラメータとして指定します。

最も単純な場合、列定義は `name type` です。例: `RegionID UInt32`。

デフォルト値用の式を定義することもできます（下記参照）。

必要に応じて、1 つ以上のキー式を用いて primary key を指定できます。

列およびテーブルにコメントを追加できます。

### 他のテーブルと同様のスキーマを使用する場合 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造のテーブルを作成します。テーブルに別のエンジンを指定できます。エンジンを指定しない場合は、`db2.name2` テーブルと同じエンジンが使用されます。

### 別のテーブルからスキーマとデータをクローンする場合 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

別のテーブルと同じ構造を持つテーブルを作成します。テーブルには異なるエンジンを指定できます。エンジンが指定されていない場合、`db2.name2` テーブルと同じエンジンが使用されます。新しいテーブルが作成された後、`db2.name2` のすべてのパーティションがそのテーブルにアタッチされます。言い換えると、`db2.name2` のデータは作成時に `db.table_name` にクローンされます。このクエリは次のものと等価です：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### テーブル関数から {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

指定した[テーブル関数](/sql-reference/table-functions)と同じ結果になるテーブルを作成します。作成されたテーブルは、指定した対応するテーブル関数と同様に動作します。

### SELECT クエリから {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT` クエリの結果と同じ構造を持つテーブルを、`engine` エンジンを使用して作成し、`SELECT` で得られたデータを挿入します。列の定義を明示的に指定することもできます。

テーブルがすでに存在していて `IF NOT EXISTS` が指定されている場合、このクエリは何も行いません。

クエリの `ENGINE` 句の後には、他の句を続けて指定することができます。テーブルの作成方法についての詳細なドキュメントは、[table engines](/engines/table-engines) の説明を参照してください。

**例**

クエリ:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

結果：

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```

## NULL または NOT NULL 修飾子 {#null-or-not-null-modifiers}

列定義におけるデータ型の後ろに付ける `NULL` および `NOT NULL` 修飾子は、その列を [Nullable](/sql-reference/data-types/nullable) 型にできるかどうかを指定します。

型が `Nullable` でない場合に `NULL` が指定されると、その型は `Nullable` として扱われます。`NOT NULL` が指定されると、`Nullable` にはなりません。例えば、`INT NULL` は `Nullable(INT)` と同じ意味になります。型がすでに `Nullable` であり、そこに `NULL` または `NOT NULL` 修飾子が指定された場合は、例外がスローされます。

[data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 設定も参照してください。

## デフォルト値 {#default_values}

カラム定義では、`DEFAULT expr`、`MATERIALIZED expr`、`ALIAS expr` の形式でデフォルト値の式を指定できます。例: `URLDomain String DEFAULT domain(URL)`。

式 `expr` は省略可能です。省略された場合、カラム型を明示的に指定しなければならず、デフォルト値は数値カラムでは `0`、文字列カラムでは `''`（空文字列）、配列カラムでは `[]`（空配列）、日付カラムでは `1970-01-01`、Nullable カラムでは `NULL` になります。

デフォルト値を持つカラムについては、カラム型を省略することができ、その場合は `expr` の型から推論されます。例えば、カラム `EventDate DEFAULT toDate(EventTime)` の型は Date 型になります。

データ型とデフォルト値の式が両方指定されている場合、式を指定された型に変換する暗黙の型変換関数が挿入されます。例: `Hits UInt32 DEFAULT 0` は内部的には `Hits UInt32 DEFAULT toUInt32(0)` として表現されます。

デフォルト値の式 `expr` では、任意のテーブルカラムおよび定数を参照できます。ClickHouse は、テーブル構造の変更によって式の計算にループが導入されないことを検証します。INSERT 時には、式が解決可能であること、つまり式の計算に必要となるすべてのカラムが指定されていることを確認します。

### DEFAULT {#default}

`DEFAULT expr`

通常のデフォルト値です。INSERT クエリでこのカラムの値が指定されなかった場合、`expr` から計算されます。

例:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) VALUES (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

マテリアライズド式。行が挿入されるとき、これらの列の値は指定されたマテリアライズド式に従って自動的に計算されます。`INSERT` 時に値を明示的に指定することはできません。

また、この型のデフォルト値列は `SELECT *` の結果には含まれません。これは、`SELECT *` の結果を常に `INSERT` を使ってテーブルにそのまま挿入し直せる、という不変条件を維持するためです。この挙動は、設定 `asterisk_include_materialized_columns` によって無効化できます。

例:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1);

SELECT * FROM test;
┌─id─┐
│  1 │
└────┘

SELECT id, updated_at, updated_at_date FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘

SELECT * FROM test SETTINGS asterisk_include_materialized_columns=1;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### EPHEMERAL {#ephemeral}

`EPHEMERAL [expr]`

エフェメラル列。 この型の列はテーブルに保存されず、そこから `SELECT` することはできません。 エフェメラル列の唯一の目的は、それを利用して他の列のデフォルト値式を構築することです。

明示的に列を指定しない `INSERT` では、この型の列はスキップされます。 これは、`SELECT *` の結果を常に `INSERT` を使ってテーブルに挿入し直せるというインバリアントを維持するためです。

例:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) VALUES (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714
```

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714

````sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
````sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```sql
CREATE DATABASE base 
ENGINE = Atomic;

CREATE OR REPLACE TABLE base.t1
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

┌─n─┬─s────┐
│ 1 │ test │
└───┴──────┘
```sql
    CREATE DATABASE base 
    ENGINE = Atomic;

    CREATE OR REPLACE TABLE base.t1
    (
        n UInt64,
        s String
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (1, 'test');

    SELECT * FROM base.t1;

    ┌─n─┬─s────┐
    │ 1 │ test │
    └───┴──────┘
    ```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

┌─n─┬─s──┐
│ 2 │ \N │
└───┴────┘
```sql
    CREATE OR REPLACE TABLE base.t1 
    (
        n UInt64,
        s Nullable(String)
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (2, null);

    SELECT * FROM base.t1;

    ┌─n─┬─s──┐
    │ 2 │ \N │
    └───┴────┘
    ```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

┌─n─┐
│ 3 │
└───┘
```sql
    REPLACE TABLE base.t1 (n UInt64) 
    ENGINE = MergeTree 
    ORDER BY n;

    INSERT INTO base.t1 VALUES (3);

    SELECT * FROM base.t1;

    ┌─n─┐
    │ 3 │
    └───┘
    ```sql
CREATE DATABASE base;

CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

1    test
```sql
    CREATE DATABASE base;

    CREATE OR REPLACE TABLE base.t1 
    (
        n UInt64,
        s String
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (1, 'test');

    SELECT * FROM base.t1;

    1    test
    ```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64, 
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

2    
```sql
    CREATE OR REPLACE TABLE base.t1 
    (
        n UInt64, 
        s Nullable(String)
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (2, null);

    SELECT * FROM base.t1;

    2    
    ```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

3
```sql
    REPLACE TABLE base.t1 (n UInt64) 
    ENGINE = MergeTree 
    ORDER BY n;

    INSERT INTO base.t1 VALUES (3);

    SELECT * FROM base.t1;

    3
    ```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '一時テーブル';
SELECT name, comment FROM system.tables WHERE name = 't1';
```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```text
┌─name─┬─comment─────────────┐
│ t1   │ 一時テーブル │
└──────┴─────────────────────┘
```

## 関連コンテンツ {#related-content}

- ブログ記事: [スキーマとコーデックによる ClickHouse の最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ記事: [ClickHouse における時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
