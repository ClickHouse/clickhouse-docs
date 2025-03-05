---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 再試行時の挿入の重複排除
description: 挿入操作を再試行する際に重複データを防ぐ
keywords: [重複排除, 重複, 挿入の再試行, 挿入]
---

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されたのかどうかは不明です。このガイドでは、同じデータが二重に挿入されないように、挿入の再試行時に重複排除を有効にする方法を説明します。

挿入が再試行されると、ClickHouseはデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複とマークされると、ClickHouseはそれを宛先テーブルに挿入しません。ただし、ユーザーにはデータが通常通り挿入されたかのように成功操作ステータスが返されます。

## 再試行時の挿入重複排除を有効にする {#enabling-insert-deduplication-on-retries}

### テーブルの挿入重複排除 {#insert-deduplication-for-tables}

**`*MergeTree`エンジンのみが挿入時に重複排除をサポートします。**

`*ReplicatedMergeTree`エンジンの場合、挿入重複排除はデフォルトで有効になっており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window)および[`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds)設定によって制御されます。非レプリケートの`*MergeTree`エンジンの場合、重複排除は[`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window)設定によって制御されます。

上記の設定は、テーブルの重複排除ログのパラメータを決定します。重複排除ログは、重複排除の影響を及ぼす有限の数の`block_id`を格納します（詳細は以下）。

### クエリレベルの挿入重複排除 {#query-level-insert-deduplication}

設定`insert_deduplicate=1`は、クエリレベルで重複排除を有効にします。注意してください：`insert_deduplicate=0`でデータを挿入した場合、再度`insert_deduplicate=1`で挿入を試みても、そのデータは重複排除されません。これは、`insert_deduplicate=0`の挿入中に`block_id`が書き込まれないためです。

## 挿入重複排除の仕組み {#how-insert-deduplication-works}

データがClickHouseに挿入されると、データは行数とバイト数に基づいてブロックに分割されます。

`*MergeTree`エンジンを使用しているテーブルでは、各ブロックにユニークな`block_id`が割り当てられます。これはそのブロック内のデータのハッシュです。この`block_id`は挿入操作のユニークキーとして使用されます。重複排除ログに同じ`block_id`が見つかると、そのブロックは重複と見なされ、テーブルには挿入されません。

このアプローチは、挿入が異なるデータを含む場合によく機能します。しかし、意図的に同じデータが複数回挿入される場合は、重複排除プロセスを制御するために`insert_deduplication_token`設定を使用する必要があります。この設定により、各挿入のためにユニークなトークンを指定でき、ClickHouseはそれを使用してデータが重複であるかどうかを判断します。

`INSERT ... VALUES`クエリに対して、挿入されたデータをブロックに分割することは決定論的であり、設定によって決定されます。したがって、ユーザーは最初の操作と同じ設定値で挿入を再試行する必要があります。

`INSERT ... SELECT`クエリの場合、クエリの`SELECT`部分が各操作で同じデータを同じ順序で返すことが重要です。実際の使用では、これは達成が困難です。再試行時に安定したデータ順序を確保するために、クエリの`SELECT`部分で正確な`ORDER BY`セクションを定義してください。再試行の間に選択されたテーブルが更新される可能性があるため、結果データが変わり、重複排除が行われない可能性があります。さらに、大量のデータを挿入している場合、挿入後のブロック数が重複排除ログウィンドウをオーバーフローする可能性があり、ClickHouseはブロックを重複排除することができません。

## 物化ビューを用いた挿入重複排除 {#insert-deduplication-with-materialized-views}

テーブルに1つ以上の物化ビューがある場合、挿入されたデータは、定義された変換に従ってそれらのビューの宛先にも挿入されます。変換されたデータも再試行時に重複排除されます。ClickHouseは、物化ビューに挿入されたデータを重複排除するのと同じ方法で、ターゲットテーブルに挿入されたデータの重複排除を行います。

このプロセスは次の設定を使用して、ソーステーブルで制御できます：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window)

ユーザープロファイル設定[`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)を使用することもできます。

物化ビューの下にあるテーブルにブロックを挿入する際、ClickHouseは`block_id`を計算するために、ソーステーブルの`block_id`と追加の識別子を組み合わせた文字列をハッシュ化します。これにより、物化ビュー内での正確な重複排除が保証され、元の挿入に基づいてデータを区別できるようになります。変換が宛先テーブルに到達する前に適用された場合でも同様です。

## 例 {#examples}

### 物化ビュー変換後の同一ブロック {#identical-blocks-after-materialized-view-transformations}

物化ビュー内での変換中に生成された同一ブロックは、異なる挿入データに基づいているため、重複排除されません。

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

上記の設定により、行を1つだけ含む一連のブロックを持つテーブルから選択できるようになります。これらの小さなブロックは圧縮されず、テーブルに挿入されるまで同じままです。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

物化ビューでの重複排除を有効にする必要があります：

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

ここでは、`dst`テーブルに2つのパーツが挿入されたことがわかります。選択からの2ブロック -- 挿入の2パーツ。パーツには異なるデータが含まれています。

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

ここでは、`mv_dst`テーブルに2つのパーツが挿入されたことがわかります。それらのパーツには同じデータが含まれていますが、重複排除は行われません。

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

ここでは、挿入を再試行すると、すべてのデータが重複排除されることがわかります。重複排除は`dst`および`mv_dst`テーブルの両方で機能します。

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

上記の設定により、選択から2つのブロックが得られます。その結果、`dst`テーブルに挿入されるべき2つのブロックがあるはずですが、実際には1つのブロックだけが挿入されていることがわかります。これは、2つ目のブロックが重複排除されたためです。データが同じであり、重複排除のためのキー`block_id`が挿入データから計算されたハッシュであるためです。この動作は想定外のものであり、稀に発生することですが理論上可能です。このようなケースを適切に処理するために、ユーザーは`insert_deduplication_token`を提供する必要があります。次の例でそれを修正しましょう。

### `insert_deduplication_token`を用いた挿入時の同一ブロック {#identical-blocks-in-insertion-with-insert-deduplication_token}

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

期待通りに2つの同一ブロックが挿入されました。

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

再試行された挿入は期待通りに重複排除されています。

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

この挿入も、異なる挿入データを含んでいても重複排除されています。`insert_deduplication_token`は優先度が高いことに注意してください：ClickHouseは`insert_deduplication_token`が提供されているとき、データのハッシュ合計を使用しません。

### 物化ビューの基となるテーブルでの変換後に異なる挿入操作が同一データを生成する {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

毎回異なるデータを挿入しています。しかし、同じデータが`mv_dst`テーブルに挿入されています。ソースデータが異なっていたため、データは重複排除されません。

### 同一の基底テーブルに異なる物化ビューが同じデータを挿入する {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

`mv_dst`テーブルに2つの等しいブロックが挿入されました（期待通り）。

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

その再試行操作は、`dst`および`mv_dst`の両方のテーブルで重複排除されます。

