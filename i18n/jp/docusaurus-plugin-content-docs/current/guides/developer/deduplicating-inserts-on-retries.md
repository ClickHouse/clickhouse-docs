---
slug: /guides/developer/deduplicating-inserts-on-retries
title: '再試行時の挿入の重複排除'
description: '挿入操作を再試行する際に重複データが発生しないようにする'
keywords: ['deduplication', 'deduplicate', 'insert retries', 'inserts']
doc_type: 'guide'
---

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、そのデータが実際に挿入されたかどうかは保証されません。このガイドでは、同じデータが複数回挿入されないように、挿入の再試行時に重複排除を有効にする方法について説明します。

挿入が再試行されると、ClickHouse はそのデータがすでに正常に挿入されているかどうかを判定しようとします。挿入されたデータが重複であるとマークされた場合、ClickHouse はそのデータを宛先テーブルに挿入しません。ただし、ユーザーはデータが通常どおり挿入された場合と同様に、操作が成功したステータスを受け取ります。

## 制限事項 \{#limitations\}

### 挿入結果の不確実性 \{#uncertain-insert-status\}

ユーザーは、挿入処理が成功するまでリトライを行う必要があります。すべてのリトライが失敗した場合、データが挿入されたかどうかを判別することはできません。マテリアライズドビューが関係している場合、どのテーブルにデータが現れている可能性があるのかも不明です。マテリアライズドビューとソーステーブルの同期が取れていない状態になっている可能性があります。

### 重複排除ウィンドウの制限 \{#deduplication-window-limit\}

リトライシーケンスの間に、他の挿入操作が `*_deduplication_window` を超えて発生した場合、重複排除が意図したとおりに機能しない可能性があります。この場合、同じデータが複数回挿入されることがあります。

## 再試行時の挿入重複排除を有効化する \{#enabling-insert-deduplication-on-retries\}

### テーブルに対する挿入重複排除 \{#insert-deduplication-for-tables\}

**挿入時の重複排除をサポートするのは `*MergeTree` エンジンのみです。**

