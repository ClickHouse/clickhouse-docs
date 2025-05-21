---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 'リトライ時の挿入データの重複排除'
description: '挿入操作をリトライする際の重複データを防ぐ'
keywords: ['重複排除', '重複除去', '挿入リトライ', '挿入']
---

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されたかどうかわからないことがあります。このガイドでは、同じデータが一度以上挿入されることがないように、挿入リトライ時に重複排除を有効にする方法を説明します。

挿入がリトライされると、ClickHouse はデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされた場合、ClickHouse はそれを宛先テーブルに挿入しません。ただし、ユーザーにはデータが通常通り挿入されたかのように正常な操作ステータスが表示されます。

## リトライ時の挿入重複排除の有効化 {#enabling-insert-deduplication-on-retries}

### テーブルのための挿入重複排除 {#insert-deduplication-for-tables}

**`*MergeTree` エンジンのみが挿入時の重複排除をサポートしています。**

`*ReplicatedMergeTree` エンジンの場合、挿入重複排除はデフォルトで有効になっており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) と [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 設定によって制御されます。非レプリケートの `*MergeTree` エンジンでは、重複排除は [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 設定によって制御されます。

上記の設定は、テーブルの重複排除ログのパラメータを決定します。重複排除ログは、重複排除がどのように機能するかを決定する有限数の `block_id` を保存します（以下参照）。

### クエリレベルの挿入重複排除 {#query-level-insert-deduplication}

設定 `insert_deduplicate=1` は、クエリレベルでの重複排除を有効にします。`insert_deduplicate=0` でデータを挿入すると、そのデータはリトライしても `insert_deduplicate=1` で重複排除されません。これは、`insert_deduplicate=0` で挿入されたブロックに対して `block_id` が記録されないためです。

## 挿入重複排除の仕組み {#how-insert-deduplication-works}

データが ClickHouse に挿入されると、行とバイト数に基づいてデータをブロックに分割します。

`*MergeTree` エンジンを使用するテーブルでは、各ブロックにユニークな `block_id` が付与され、これはそのブロック内のデータのハッシュです。この `block_id` は挿入操作のユニークキーとして使用されます。同じ `block_id` が重複排除ログに見つかると、そのブロックは重複と見なされ、テーブルに挿入されません。

このアプローチは、挿入が異なるデータを含む場合にはうまく機能します。しかし、同じデータを意図的に複数回挿入する場合、重複排除プロセスを制御するために `insert_deduplication_token` 設定を使用する必要があります。この設定により、各挿入に対してユニークなトークンを指定でき、ClickHouse はそれを用いてデータが重複しているかどうかを判断します。

`INSERT ... VALUES` クエリの場合、挿入されたデータをブロックに分割することは決定論的であり、設定によって決まります。したがって、ユーザーは初期操作と同じ設定値で挿入をリトライすべきです。

`INSERT ... SELECT` クエリの場合、クエリの `SELECT` 部分が各操作のために同じデータを同じ順序で返すことが重要です。これは実際の使用では達成が難しいことに注意してください。リトライ時にデータ順序を安定させるために、クエリの `SELECT` 部分に正確な `ORDER BY` セクションを定義してください。リトライの間に選択したテーブルが更新される可能性があることにも留意してください：結果データが変更され、重複排除が発生しない可能性があります。さらに、大量のデータを挿入する場合、挿入後のブロック数が重複排除ログウィンドウをオーバーフローする可能性があり、ClickHouse がブロックを重複排除できないことがあります。

## マテリアライズドビューによる挿入重複排除 {#insert-deduplication-with-materialized-views}

テーブルに1つ以上のマテリアライズドビューがある場合、挿入されたデータは、定義された変換を使用して、そのビューの宛先にも挿入されます。変換されたデータもリトライ時に重複排除されます。ClickHouse は、マテリアライズドビューにデータが挿入される際の重複排除と同様に、マテリアライズドビューの重複排除を行います。

このプロセスは、ソーステーブルに対して次の設定を使用することで制御できます。

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

ユーザープロファイル設定 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views) を使用することもできます。

マテリアライズドビューの下のテーブルにブロックを挿入する際、ClickHouse はソーステーブルの `block_id` と追加の識別子を組み合わせた文字列をハッシュして `block_id` を計算します。これにより、マテリアライズドビュー内での正確な重複排除が保証され、データが、マテリアライズドビューの宛先テーブルに達する前に適用された変換にかかわらず、元の挿入に基づいて区別されます。

## 例 {#examples}

### マテリアライズドビュー変換後の同一のブロック {#identical-blocks-after-materialized-view-transformations}

マテリアライズドビュー内で変換中に生成された同一のブロックは、異なる挿入データに基づいているため、重複排除されません。

例を示します：

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

上記の設定により、1行のみを含むブロックの系列を持つテーブルから選択できます。これらの小さなブロックは、テーブルに挿入されるまで圧縮されず、同じまま保持されます。

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

ここでは、2つのパーツが `dst` テーブルに挿入されたことがわかります。選択から2つのブロック -- 挿入時も2つのパーツ。パーツは異なるデータを含んでいます。

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

ここでは、`mv_dst` テーブルに2つのパーツが挿入されたことがわかります。そのパーツは同じデータを含んでいますが、重複排除されていません。

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

ここでは、挿入をリトライすると、すべてのデータが重複排除されていることがわかります。重複排除は `dst` と `mv_dst` テーブルの両方で機能しています。

### 同一のブロックの挿入時 {#identical-blocks-on-insertion}

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

上記の設定では、選択から2つのブロックが結果として得られ、`dst` テーブルへの挿入で2つのブロックが必要になるはずです。しかし、`dst` テーブルには1つのブロックのみが挿入されたことがわかります。これは、2番目のブロックが重複排除されたためです。同じデータと重複排除のための `block_id` が一致したためです。この動作は予想外でした。このようなケースは稀ですが、理論的には可能です。このような場合に正しく対処するために、ユーザーは `insert_deduplication_token` を提供する必要があります。次の例で修正してみましょう：

### `insert_deduplication_token` を使用した同一のブロックの挿入 {#identical-blocks-in-insertion-with-insert-deduplication_token}

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

予想通り、2つの同一のブロックが挿入されました。

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

再試行された挿入は予想通り重複排除されます。

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

異なる挿入データを含んでいるにもかかわらず、その挿入も重複排除されます。`insert_deduplication_token` がより高い優先度を持つことに留意してください：`insert_deduplication_token` が提供されると、ClickHouse はデータのハッシュを使用しません。

### マテリアライズドビューの下の基になるテーブルでの変換によって同じデータを生成する異なる挿入操作 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

毎回異なるデータを挿入しています。しかし、`mv_dst` テーブルには同じデータが挿入されています。ソースデータが異なるため、データは重複排除されません。

### 同じデータを含む異なるマテリアライズドビューの挿入が一つの基になるテーブルに行われる {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

`mv_dst` テーブルには期待通り2つの同じブロックが挿入されます。

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

そのリトライ操作は、`dst` と `mv_dst` の両方のテーブルで重複排除されます。
