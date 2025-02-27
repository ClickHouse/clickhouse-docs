---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 挿入の重複排除に関するガイド
description: 挿入操作を再試行する際の重複データの防止
keywords: [重複排除, 重複除去, 挿入再試行, 挿入]
---

挿入操作は、タイムアウトなどのエラーにより失敗する場合があります。挿入が失敗すると、データは正常に挿入されたかもしれませんし、そうでないかもしれません。このガイドでは、同じデータが複数回挿入されないように、挿入再試行時の重複排除を有効にする方法を説明します。

挿入が再試行されると、ClickHouseはデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouseはそれを宛先テーブルに挿入しません。ただし、ユーザーはデータが通常通り挿入されたかのように成功した操作ステータスを受け取ります。

## 再試行時の挿入重複排除の有効化 {#enabling-insert-deduplication-on-retries}

### テーブルの挿入重複排除 {#insert-deduplication-for-tables}

**重複排除は `*MergeTree` エンジンでのみサポートされています。**

`*ReplicatedMergeTree` エンジンでは、挿入の重複排除はデフォルトで有効になっており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window) および [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds) 設定によって制御されます。非レプリケートの `*MergeTree` エンジンでは、重複排除は [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window) 設定によって制御されます。

上記の設定は、テーブルの重複排除ログのパラメーターを決定します。重複排除ログは有限の数の `block_id` を保存し、これが重複排除の動作を決定します（下記参照）。

### クエリレベルでの挿入重複排除 {#query-level-insert-deduplication}

設定 `insert_deduplicate=1` を有効にすると、クエリレベルでの重複排除が有効になります。ただし、`insert_deduplicate=0` でデータを挿入すると、そのデータは `insert_deduplicate=1` で挿入を再試行しても重複排除できないことに注意してください。これは、`insert_deduplicate=0` での挿入時にブロックのための `block_id` が書き込まれないためです。

## 挿入重複排除の仕組み {#how-insert-deduplication-works}

データが ClickHouse に挿入されると、行数とバイト数に基づいてデータがブロックに分割されます。

`*MergeTree` エンジンを使用するテーブルでは、各ブロックにはそのブロック内のデータのハッシュである一意の `block_id` が割り当てられます。この `block_id` は挿入操作の一意のキーとして使用されます。重複排除ログ内に同じ `block_id` が見つかると、そのブロックは重複と見なされ、テーブルには挿入されません。

このアプローチは、挿入に異なるデータが含まれる場合にうまく機能します。ただし、同じデータが意図的に複数回挿入される場合は、重複排除プロセスを制御するために `insert_deduplication_token` 設定を使用する必要があります。この設定を使用すると、各挿入のために一意のトークンを指定でき、ClickHouse がデータが重複しているかどうかを判断するために使用します。

`INSERT ... VALUES` クエリの場合、挿入データのブロック分割は決定論的であり、設定によって決定されます。したがって、ユーザーは最初の操作と同じ設定値で挿入を再試行する必要があります。

`INSERT ... SELECT` クエリの場合、クエリの `SELECT` 部分が各操作に対して同じ順序で同じデータを返すことが重要です。実際の使用ではこれを達成することが難しいことに注意してください。再試行の際にデータ順序を安定させるために、クエリの `SELECT` 部分に正確な `ORDER BY` セクションを定義してください。再試行の間に選択されたテーブルが更新されている場合、選択されたデータが変更されている可能性があり、重複排除が発生しないことを考慮してください。さらに、大量のデータを挿入する場合、挿入後のブロック数が重複排除ログウィンドウをオーバーフローする可能性があり、ClickHouse がブロックを重複排除できない場合があります。

## マテリアライズドビューを使用した挿入重複排除 {#insert-deduplication-with-materialized-views}

テーブルに1つ以上のマテリアライズドビューがあると、挿入されたデータも定義された変換でそのビューの宛先に挿入されます。変換されたデータも再試行時に重複排除されます。ClickHouseは、対象テーブルに挿入されたデータを重複排除するのと同じ方法で、マテリアライズドビューに対して重複排除を実行します。

このプロセスは、ソーステーブルの次の設定を使用して制御できます：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window)

ユーザープロファイル設定 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views) を使用することもできます。

マテリアライズドビューの下にあるテーブルにブロックを挿入する際、ClickHouse はソーステーブルからの `block_id` と追加の識別子を組み合わせた文字列をハッシュすることにより `block_id` を計算します。これにより、マテリアライズドビュー内での正確な重複排除が保証され、元の挿入に基づいてデータを区別できるようになります。これは、マテリアライズドビューの宛先テーブルに到達する前に適用される変換があっても変わりません。

## 例 {#examples}

### マテリアライズドビューの変換後の同一ブロック {#identical-blocks-after-materialized-view-transformations}

マテリアライズドビュー内での変換中に生成された同一ブロックは、異なる挿入データに基づいているため、重複排除されません。

以下に例を示します：

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

上記の設定により、1行のみを含む一連のブロックを持つテーブルから選択することができます。これらの小さなブロックは圧縮されず、テーブルに挿入されるまで同じままです。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

マテリアライズドビューでの重複排除を有効にする必要があります：

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

ここで、2つのパーツが `dst` テーブルに挿入されたことがわかります。クエリから2つのブロック--挿入時の2つのパーツ。パーツには異なるデータが含まれています。

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

ここで、2つのパーツが `mv_dst` テーブルに挿入されたことがわかります。これらのパーツには同じデータが含まれていますが、重複排除されていません。

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

ここで、再試行時に挿入されたデータがすべて重複排除されたことがわかります。重複排除は `dst` と `mv_dst` の両方のテーブルで機能しています。

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

上記の設定により、選択から2つのブロックが生成され -- 結果として、テーブル `dst` への挿入に対しても2つのブロックが必要なはずです。しかし、テーブル `dst` には1つのブロックしか挿入されていないことがわかります。これは、2つ目のブロックが重複排除されたためです。同じデータを持っており、重複排除のためのキーである `block_id` が挿入データのハッシュから計算されます。この動作は予測されていたものではありません。このようなケースはまれですが、理論上は可能です。このようなケースを正しく処理するために、ユーザーは `insert_deduplication_token` を提供する必要があります。以下の例でこれを修正しましょう：

### `insert_deduplication_token` を用いた挿入時の同一ブロック {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

2つの同一ブロックが期待通りに挿入されました。

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

再試行挿入が期待通りに重複排除されています。

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

その挿入も、異なる挿入データを含んでいても重複排除されています。注意すべき点は、`insert_deduplication_token` が優先され、ClickHouse は `insert_deduplication_token` が提供された場合にデータのハッシュサムを使用しないことです。

### マテリアライズドビューの基になるテーブルで異なる挿入操作が同じデータを生成する {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

毎回異なるデータを挿入しています。しかし、同じデータが `mv_dst` テーブルに挿入されています。ソースデータが異なったためデータは重複排除されません。

### 同一の基になるテーブルに異なるマテリアライズドビューの挿入が同等のデータを挿入する {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

`mv_dst` テーブルに2つの同等なブロックが挿入されました（期待通り）。

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

その再試行操作は、両方のテーブル `dst` と `mv_dst` で重複排除されました。