`*ReplicatedMergeTree` エンジンでは、挿入重複排除はデフォルトで有効化されており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) および [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) の各設定で制御されます。レプリケートされていない `*MergeTree` エンジンでは、重複排除は [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 設定で制御されます。

上記の設定は、テーブルに対する重複排除ログのパラメータを決定します。重複排除ログには有限個の `block_id` が保存されており、これによって重複排除の動作が決まります（詳細は後述）。

### クエリレベルでの挿入重複排除 \{#query-level-insert-deduplication\}

`insert_deduplicate=1` 設定により、クエリレベルでの重複排除が有効になります。`insert_deduplicate=0` でデータを挿入した場合、そのデータは、たとえ `insert_deduplicate=1` を指定して挿入を再試行しても重複排除されません。これは、`insert_deduplicate=0` での挿入時にはブロックに対して `block_id` が書き込まれないためです。

## 挿入時の重複排除の仕組み \{#how-insert-deduplication-works\}

データが ClickHouse に挿入されると、行数およびバイト数に基づいてデータはブロックに分割されます。

`*MergeTree` エンジンを使用するテーブルでは、各ブロックに一意の `block_id` が割り当てられます。これは、そのブロック内のデータに対するハッシュです。この `block_id` は挿入操作の一意キーとして使用されます。同じ `block_id` が重複排除ログ内に存在する場合、そのブロックは重複と見なされ、テーブルには挿入されません。

このアプローチは、挿入ごとに異なるデータが含まれているケースでは有効です。しかし、同じデータを意図的に複数回挿入する必要がある場合、`insert_deduplication_token` 設定を使用して重複排除プロセスを制御する必要があります。この設定により、挿入ごとに一意のトークンを指定でき、ClickHouse はこれを使用してデータが重複かどうかを判断します。

`INSERT ... VALUES` クエリでは、挿入されたデータをブロックに分割する処理は決定論的であり、設定によって決まります。そのため、最初の操作と同じ設定値を使用して挿入を再試行する必要があります。

`INSERT ... SELECT` クエリでは、クエリの `SELECT` 部分が各操作で同じ順序の同じデータを返すことが重要です。これは実運用では達成が難しい点に留意してください。再試行時のデータ順序を安定させるために、クエリの `SELECT` 部分で `ORDER BY ALL` 句を定義してください。現時点では、クエリ内で厳密に `ORDER BY ALL` を使用する必要があります。`ORDER BY` のサポートはまだ実装されておらず、その場合クエリの `SELECT` 部分は安定したものとは見なされません。再試行の間に、参照しているテーブルが更新される可能性があることも考慮する必要があります。この場合、結果データが変化し、重複排除は行われません。さらに、大量のデータを挿入する状況では、挿入後のブロック数が重複排除ログのウィンドウを超えてしまい、ClickHouse がブロックを重複排除すべきかどうか判断できなくなる可能性があります。
現時点では、`INSERT ... SELECT` の動作は [`insert_select_deduplicate`](/operations/settings/settings/#insert_select_deduplicate) 設定で制御されます。この設定は、`INSERT ... SELECT` クエリを使用して挿入されたデータに重複排除を適用するかどうかを決定します。詳細および使用例については、リンク先のドキュメントを参照してください。

## マテリアライズドビューによる挿入の重複排除 \{#insert-deduplication-with-materialized-views\}

テーブルに 1 つ以上のマテリアライズドビューがある場合、挿入されたデータには定義された変換が適用され、その結果がこれらのビューの出力先にも挿入されます。変換後のデータも、リトライ時に重複排除されます。ClickHouse は、ターゲットテーブルに挿入されたデータを重複排除する場合と同様の方法で、マテリアライズドビューに対しても重複排除を行います。

この処理は、ソーステーブルに対して次の設定を使用することで制御できます:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

あわせて、ユーザープロファイルの設定項目 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views) を有効にする必要があります。
`insert_deduplicate=1` を有効にすると、ソーステーブル内で挿入データの重複排除が行われます。`deduplicate_blocks_in_dependent_materialized_views=1` を設定すると、従属テーブル内での重複排除も追加で有効になります。完全な重複排除を行うには、両方の設定を有効にする必要があります。

マテリアライズドビュー配下のテーブルにブロックを挿入する際、ClickHouse はソーステーブルの `block_id` と追加の識別子を結合した文字列をハッシュすることで `block_id` を計算します。これにより、マテリアライズドビュー内で正確な重複排除が保証され、マテリアライズドビュー配下の宛先テーブルに到達する前にどのような変換が適用されていても、元の挿入に基づいてデータを区別できるようになります。

## 例 \{#examples\}

### マテリアライズドビューでの変換により同一になったブロック \{#identical-blocks-after-materialized-view-transformations\}

マテリアライズドビュー内部での変換中に生成された同一のブロックは、異なる挿入データに基づいているため、重複排除されません。

次に例を示します。

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

上記の設定により、各ブロックが 1 行だけを含む一連のブロックから成るテーブルを SELECT できるようになります。これらの小さなブロックはマージされず、テーブルに挿入されるまで同じ状態のまま保持されます。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

materialized view における重複排除機能を有効化する必要があります。

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

ここでは、`dst` テーブルに 2 つのパーツが挿入されたことが分かります。SELECT からは 2 ブロック、INSERT では 2 つのパーツになります。これらのパーツにはそれぞれ異なるデータが含まれています。

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

ここでは、`mv_dst` テーブルに 2 つのパーツが挿入されていることが分かります。これらのパーツには同じデータが含まれていますが、重複排除は行われていません。

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER BY all;

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

ここでは、挿入を再試行すると、すべてのデータが重複排除されていることが分かります。重複排除は `dst` および `mv_dst` テーブルの両方で行われます。


### 挿入における同一ブロック \{#identical-blocks-on-insertion\}

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

挿入操作:

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

上記の設定では、selectから2つのブロックが生成されます。その結果、テーブル`dst`への挿入には2つのブロックが存在するはずです。しかし、実際にはテーブル`dst`には1つのブロックのみが挿入されています。これは、2番目のブロックが重複排除されたために発生しました。このブロックは同じデータを持ち、挿入データのハッシュとして計算される重複排除キー`block_id`も同一です。この動作は想定されたものではありません。このようなケースは稀ですが、理論上は発生する可能性があります。このようなケースを正しく処理するには、`insert_deduplication_token`を指定する必要があります。以下の例でこの問題を修正します:


### `insert_deduplication_token`を使用した同一ブロックの挿入 \{#identical-blocks-in-insertion-with-insert_deduplication_token\}

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

挿入:

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

同一のブロックが2つ、期待どおりに挿入されました。

```sql
SELECT 'second attempt';

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

再試行による挿入も、期待どおり重複排除されました。

```sql
SELECT 'third attempt';

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

その挿入も、挿入されたデータが異なっていても重複排除されます。`insert_deduplication_token` の方が優先される点に注意してください。`insert_deduplication_token` が指定されている場合、ClickHouse はデータのハッシュ値を使用しません。


### 異なる挿入操作が、materialized view の基盤テーブルでの変換を経て同一のデータを生成する場合 \{#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view\}

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

毎回異なるデータを挿入していますが、`mv_dst`テーブルには同一のデータが挿入されます。ソースデータが異なるため、データの重複排除は行われません。


### 異なる materialized view が同一データを1つの基盤テーブルに挿入する場合 \{#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data\}

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

テーブル `mv_dst` に同一のブロックが 2 つ挿入されました（期待どおりです）。

```sql
SELECT 'second attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

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

その再試行による挿入は、`dst` テーブルと `mv_dst` テーブルの両方で重複排除されます。
