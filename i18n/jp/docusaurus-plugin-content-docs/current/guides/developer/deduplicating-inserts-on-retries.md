---
slug: '/guides/developer/deduplicating-inserts-on-retries'
title: 'リトライ時の挿入重複の排除'
description: '挿入操作をリトライする際に重複データを防ぐ方法'
keywords:
- 'deduplication'
- 'deduplicate'
- 'insert retries'
- 'inserts'
---



Insert operations can sometimes fail due to errors such as timeouts. When inserts fail, data may or may not have been successfully inserted. This guide covers how to enable deduplication on insert retries such that the same data does not get inserted more than once.

データを ClickHouse に挿入する際には、タイムアウトなどのエラーにより挿入操作が失敗することがあります。挿入が失敗した場合、データが正常に挿入されているかは不明です。このガイドでは、同じデータが二重に挿入されないように、挿入のリトライ時にデデュプリケーションを有効にする方法について説明します。

When an insert is retried, ClickHouse tries to determine whether the data has already been successfully inserted. If the inserted data is marked as a duplicate, ClickHouse does not insert it into the destination table. However, the user will still receive a successful operation status as if the data had been inserted normally.

挿入がリトライされると、ClickHouse はデータがすでに正常に挿入されているかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouse はそれを宛先テーブルに挿入しません。しかし、ユーザーにはデータが正常に挿入されたかのように、操作成功のステータスが表示されます。

## Enabling insert deduplication on retries {#enabling-insert-deduplication-on-retries}

## リトライ時の挿入デデュプリケーションの有効化 {#enabling-insert-deduplication-on-retries}

### Insert deduplication for tables {#insert-deduplication-for-tables}

### テーブルのための挿入デデュプリケーション {#insert-deduplication-for-tables}

**Only `*MergeTree` engines support deduplication on insertion.**

**挿入時のデデュプリケーションをサポートするのは `*MergeTree` エンジンのみです。**

For `*ReplicatedMergeTree` engines, insert deduplication is enabled by default and is controlled by the [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) and [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) settings. For non-replicated `*MergeTree` engines, deduplication is controlled by the [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) setting.

