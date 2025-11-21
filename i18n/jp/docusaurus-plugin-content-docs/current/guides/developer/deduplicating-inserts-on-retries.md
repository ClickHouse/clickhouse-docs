---
slug: /guides/developer/deduplicating-inserts-on-retries
title: '再試行時の INSERT の重複排除'
description: '挿入操作の再試行時における重複データの防止'
keywords: ['重複排除', '重複を排除', '挿入の再試行', '挿入']
doc_type: 'guide'
---

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されている場合もあれば、されていない場合もあります。このガイドでは、同じデータが 2 回以上挿入されないように、再試行時の挿入に対して重複排除を有効にする方法を説明します。

挿入が再試行されると、ClickHouse はそのデータがすでに正常に挿入されているかどうかを判定しようとします。挿入対象のデータが重複として識別された場合、ClickHouse はそのデータを宛先テーブルに挿入しません。ただし、ユーザーはあたかもデータが通常どおり挿入されたかのように、操作成功のステータスを受け取ります。



## 制限事項 {#limitations}

### 挿入ステータスの不確実性 {#uncertain-insert-status}

ユーザーは挿入操作が成功するまで再試行する必要があります。すべての再試行が失敗した場合、データが挿入されたかどうかを判断することはできません。マテリアライズドビューが関与している場合、どのテーブルにデータが出現したかも不明です。マテリアライズドビューがソーステーブルと同期していない可能性があります。

### 重複排除ウィンドウの制限 {#deduplication-window-limit}

再試行シーケンス中に`*_deduplication_window`を超える他の挿入操作が発生した場合、重複排除が意図したとおりに機能しない可能性があります。この場合、同じデータが複数回挿入される可能性があります。


## リトライ時の挿入重複排除の有効化 {#enabling-insert-deduplication-on-retries}

### テーブルの挿入重複排除 {#insert-deduplication-for-tables}

**挿入時の重複排除をサポートしているのは`*MergeTree`エンジンのみです。**

`*ReplicatedMergeTree`エンジンでは、挿入重複排除はデフォルトで有効になっており、[`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)および[`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)設定によって制御されます。非レプリケート型の`*MergeTree`エンジンでは、重複排除は[`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)設定によって制御されます。

上記の設定は、テーブルの重複排除ログのパラメータを決定します。重複排除ログには有限個の`block_id`が保存され、これによって重複排除の動作が決定されます(以下を参照)。

### クエリレベルの挿入重複排除 {#query-level-insert-deduplication}

`insert_deduplicate=1`設定により、クエリレベルで重複排除が有効になります。`insert_deduplicate=0`でデータを挿入した場合、`insert_deduplicate=1`で挿入を再試行しても、そのデータは重複排除できないことに注意してください。これは、`insert_deduplicate=0`での挿入時にブロックの`block_id`が書き込まれないためです。


## インサート重複排除の仕組み {#how-insert-deduplication-works}

ClickHouseにデータが挿入されると、行数とバイト数に基づいてデータがブロックに分割されます。

`*MergeTree`エンジンを使用するテーブルでは、各ブロックに一意の`block_id`が割り当てられます。これはそのブロック内のデータのハッシュ値です。この`block_id`はインサート操作の一意キーとして使用されます。重複排除ログに同じ`block_id`が見つかった場合、そのブロックは重複とみなされ、テーブルに挿入されません。

このアプローチは、インサートに異なるデータが含まれる場合に有効です。ただし、意図的に同じデータを複数回挿入する場合は、`insert_deduplication_token`設定を使用して重複排除プロセスを制御する必要があります。この設定により、各インサートに一意のトークンを指定でき、ClickHouseはこれを使用してデータが重複しているかどうかを判断します。

`INSERT ... VALUES`クエリの場合、挿入されるデータのブロックへの分割は決定論的であり、設定によって決まります。そのため、ユーザーは初回操作と同じ設定値でインサートを再試行する必要があります。

`INSERT ... SELECT`クエリの場合、クエリの`SELECT`部分が各操作で同じデータを同じ順序で返すことが重要です。これは実際の使用では達成が困難であることに注意してください。再試行時にデータの順序を安定させるには、クエリの`SELECT`部分に正確な`ORDER BY`句を定義してください。再試行の間に選択されたテーブルが更新される可能性があることに留意してください。結果データが変更され、重複排除が行われない可能性があります。さらに、大量のデータを挿入する状況では、インサート後のブロック数が重複排除ログウィンドウの上限を超える可能性があり、その場合ClickHouseはブロックを重複排除できなくなります。


## マテリアライズドビューを使用した挿入の重複排除 {#insert-deduplication-with-materialized-views}

テーブルに1つ以上のマテリアライズドビューがある場合、挿入されたデータは定義された変換を適用した上で、それらのビューの宛先テーブルにも挿入されます。変換されたデータもリトライ時に重複排除されます。ClickHouseは、ターゲットテーブルに挿入されたデータを重複排除するのと同じ方法で、マテリアライズドビューの重複排除を実行します。

ソーステーブルに対して以下の設定を使用することで、このプロセスを制御できます:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

また、ユーザープロファイル設定[`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)も有効にする必要があります。
`insert_deduplicate=1`を有効にすると、挿入されたデータはソーステーブルで重複排除されます。`deduplicate_blocks_in_dependent_materialized_views=1`を設定すると、依存テーブルでの重複排除が追加で有効になります。完全な重複排除を行う場合は、両方の設定を有効にする必要があります。

マテリアライズドビュー配下のテーブルにブロックを挿入する際、ClickHouseはソーステーブルの`block_id`と追加の識別子を組み合わせた文字列をハッシュ化することで`block_id`を計算します。これにより、マテリアライズドビュー内での正確な重複排除が保証され、マテリアライズドビュー配下の宛先テーブルに到達する前に適用された変換に関係なく、元の挿入に基づいてデータを区別できます。


