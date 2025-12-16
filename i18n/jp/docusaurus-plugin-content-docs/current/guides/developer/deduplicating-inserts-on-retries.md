---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 'リトライ時のインサートの重複排除'
description: 'インサート操作を再試行する際に重複データを防ぐ'
keywords: ['重複排除', '重複除去', 'インサートリトライ', 'インサート']
doc_type: 'guide'
---

インサート操作は、タイムアウトなどのエラーにより失敗することがあります。インサートが失敗した場合、データが正常に挿入されたかどうかは不明です。このガイドでは、同じデータが複数回挿入されないように、インサートリトライ時の重複排除を有効にする方法について説明します。

インサートが再試行されると、ClickHouseはデータがすでに正常に挿入されているかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouseはそれを宛先テーブルに挿入しません。ただし、ユーザーは、データが正常に挿入されたかのように、成功した操作ステータスを引き続き受け取ります。

## 制限事項 {#limitations}

### 不確実なインサートステータス {#uncertain-insert-status}

ユーザーは、成功するまでインサート操作を再試行する必要があります。すべてのリトライが失敗した場合、データが挿入されたかどうかを判断することは不可能です。マテリアライズドビューが関係している場合、どのテーブルにデータが表示されたかも不明です。マテリアライズドビューはソーステーブルと同期していない可能性があります。

### 重複排除ウィンドウの制限 {#deduplication-window-limit}

リトライシーケンス中に`*_deduplication_window`を超える他のインサート操作が発生した場合、重複排除は意図したとおりに機能しない可能性があります。この場合、同じデータが複数回挿入される可能性があります。

## リトライ時のインサート重複排除の有効化 {#enabling-insert-deduplication-on-retries}

### テーブルのインサート重複排除 {#insert-deduplication-for-tables}

**`*MergeTree`エンジンのみが挿入時の重複排除をサポートしています。**

`*ReplicatedMergeTree`エンジンの場合、インサート重複排除はデフォルトで有効になっており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)と[`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)設定によって制御されます。非レプリケート`*MergeTree`エンジンの場合、重複排除は[`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)設定によって制御されます。

上記の設定は、テーブルの重複排除ログのパラメータを決定します。重複排除ログには、重複排除の動作を決定する有限数の`block_id`が格納されます（以下を参照）。

### クエリレベルのインサート重複排除 {#query-level-insert-deduplication}

設定`insert_deduplicate=1`はクエリレベルで重複排除を有効にします。`insert_deduplicate=0`でデータを挿入した場合、`insert_deduplicate=1`でインサートを再試行してもそのデータは重複排除できないことに注意してください。これは、`insert_deduplicate=0`でのインサート中にブロックの`block_id`が書き込まれないためです。

## インサート重複排除の仕組み {#how-insert-deduplication-works}

データがClickHouseに挿入されると、行数とバイト数に基づいてデータがブロックに分割されます。

`*MergeTree`エンジンを使用するテーブルの場合、各ブロックには一意の`block_id`が割り当てられます。これは、そのブロック内のデータのハッシュです。この`block_id`は、インサート操作の一意のキーとして使用されます。重複排除ログに同じ`block_id`が見つかった場合、そのブロックは重複と見なされ、テーブルに挿入されません。

このアプローチは、インサートに異なるデータが含まれている場合にうまく機能します。ただし、同じデータを意図的に複数回挿入する場合は、`insert_deduplication_token`設定を使用して重複排除プロセスを制御する必要があります。この設定により、各インサートに一意のトークンを指定でき、ClickHouseはこれを使用してデータが重複であるかどうかを判断します。

`INSERT ... VALUES`クエリの場合、挿入されたデータをブロックに分割することは決定論的であり、設定によって決定されます。したがって、初期操作と同じ設定値でインサートを再試行する必要があります。

`INSERT ... SELECT`クエリの場合、クエリの`SELECT`部分が各操作で同じ順序で同じデータを返すことが重要です。実際の使用では、これを達成することは困難です。リトライ時の安定したデータ順序を確保するには、クエリの`SELECT`部分で正確な`ORDER BY`セクションを定義してください。選択したテーブルがリトライ間で更新される可能性があることに注意してください。結果データが変更され、重複排除が発生しない可能性があります。さらに、大量のデータを挿入している場合、インサート後のブロック数が重複排除ログウィンドウをオーバーフローする可能性があり、ClickHouseはブロックを重複排除することを認識しません。