`*ReplicatedMergeTree` エンジンの場合、挿入デデュプリケーションはデフォルトで有効になっており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) および [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 設定によって制御されます。非レプリケーションの `*MergeTree` エンジンの場合、デデュプリケーションは [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 設定によって制御されます。

The settings above determine the parameters of the deduplication log for a table. The deduplication log stores a finite number of `block_id`s, which determine how deduplication works (see below).

上記の設定は、テーブルのデデュプリケーションログのパラメータを決定します。デデュプリケーションログは有限の数の `block_id` を保存し、デデュプリケーションがどのように機能するかを決定します（以下参照）。

### Query-level insert deduplication {#query-level-insert-deduplication}

### クエリレベルの挿入デデュプリケーション {#query-level-insert-deduplication}

The setting `insert_deduplicate=1` enables deduplication at the query level. Note that if you insert data with `insert_deduplicate=0`, that data cannot be deduplicated even if you retry an insert with `insert_deduplicate=1`. This is because the `block_id`s are not written for blocks during inserts with `insert_deduplicate=0`.

設定 `insert_deduplicate=1` は、クエリレベルでのデデュプリケーションを有効にします。`insert_deduplicate=0` でデータを挿入した場合、そのデータは `insert_deduplicate=1` で挿入をリトライしてもデデュプリケートできません。これは、`insert_deduplicate=0` による挿入時には、ブロックに対して `block_id` が書き込まれないためです。

## How insert deduplication works {#how-insert-deduplication-works}

## 挿入デデュプリケーションの動作方法 {#how-insert-deduplication-works}

When data is inserted into ClickHouse, it splits data into blocks based on the number of rows and bytes.

データが ClickHouse に挿入されると、行数とバイト数に基づいてデータをブロックに分割します。

For tables using `*MergeTree` engines, each block is assigned a unique `block_id`, which is a hash of the data in that block. This `block_id` is used as a unique key for the insert operation. If the same `block_id` is found in the deduplication log, the block is considered a duplicate and is not inserted into the table.

`*MergeTree` エンジンを使用しているテーブルの場合、各ブロックにはユニークな `block_id` が割り当てられ、これはそのブロック内のデータのハッシュです。この `block_id` は挿入操作のユニークキーとして使用されます。同じ `block_id` がデデュプリケーションログに見つかった場合、そのブロックは重複と見なされ、テーブルには挿入されません。

This approach works well for cases where inserts contain different data. However, if the same data is inserted multiple times intentionally, you need to use the `insert_deduplication_token` setting to control the deduplication process. This setting allows you to specify a unique token for each insert, which ClickHouse uses to determine whether the data is a duplicate.

このアプローチは、挿入するデータが異なる場合にうまく機能します。しかし、同じデータが意図的に複数回挿入される場合には、`insert_deduplication_token` 設定を使用してデデュプリケーションプロセスを制御する必要があります。この設定を使用すると、各挿入に対してユニークなトークンを指定でき、ClickHouse はそれを使用してデータが重複しているかどうかを判断します。

For `INSERT ... VALUES` queries, splitting the inserted data into blocks is deterministic and is determined by settings. Therefore, users should retry insertions with the same settings values as the initial operation.

`INSERT ... VALUES` クエリの場合、挿入されたデータをブロックに分割することは決定論的であり、設定によって決まります。したがって、ユーザーは初期操作と同じ設定値で挿入をリトライするべきです。

For `INSERT ... SELECT` queries, it is important that the `SELECT` part of the query returns the same data in the same order for each operation. Note that this is hard to achieve in practical usage. To ensure stable data order on retries, define a precise `ORDER BY` section in the `SELECT` part of the query. Keep in mind that it is possible that the selected table could be updated between retries: the result data could have changed and deduplication will not occur. Additionally, in situations where you are inserting large amounts of data, it is possible that the number of blocks after inserts can overflow the deduplication log window, and ClickHouse won't know to deduplicate the blocks.

`INSERT ... SELECT` クエリの場合、クエリの `SELECT` 部分が各操作で同じデータを同じ順序で返すことが重要です。これは実際の使用で達成するのが難しい点に注意してください。リトライ時にデータ順序が安定することを保証するために、クエリの `SELECT` 部分に正確な `ORDER BY` セクションを定義してください。リトライの間に選択されたテーブルが更新される可能性があることにも留意してください: 結果データが変更されてデデュプリケーションが行われない可能性があります。また、大量のデータを挿入している場合、挿入後のブロック数がデデュプリケーションログウィンドウをオーバーフローする可能性があり、ClickHouse はブロックをデデュプリケートする方法を知りません。

## Insert deduplication with materialized views {#insert-deduplication-with-materialized-views}

## マテリアライズドビューを使用した挿入デデュプリケーション {#insert-deduplication-with-materialized-views}

When a table has one or more materialized views, the inserted data is also inserted into the destination of those views with the defined transformations. The transformed data is also deduplicated on retries. ClickHouse performs deduplications for materialized views in the same way it deduplicates data inserted into the target table.

テーブルに1つ以上のマテリアライズドビューがある場合、挿入されたデータは定義された変換とともにそれらのビューの宛先にも挿入されます。変換されたデータもリトライ時にデデュプリケートされます。ClickHouse は、マテリアライズドビューに対してデデュプリケーションを実行する際、ターゲットテーブルに挿入されたデータのデデュプリケーションと同じように処理します。

You can control this process using the following settings for the source table:

このプロセスは、ソーステーブルに対して以下の設定を使用して制御できます。

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

You can also use the user profile setting [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views).

ユーザープロファイル設定 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views) を使用することもできます。

When inserting blocks into tables under materialized views, ClickHouse calculates the `block_id` by hashing a string that combines the `block_id`s from the source table and additional identifiers. This ensures accurate deduplication within materialized views, allowing data to be distinguished based on its original insertion, regardless of any transformations applied before reaching the destination table under the materialized view.

マテリアライズドビューの下にあるテーブルにブロックを挿入する際、ClickHouse はソーステーブルからの `block_id` および追加の識別子を組み合わせた文字列をハッシュ化して `block_id` を計算します。これにより、マテリアライズドビュー内での正確なデデュプリケーションが保証され、どのような変換が行われる前に元の挿入に基づいてデータを区別できるようになります。

## Examples {#examples}

## 例 {#examples}

### Identical blocks after materialized view transformations {#identical-blocks-after-materialized-view-transformations}

### マテリアライズドビューの変換後の同一ブロック {#identical-blocks-after-materialized-view-transformations}

Identical blocks, which have been generated during transformation inside a materialized view, are not deduplicated because they are based on different inserted data.

マテリアライズドビュー内での変換中に生成された同一ブロックは、異なる挿入データに基づいているためデデュプリケートされません。

Here is an example:

以下が例です：

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;
```

```sql
SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

The settings above allow us to select from a table with a series of blocks containing only one row. These small blocks are not squashed and remain the same until they are inserted into a table.

上記の設定により、1行だけを含む一連のブロックからテーブルを選択できるようになります。これらの小さなブロックは圧縮されず、テーブルに挿入されるまでそのまま残ります。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

We need to enable deduplication in materialized view:

マテリアライズドビューでのデデュプリケーションを有効にする必要があります：

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Here we see that two parts have been inserted into the `dst` table. 2 blocks from select -- 2 parts on insert. The parts contains different data.

ここでは、`dst` テーブルに2つのパーツが挿入されたことがわかります。select からの2ブロック--挿入時の2パーツ。パーツには異なるデータが含まれています。

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Here we see that 2 parts have been inserted into the `mv_dst` table. That parts contain the same data, however they are not deduplicated.

ここでは、`mv_dst` テーブルに2つのパーツが挿入されたことがわかります。そのパーツは同じデータを含んでいますが、デデュプリケートされていません。

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘

SELECT
    *,
    _part
FROM mv_dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Here we see that when we retry the inserts, all data is deduplicated. Deduplication works for both the `dst` and `mv_dst` tables.

ここでは、リトライ時にすべてのデータがデデュプリケートされていることがわかります。デデュプリケーションは、`dst` と `mv_dst` テーブルの両方で機能します。

### Identical blocks on insertion {#identical-blocks-on-insertion}

### 挿入時の同一ブロック {#identical-blocks-on-insertion}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Insertion:

挿入：

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2);

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