## 例 {#examples}

### マテリアライズドビュー変換後の同一ブロック {#identical-blocks-after-materialized-view-transformations}

マテリアライズドビュー内の変換中に生成された同一ブロックは、異なる挿入データに基づいているため重複排除されません。

以下に例を示します:

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

上記の設定により、1行のみを含む一連のブロックを持つテーブルから選択できます。これらの小さなブロックは圧縮されず、テーブルに挿入されるまで同じ状態を保ちます。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

マテリアライズドビューで重複排除を有効にする必要があります:

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

ここでは、2つのパートが`dst`テーブルに挿入されていることがわかります。selectからの2ブロックが挿入時に2パートになります。各パートには異なるデータが含まれています。

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

ここでは、2つのパートが`mv_dst`テーブルに挿入されていることがわかります。これらのパートには同じデータが含まれていますが、重複排除されていません。

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

ここでは、挿入を再実行すると、すべてのデータが重複排除されることがわかります。重複排除は`dst`テーブルと`mv_dst`テーブルの両方で機能します。

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

挿入:

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

```


┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst │ 0 │ A │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

````

上記の設定では、selectから2つのブロックが生成されるため、テーブル`dst`への挿入には2つのブロックが存在するはずです。しかし、実際にはテーブル`dst`には1つのブロックのみが挿入されています。これは、2番目のブロックが重複排除されたために発生しました。挿入されたデータから計算されるハッシュである重複排除キー`block_id`が同じデータを持っているためです。この動作は期待されたものではありません。このようなケースは稀ですが、理論的には発生する可能性があります。このようなケースを正しく処理するには、ユーザーが`insert_deduplication_token`を指定する必要があります。以下の例でこれを修正しましょう:

### `insert_deduplication_token`を使用した挿入における同一ブロック {#identical-blocks-in-insertion-with-insert_deduplication_token}

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
````

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

期待通り、2つの同一ブロックが挿入されました。

```sql
SELECT '2回目の試行';

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

再試行された挿入は期待通り重複排除されました。

```sql
SELECT '3回目の試行';

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

この挿入も、異なるデータを含んでいるにもかかわらず重複排除されます。`insert_deduplication_token`の方が優先度が高いことに注意してください。`insert_deduplication_token`が指定されている場合、ClickHouseはデータのハッシュ値を使用しません。

### マテリアライズドビューの基礎テーブルでの変換後に異なる挿入操作が同じデータを生成する場合 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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


SET deduplicate&#95;blocks&#95;in&#95;dependent&#95;materialized&#95;views=1;

select &#39;first attempt&#39;;

INSERT INTO dst VALUES (1, &#39;A&#39;);

SELECT
&#39;from dst&#39;,
*,
&#95;part
FROM dst
ORDER by all;

┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   1 │ A     │ all&#95;0&#95;0&#95;0 │
└────────────┴─────┴───────┴───────────┘

SELECT
&#39;from mv&#95;dst&#39;,
*,
&#95;part
FROM mv&#95;dst
ORDER by all;

┌─&#39;from mv&#95;dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from mv&#95;dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
└───────────────┴─────┴───────┴───────────┘

select &#39;second attempt&#39;;

INSERT INTO dst VALUES (2, &#39;A&#39;);

SELECT
&#39;from dst&#39;,
*,
&#95;part
FROM dst
ORDER by all;

┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   1 │ A     │ all&#95;0&#95;0&#95;0 │
│ from dst   │   2 │ A     │ all&#95;1&#95;1&#95;0 │
└────────────┴─────┴───────┴───────────┘

SELECT
&#39;from mv&#95;dst&#39;,
*,
&#95;part
FROM mv&#95;dst
ORDER by all;

┌─&#39;from mv&#95;dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from mv&#95;dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
│ from mv&#95;dst   │   0 │ A     │ all&#95;1&#95;1&#95;0 │
└───────────────┴─────┴───────┴───────────┘

````

毎回異なるデータを挿入しています。しかし、`mv_dst`テーブルには同じデータが挿入されます。ソースデータが異なるため、データの重複排除は行われません。

### 異なるマテリアライズドビューが同等のデータを1つの基底テーブルに挿入する場合 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

select '1回目の試行';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'dstテーブルから',
    *,
    _part
FROM dst
ORDER by all;

┌─'dstテーブルから'─┬─key─┬─value─┬─_part─────┐
│ dstテーブルから   │   1 │ A     │ all_0_0_0 │
└──────────────────┴─────┴───────┴───────────┘

SELECT
    'mv_dstテーブルから',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'mv_dstテーブルから'─┬─key─┬─value─┬─_part─────┐
│ mv_dstテーブルから   │   0 │ A     │ all_0_0_0 │
│ mv_dstテーブルから   │   0 │ A     │ all_1_1_0 │
└─────────────────────┴─────┴───────┴───────────┘
````

`mv_dst` テーブルに同じブロックが 2 つ挿入されました（想定どおりです）。

```sql
SELECT '2回目の試行';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'dstから',
    *,
    _part
FROM dst
ORDER BY all;
```


┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   1 │ A     │ all&#95;0&#95;0&#95;0 │
└────────────┴─────┴───────┴───────────┘

SELECT
&#39;from mv&#95;dst&#39;,
*,
&#95;part
FROM mv&#95;dst
ORDER by all;

┌─&#39;from mv&#95;dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from mv&#95;dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
│ from mv&#95;dst   │   0 │ A     │ all&#95;1&#95;1&#95;0 │
└───────────────┴─────┴───────┴───────────┘

```

このリトライ操作は、`dst`テーブルと`mv_dst`テーブルの両方で重複排除されます。
```
