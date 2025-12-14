---
slug: /guides/developer/deduplicating-inserts-on-retries
title: '重试插入时的数据去重'
description: '在重试插入操作时防止产生重复数据'
keywords: ['deduplication', 'deduplicate', 'insert retries', 'inserts']
doc_type: 'guide'
---

插入操作有时会因为超时等错误而失败。当插入失败时，数据可能已经成功写入，也可能没有。本指南介绍如何在重试插入时启用去重，以确保相同数据不会被多次插入。

当插入被重试时，ClickHouse 会尝试判断这些数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 不会将其再次写入目标表。不过，用户仍然会收到成功的操作状态反馈，就像数据已正常插入一样。

## 限制 {#limitations}

### 不确定的插入状态 {#uncertain-insert-status}

用户必须重试插入操作直到成功为止。如果所有重试都失败，则无法确定数据是否已被插入。如果涉及物化视图，也无法确定数据可能出现在哪些表中。物化视图可能与源表不同步。

### 去重窗口限制 {#deduplication-window-limit}

如果在重试过程中发生的其他插入操作次数超过 `*_deduplication_window`，则去重可能无法按预期工作。在这种情况下，相同的数据可能会被多次插入。

## 在重试插入时启用插入去重 {#enabling-insert-deduplication-on-retries}

### 表级插入去重 {#insert-deduplication-for-tables}

**只有 `*MergeTree` 引擎支持插入去重。**

对于 `*ReplicatedMergeTree` 引擎，插入去重默认启用，并由 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 设置进行控制。对于非副本的 `*MergeTree` 引擎，去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 设置进行控制。

上述设置决定了表去重日志的参数。去重日志存储有限数量的 `block_id`，这些 `block_id` 决定了去重的工作方式（见下文）。

### 查询级插入去重 {#query-level-insert-deduplication}

将设置 `insert_deduplicate=1` 可在查询级别启用去重。请注意，如果你使用 `insert_deduplicate=0` 插入数据，即使之后在重试插入时使用 `insert_deduplicate=1`，这些数据也无法被去重。这是因为在使用 `insert_deduplicate=0` 进行插入时，不会为数据块写入 `block_id`。

## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据插入到 ClickHouse 时，ClickHouse 会根据行数和字节数将数据拆分为多个数据块（block）。

对于使用 `*MergeTree` 引擎的表，每个数据块都会被分配一个唯一的 `block_id`，它是基于该块中数据计算得到的哈希值。这个 `block_id` 被用作插入操作的唯一键。如果在去重日志中发现相同的 `block_id`，则该数据块会被视为重复，不会插入到表中。

这种方式在插入包含不同数据的场景下非常有效。不过，如果你有意多次插入相同的数据，则需要使用 `insert_deduplication_token` 设置来控制去重过程。通过该设置，你可以为每次插入指定一个唯一的 token，ClickHouse 会使用该 token 来判断数据是否为重复数据。

对于 `INSERT ... VALUES` 查询，插入数据被拆分成块的方式是确定性的，并由相关设置决定。因此，用户在重试插入时应当使用与初始操作相同的设置值。

对于 `INSERT ... SELECT` 查询，关键在于查询的 `SELECT` 部分在每次执行时都返回相同顺序的相同数据。需要注意的是，这在实际使用中很难保证。为了在重试时确保数据顺序稳定，应当在查询的 `SELECT` 部分中定义精确的 `ORDER BY` 子句。请牢记，被选取的数据表在重试之间可能会被更新：结果数据可能发生变化，从而导致无法触发去重。此外，在插入大量数据的场景下，插入后产生的数据块数量有可能超出去重日志窗口的范围，此时 ClickHouse 将无法识别并对这些数据块进行去重。

## 使用物化视图进行插入去重 {#insert-deduplication-with-materialized-views}

当一个表存在一个或多个物化视图时，插入到该表中的数据会在应用定义好的转换后，同时插入到这些视图的目标表中。经过转换的数据在重试时同样会进行去重。ClickHouse 对物化视图执行去重的方式，与对插入到目标表中的数据进行去重的方式相同。

可以通过为源表配置以下设置来控制这一过程：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

还需要启用用户配置中的 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views) 设置。
启用 `insert_deduplicate=1` 时，插入的数据会在源表中被去重。将 `deduplicate_blocks_in_dependent_materialized_views=1` 设为开启，则会在依赖的物化视图目标表中额外启用去重。如果需要完整的去重效果，必须同时启用这两个设置。

在向包含物化视图的表中插入数据块时，ClickHouse 会通过对一个字符串进行哈希来计算 `block_id`，该字符串由源表的 `block_id` 与其他标识符组合而成。这确保了在物化视图中的去重准确可靠，使得数据可以根据其最初的插入来进行区分，而不受在到达物化视图目标表之前所应用的任何转换的影响。

## 示例 {#examples}

### 物化视图转换后生成的相同数据块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部转换过程中生成的相同数据块不会被去重，因为它们是基于不同的插入数据生成的。

下面是一个示例：

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

上述设置使我们可以从一个表中进行查询，该表由一系列仅包含一行的数据块组成。在插入到表中之前，这些小数据块不会被合并，并会保持不变。

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

我们需要在物化视图中启用去重：

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

在这里我们可以看到，已经向 `dst` 表中插入了两个 part。来自 select 的 2 个数据块 —— 插入时对应 2 个 part。这些 part 中的数据是不同的。

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

这里可以看到，`mv_dst` 表中插入了 2 个数据片段。这些数据片段包含相同的数据，但并未去重。

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

在这里可以看到，当我们重试插入操作时，所有数据都会被去重。去重机制同时适用于 `dst` 和 `mv_dst` 表。

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

插入：

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

┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
└────────────┴─────┴───────┴───────────┘

```

使用上述设置，select 会产生两个数据块——因此应该有两个数据块插入到表 `dst` 中。然而，我们看到只有一个数据块被插入到表 `dst` 中。这是因为第二个数据块已被去重。它具有相同的数据和去重键 `block_id`，该键是根据插入数据的哈希值计算得出的。这种行为不符合预期。此类情况很少发生，但理论上是可能的。为了正确处理此类情况，用户必须提供 `insert_deduplication_token`。让我们通过以下示例来解决这个问题：

### 使用 `insert_deduplication_token` 插入相同数据块               {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

插入：

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

两个相同的块已按预期插入。

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

重试的写入会按预期被去重。

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

即使该次插入的数据内容不同，也会被去重。请注意，`insert_deduplication_token` 具有更高优先级：当提供 `insert_deduplication_token` 时，ClickHouse 不会使用数据的哈希总和。

### 不同的插入操作在物化视图的底层表中经过转换后生成相同的数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

```

我们每次插入不同的数据。然而,相同的数据被插入到 `mv_dst` 表中。由于源数据不同,数据未被去重。

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

两个相同的数据块已插入表 `mv_dst`（符合预期）。

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


该重试操作在 `dst` 和 `mv_dst` 两个表上均已去重。