With the settings above, two blocks result from select– as a result, there should be two blocks for insertion into table `dst`. However, we see that only one block has been inserted into table `dst`. This occurred because the second block has been deduplicated. It has the same data and the key for deduplication `block_id` which is calculated as a hash from the inserted data. This behaviour is not what was expected. Such cases are a rare occurrence, but theoretically is possible. In order to handle such cases correctly, the user has to provide a `insert_deduplication_token`. Let's fix this with the following examples:

上記の設定では、select から2ブロックが生成されるため、`dst` テーブルに挿入するためには2ブロック必要です。しかし、`dst` テーブルには1つのブロックしか挿入されていないことがわかります。これは、2番目のブロックがデデュプリケートされたためです。これは同じデータが含まれており、重複のための `block_id` は挿入データのハッシュとして計算されたためです。この動作は期待されるものではありません。このようなケースは稀ですが、理論的には可能です。このようなケースを適切に処理するためには、ユーザーが `insert_deduplication_token` を提供する必要があります。以下の例で修正してみましょう：

### Identical blocks in insertion with `insert_deduplication_token` {#identical-blocks-in-insertion-with-insert-deduplication_token}

### `insert_deduplication_token` を使用した挿入時の同一ブロック {#identical-blocks-in-insertion-with-insert_deduplication_token}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Insertion:

挿入：

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Two identical blocks have been inserted as expected.

予想通り、2つの同一ブロックが挿入されました。

```sql
select 'second attempt';

INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Retried insertion is deduplicated as expected.

リトライした挿入も予想通りデデュプリケートされました。

```sql
select 'third attempt';

INSERT INTO dst SELECT
    1 AS key,
    'b' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

That insertion is also deduplicated even though it contains different inserted data. Note that `insert_deduplication_token` has higher priority: ClickHouse does not use the hash sum of data when `insert_deduplication_token` is provided.

その挿入も異なる挿入データが含まれていてもデデュプリケートされます。`insert_deduplication_token` が優先されることに注意してください: `insert_deduplication_token` が提供されている場合、ClickHouse はデータのハッシュ合計を使用しません。

### Different insert operations generate the same data after transformation in the underlying table of the materialized view {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

### マテリアライズドビューの基盤となるテーブルでの変換後に異なる挿入操作が同じデータを生成する {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
└───────────────┴─────┴───────┴───────────┘

select 'second attempt';

INSERT INTO dst VALUES (2, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
│ from dst   │   2 │ A     │ all_1_1_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

We insert different data each time. However, the same data is inserted into the `mv_dst` table. Data is not deduplicated because the source data was different.

毎回異なるデータを挿入しています。しかし、同じデータが `mv_dst` テーブルに挿入されています。ソースデータが異なるため、データはデデュプリケートされません。

### Different materialized view inserts into one underlying table with equivalent data {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

### 同一データに対して1つの基盤となるテーブルに異なるマテリアライズドビューの挿入 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE TABLE mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_first
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

CREATE MATERIALIZED VIEW mv_second
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

Two equal blocks inserted to the table `mv_dst` (as expected).

期待通り、`mv_dst` テーブルに等しい2つのブロックが挿入されました。

```sql
select 'second attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

That retry operation is deduplicated on both tables `dst` and `mv_dst`. 

そのリトライ操作は、`dst` テーブルと `mv_dst` テーブルの両方でデデュプリケートされます。
