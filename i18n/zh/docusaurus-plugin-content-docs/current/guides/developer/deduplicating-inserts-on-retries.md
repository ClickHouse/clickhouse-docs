---
slug: /guides/developer/deduplicating-inserts-on-retries
title: '在重试插入时进行去重'
description: '在重试插入操作时防止产生重复数据'
keywords: ['deduplication', 'deduplicate', 'insert retries', 'inserts']
doc_type: 'guide'
---

插入操作有时会因为超时等错误而失败。当插入失败时，数据可能已经成功插入，也可能没有成功插入。本指南介绍如何在重试插入时启用去重，以确保相同数据不会被多次插入。

当某次插入被重试时，ClickHouse 会尝试判断这些数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 就不会将其写入目标表。不过，用户仍然会像数据已正常插入一样，收到一次成功的操作状态响应。



## 限制 {#limitations}

### 插入状态不确定 {#uncertain-insert-status}

用户必须重试插入操作直至成功。如果所有重试均失败,则无法确定数据是否已插入。当涉及物化视图时,也无法确定数据可能已写入哪些表。物化视图可能与源表出现不同步。

### 去重窗口限制 {#deduplication-window-limit}

如果在重试序列期间发生了超过 `*_deduplication_window` 个其他插入操作,去重功能可能无法按预期工作。在这种情况下,相同的数据可能被多次插入。


## 在重试时启用插入去重 {#enabling-insert-deduplication-on-retries}

### 表的插入去重 {#insert-deduplication-for-tables}

**只有 `*MergeTree` 引擎支持插入去重。**

对于 `*ReplicatedMergeTree` 引擎,插入去重默认启用,由 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 设置控制。对于非复制的 `*MergeTree` 引擎,去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 设置控制。

上述设置决定了表的去重日志参数。去重日志存储有限数量的 `block_id`,这些 `block_id` 决定了去重的工作方式(见下文)。

### 查询级别的插入去重 {#query-level-insert-deduplication}

设置 `insert_deduplicate=1` 可在查询级别启用去重。请注意,如果使用 `insert_deduplicate=0` 插入数据,即使使用 `insert_deduplicate=1` 重试插入,该数据也无法被去重。这是因为在使用 `insert_deduplicate=0` 插入时,不会为数据块写入 `block_id`。


## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据插入到 ClickHouse 时,系统会根据行数和字节数将数据拆分为多个数据块。

对于使用 `*MergeTree` 引擎的表,每个数据块都会被分配一个唯一的 `block_id`,它是该块中数据的哈希值。这个 `block_id` 用作插入操作的唯一标识。如果在去重日志中发现相同的 `block_id`,该块将被视为重复数据而不会插入到表中。

这种方法适用于插入不同数据的场景。但是,如果需要有意多次插入相同的数据,则需要使用 `insert_deduplication_token` 设置来控制去重过程。该设置允许您为每次插入指定一个唯一的令牌,ClickHouse 会使用该令牌来判断数据是否重复。

对于 `INSERT ... VALUES` 查询,插入数据的块拆分是确定性的,由相关设置决定。因此,用户在重试插入时应使用与初始操作相同的设置值。

对于 `INSERT ... SELECT` 查询,关键是查询的 `SELECT` 部分在每次操作中都要以相同的顺序返回相同的数据。请注意,这在实际使用中很难实现。为了确保重试时数据顺序的稳定性,请在查询的 `SELECT` 部分定义明确的 `ORDER BY` 子句。需要注意的是,在重试期间所选表可能会被更新:结果数据可能已发生变化,去重将不会生效。此外,在插入大量数据的情况下,插入后的数据块数量可能会超出去重日志窗口的容量,导致 ClickHouse 无法对这些块进行去重。


## 物化视图的插入去重 {#insert-deduplication-with-materialized-views}

当表具有一个或多个物化视图时,插入的数据会经过定义的转换后同时插入到这些视图的目标表中。转换后的数据在重试时也会进行去重。ClickHouse 对物化视图执行去重的方式与对目标表中插入数据进行去重的方式相同。

您可以使用源表的以下设置来控制此过程:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

您还需要启用用户配置设置 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)。
启用 `insert_deduplicate=1` 设置后,插入的数据会在源表中进行去重。设置 `deduplicate_blocks_in_dependent_materialized_views=1` 会额外在依赖表中启用去重。如果需要完全去重,您必须同时启用这两个设置。

当向物化视图下的表插入数据块时,ClickHouse 会通过对组合了源表 `block_id` 和附加标识符的字符串进行哈希运算来计算 `block_id`。这确保了物化视图内的精确去重,使数据能够根据其原始插入进行区分,而不受到达物化视图目标表之前应用的任何转换的影响。


## 示例 {#examples}

### 物化视图转换后的相同数据块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部转换过程中生成的相同数据块不会被去重,因为它们基于不同的插入数据。

以下是一个示例:

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

上述设置允许我们从表中查询一系列仅包含一行的数据块。这些小数据块不会被合并压缩,在插入表之前保持不变。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

我们需要在物化视图中启用去重:

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

这里我们看到两个数据分区已插入到 `dst` 表中。查询产生 2 个数据块,插入时生成 2 个分区。这些分区包含不同的数据。

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

这里我们看到 2 个数据分区已插入到 `mv_dst` 表中。这些分区包含相同的数据,但它们没有被去重。

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

这里我们看到当重试插入时,所有数据都被去重了。去重对 `dst` 和 `mv_dst` 表都有效。

### 插入时的相同数据块 {#identical-blocks-on-insertion}

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

插入操作:

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

使用上述设置,select 会产生两个数据块——因此应该有两个数据块插入到表 `dst` 中。然而,我们看到只有一个数据块被插入到表 `dst` 中。这是因为第二个数据块被去重了。它具有相同的数据和去重键 `block_id`,该键是根据插入数据的哈希值计算得出的。这种行为不符合预期。这种情况很少发生,但理论上是可能的。为了正确处理这种情况,用户必须提供 `insert_deduplication_token`。让我们通过以下示例来解决这个问题:

### 使用 `insert_deduplication_token` 插入相同数据块 {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

插入操作:

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

两个相同的数据块已按预期插入。

```sql
SELECT '第二次尝试';

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

重试的插入操作按预期被去重。

```sql
SELECT '第三次尝试';

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

该插入操作也被去重了,尽管它包含不同的插入数据。请注意,`insert_deduplication_token` 具有更高的优先级:当提供 `insert_deduplication_token` 时,ClickHouse 不使用数据的哈希值。

### 不同的插入操作在物化视图的底层表中转换后生成相同的数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

select &#39;第一次尝试&#39;;

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

select &#39;第二次尝试&#39;;

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

我们每次插入不同的数据。但是,相同的数据会被插入到 `mv_dst` 表中。由于源数据不同,数据不会被去重。

### 不同物化视图向同一底层表插入等效数据 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

select '第一次尝试';

INSERT INTO dst VALUES (1, 'A');

SELECT
    '来自 dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'来自 dst'─┬─key─┬─value─┬─_part─────┐
│ 来自 dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    '来自 mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'来自 mv_dst'─┬─key─┬─value─┬─_part─────┐
│ 来自 mv_dst   │   0 │ A     │ all_0_0_0 │
│ 来自 mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
````

两个相同的数据块被插入到了表 `mv_dst` 中（符合预期）。

```sql
SELECT '第二次尝试';

INSERT INTO dst VALUES (1, 'A');

SELECT
    '来自 dst',
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

该重试操作在 `dst` 和 `mv_dst` 两个表上都会进行去重。
```
