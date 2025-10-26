---
'slug': '/guides/developer/deduplicating-inserts-on-retries'
'title': '挿入の再試行における重複排除'
'description': '挿入操作を再試行する際の重複データを防ぐ'
'keywords':
- 'deduplication'
- 'deduplicate'
- 'insert retries'
- 'inserts'
'doc_type': 'guide'
---

Insert operations can sometimes fail due to errors such as timeouts. When inserts fail, data may or may not have been successfully inserted. This guide covers how to enable deduplication on insert retries such that the same data does not get inserted more than once.

When an insert is retried, ClickHouse tries to determine whether the data has already been successfully inserted. If the inserted data is marked as a duplicate, ClickHouse does not insert it into the destination table. However, the user will still receive a successful operation status as if the data had been inserted normally.

## 制限事項 {#limitations}

### 不確実な挿入ステータス {#uncertain-insert-status}

ユーザーは、挿入操作が成功するまで再試行する必要があります。すべての再試行が失敗した場合、データが挿入されたかどうかを判定することは不可能です。マテリアライズドビューが関与している場合、データがどのテーブルに現れたのかも不明です。マテリアライズドビューは、ソーステーブルと同期が取れていない可能性があります。

### デデュプリケーションウィンドウの制限 {#deduplication-window-limit}

再試行シーケンス中に `*_deduplication_window` を超える数の他の挿入操作が発生する場合、デデュプリケーションが意図した通りに機能しない可能性があります。この場合、同じデータが複数回挿入されることがあります。

## 再試行時の挿入デデュプリケーションを有効にする {#enabling-insert-deduplication-on-retries}

### テーブル用の挿入デデュプリケーション {#insert-deduplication-for-tables}

**デデュプリケーションは、`*MergeTree` エンジンでのみサポートされています。**