## マテリアライズドビューでのインサート重複排除 {#insert-deduplication-with-materialized-views}

テーブルに1つ以上のマテリアライズドビューがある場合、挿入されたデータは、定義された変換とともにそれらのビューの宛先にも挿入されます。変換されたデータもリトライ時に重複排除されます。ClickHouseは、ターゲットテーブルに挿入されたデータを重複排除するのと同じ方法で、マテリアライズドビューの重複排除を実行します。

ソーステーブルの次の設定を使用して、このプロセスを制御できます：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

また、ユーザープロファイル設定[`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)も有効にする必要があります。
設定`insert_deduplicate=1`を有効にすると、挿入されたデータはソーステーブルで重複排除されます。設定`deduplicate_blocks_in_dependent_materialized_views=1`は、さらに依存テーブルでの重複排除を有効にします。完全な重複排除が必要な場合は、両方を有効にする必要があります。

マテリアライズドビュー下のテーブルにブロックを挿入する際、ClickHouseは、ソーステーブルの`block_id`と追加の識別子を組み合わせた文字列をハッシュ化することで`block_id`を計算します。これにより、マテリアライズドビュー内での正確な重複排除が保証され、マテリアライズドビュー下の宛先テーブルに到達する前に適用された変換に関係なく、元の挿入に基づいてデータを区別できます。

## 例 {#examples}

### マテリアライズドビュー変換後の同一ブロック {#identical-blocks-after-materialized-view-transformations}

マテリアライズドビュー内の変換中に生成された同一のブロックは、異なる挿入データに基づいているため、重複排除されません。

以下は例です：

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

上記の設定により、1行のみを含む一連のブロックを持つテーブルから選択できます。これらの小さなブロックは圧縮されず、テーブルに挿入されるまで同じままです。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

マテリアライズドビューで重複排除を有効にする必要があります：

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

ここで、2つのパートが`dst`テーブルに挿入されたことがわかります。selectからの2つのブロック -- インサート時の2つのパート。パートには異なるデータが含まれています。

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

ここで、2つのパートが`mv_dst`テーブルに挿入されたことがわかります。それらのパートには同じデータが含まれていますが、重複排除されていません。

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

ここで、インサートを再試行すると、すべてのデータが重複排除されることがわかります。重複排除は`dst`と`mv_dst`の両方のテーブルで機能します。

### インサート時の同一ブロック {#identical-blocks-on-insertion}

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

インサート：

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

上記の設定では、selectから2つのブロックが得られます。その結果、テーブル`dst`へのインサートには2つのブロックがあるはずです。ただし、1つのブロックのみがテーブル`dst`に挿入されたことがわかります。これは、2番目のブロックが重複排除されたために発生しました。挿入されたデータから計算されるハッシュである重複排除のキー`block_id`と同じデータを持っています。この動作は期待されたものではありません。このようなケースはまれですが、理論的には可能です。このようなケースを正しく処理するために、ユーザーは`insert_deduplication_token`を提供する必要があります。次の例でこれを修正しましょう：

### `insert_deduplication_token`を使用したインサートでの同一ブロック {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

インサート：

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

2つの同一ブロックが期待どおりに挿入されました。

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

再試行されたインサートは期待どおりに重複排除されます。

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

異なる挿入データが含まれているにもかかわらず、そのインサートも重複排除されます。`insert_deduplication_token`の優先度が高いことに注意してください。ClickHouseは、`insert_deduplication_token`が提供されている場合、データのハッシュ合計を使用しません。

### 異なるインサート操作がマテリアライズドビューの基礎テーブルで変換後に同じデータを生成 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

毎回異なるデータを挿入します。ただし、同じデータが`mv_dst`テーブルに挿入されます。ソースデータが異なっていたため、データは重複排除されません。

### 同等のデータを持つ1つの基礎テーブルへの異なるマテリアライズドビューインサート {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

2つの等しいブロックがテーブル`mv_dst`に挿入されました（期待どおり）。

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

その再試行操作は、テーブル`dst`と`mv_dst`の両方で重複排除されます。