`*ReplicatedMergeTree` エンジンの場合、挿入デデュプリケーションはデフォルトで有効であり、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) および [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 設定によって制御されます。非レプリケートの `*MergeTree` エンジンの場合、デデュプリケーションは [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 設定によって制御されます。

上記の設定は、テーブルのデデュプリケーションログのパラメータを決定します。デデュプリケーションログは、有限数の `block_id` を保存し、デデュプリケーションがどのように機能するかを決定します（詳細は以下を参照）。

### クエリレベルの挿入デデュプリケーション {#query-level-insert-deduplication}

設定 `insert_deduplicate=1` によってクエリレベルでのデデュプリケーションが有効になります。`insert_deduplicate=0` でデータを挿入した場合、そのデータは `insert_deduplicate=1` で挿入を再試行してもデデュプリケーションされません。これは、`insert_deduplicate=0` の挿入時にブロックのために `block_id` が書き込まれないためです。

## 挿入デデュプリケーションの動作 {#how-insert-deduplication-works}

データが ClickHouse に挿入されると、データは行数およびバイト数に基づいてブロックに分割されます。

`*MergeTree` エンジンを使用するテーブルの場合、各ブロックにはデータのハッシュである一意の `block_id` が割り当てられます。この `block_id` は挿入操作の一意のキーとして使用されます。デデュプリケーションログで同じ `block_id` が見つかった場合、そのブロックは重複と見なされ、テーブルに挿入されません。

このアプローチは、挿入が異なるデータを含む場合にはうまく機能します。ただし、同じデータを意図的に複数回挿入したい場合は、`insert_deduplication_token` 設定を使用してデデュプリケーションプロセスを制御する必要があります。この設定により、各挿入に対して一意のトークンを指定でき、ClickHouse はデータが重複しているかどうかを判断します。

`INSERT ... VALUES` クエリでは、挿入されたデータをブロックに分割することは決定論的であり、設定によって決まります。したがって、ユーザーは最初の操作と同じ設定値で挿入を再試行する必要があります。

`INSERT ... SELECT` クエリの場合、クエリの `SELECT` 部分が各操作に対して同じデータを同じ順序で返すことが重要です。これを実現するのは実際には難しいことに注意してください。再試行時にデータの順序を安定させるためには、クエリの `SELECT` 部分に正確な `ORDER BY` セクションを定義してください。再試行の間に選択されたテーブルが更新される可能性があることに留意してください：結果データが変わっている可能性があり、デデュプリケーションは発生しません。さらに、大量のデータを挿入する場合、挿入後のブロック数がデデュプリケーションログウィンドウをオーバーフローし、ClickHouse がブロックをデデュプリケートする方法を知らない可能性があります。

## マテリアライズドビューとの挿入デデュプリケーション {#insert-deduplication-with-materialized-views}

テーブルに1つ以上のマテリアライズドビューがある場合、挿入されたデータは、定義された変換を伴い、これらのビューの宛先にも挿入されます。変換されたデータも再試行時にデデュプリケートされます。ClickHouse は、マテリアライズドビュー用のデータを挿入する場合と同じ方法でデデュプリケーションを実行します。

このプロセスは、ソーステーブルに対して次の設定を使用して制御できます：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

ユーザープロファイル設定 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views) も有効にする必要があります。
設定 `insert_deduplicate=1` を有効にすると、挿入されたデータはソーステーブルでデデュプリケートされます。設定 `deduplicate_blocks_in_dependent_materialized_views=1` を有効にすると、依存するテーブルでもデデュプリケーションが追加的に有効になります。完全なデデュプリケーションを望む場合は、両方を有効にする必要があります。

マテリアライズドビュー下のテーブルにブロックを挿入する際、ClickHouse はソーステーブルの `block_id` と追加の識別子を組み合わせた文字列をハッシュすることによって `block_id` を計算します。これにより、変換が適用される前に、データが送信先テーブルに到達する際に、元の挿入に基づいて正確にデデュプリケーションが行われます。

## 例 {#examples}

### マテリアライズドビュー変換後の同一ブロック {#identical-blocks-after-materialized-view-transformations}

マテリアライズドビュー内で変換中に生成された同一のブロックは、異なる挿入データに基づいているためデデュプリケートされません。

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

上記の設定により、1行のみを含むブロックのシリーズを持つテーブルから選択できます。これらの小さなブロックは、テーブルに挿入されるまで圧縮されず、そのままとなります。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

マテリアライズドビュー内でデデュプリケーションを有効にする必要があります：

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

ここでは、2つのパーツが `dst` テーブルに挿入されたことがわかります。セレクトから2ブロック -- 挿入で2パーツ。パーツには異なるデータが含まれています。

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

ここでは、2つのパーツが `mv_dst` テーブルに挿入されたことがわかります。パーツは同じデータを含んでいますが、デデュプリケートされていません。

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

ここで再試行を行った際に、すべてのデータがデデュプリケートされていることがわかります。デデュプリケーションは `dst` テーブルと `mv_dst` テーブルの両方で機能します。

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

上記の設定により、セレクトから2つのブロックが生成されるため、`dst` テーブルへの挿入用に2つのブロックが必要です。しかし、実際には `dst` テーブルに挿入されたのは1つのブロックだけです。これは、2つ目のブロックがデデュプリケートされたためです。データが同じで、デデュプリケーションのためのキーである `block_id` が挿入データから計算されたハッシュと同じであるためです。この動作は期待されるものではありません。このようなケースは稀に発生しますが、理論的には可能です。このようなケースを正しく処理するには、ユーザーは `insert_deduplication_token` を提供する必要があります。次の例で修正しましょう：

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

期待通りに2つの同一のブロックが挿入されました。

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

再試行された挿入も期待通りにデデュプリケートされました。

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

この挿入も異なる挿入データを含んでいてもデデュプリケーテッドされています。`insert_deduplication_token` が優先されることに注意してください：`insert_deduplication_token` が提供されると、ClickHouse はデータのハッシュ値を使用しません。

### マテリアライズドビューの基底テーブル内での変換後に異なる挿入操作が同じデータを生成する {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

毎回異なるデータを挿入します。ただし、同じデータが `mv_dst` テーブルに挿入されます。ソースデータが異なるため、デデュプリケートされません。

### 同等のデータで一つの基底テーブルに対しての異なるマテリアライズドビューの挿入 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

テーブル `mv_dst` に2つの同等のブロックが挿入されました（予想通り）。

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

その再試行操作は、テーブル `dst` と `mv_dst` の両方でデデュプリケートされます。
