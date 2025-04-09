---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 重试时去重插入
description: 在重试插入操作时防止重复数据
keywords: [去重, 去重, 插入重试, 插入]
---

插入操作有时由于超时等错误而失败。当插入失败时，数据可能已经成功插入，也可能没有。本文指南介绍如何在插入重试时启用去重，以确保相同的数据不会被插入多次。

当重试插入时，ClickHouse 会尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，则 ClickHouse 不会将其插入目标表。然而，用户仍会收到一个成功操作的状态，就像数据正常插入一样。

## 启用重试时的插入去重 {#enabling-insert-deduplication-on-retries}

### 表的插入去重 {#insert-deduplication-for-tables}

**仅有 `*MergeTree` 引擎支持插入的去重。**

对于 `*ReplicatedMergeTree` 引擎，插入去重默认启用，受 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds) 设置控制。对于非复制的 `*MergeTree` 引擎，去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window) 设置控制。

上述设置决定了表的去重日志参数。去重日志存储有限数量的 `block_id`s，这决定了去重的工作方式（见下文）。

### 查询级别插入去重 {#query-level-insert-deduplication}

设置 `insert_deduplicate=1` 可以在查询级别启用去重。请注意，如果您使用 `insert_deduplicate=0` 插入数据，即使您重试插入并使用 `insert_deduplicate=1`，该数据也无法被去重。这是因为在使用 `insert_deduplicate=0` 插入时，未写入 `block_id`s。

## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据插入到 ClickHouse 时，它根据行数和字节数将数据拆分为块。

对于使用 `*MergeTree` 引擎的表，每个块分配一个唯一的 `block_id`，该 `block_id` 是该块中数据的哈希值。此 `block_id` 用作插入操作的唯一键。如果在去重日志中找到相同的 `block_id`，则该块被视为重复，不会插入到表中。

这种方法在插入不同数据的情况下效果很好。然而，如果同样的数据故意插入多次，您需要使用 `insert_deduplication_token` 设置来控制去重过程。此设置允许您为每个插入指定一个唯一令牌，ClickHouse 使用此令牌来确定数据是否重复。

对于 `INSERT ... VALUES` 查询，插入数据拆分为块是确定性的，并由设置决定。因此，用户应使用与初始操作相同的设置值重试插入。

对于 `INSERT ... SELECT` 查询，重要的是查询的 `SELECT` 部分在每次操作中返回相同的数据和顺序。请注意，在实际使用中，这很难实现。为确保重试时数据顺序稳定，请在查询的 `SELECT` 部分定义精确的 `ORDER BY` 部分。请记住，所选表在重试之间可能会被更新：结果数据可能已更改，去重将不会发生。此外，在插入大量数据的情况下，插入后的块数量可能会超出去重日志窗口，ClickHouse 将不知道去重这些块。

## 带物化视图的插入去重 {#insert-deduplication-with-materialized-views}

当表具有一个或多个物化视图时，插入的数据也会根据定义的转换插入到这些视图的目标中。转换后数据在重试时也会去重。ClickHouse 以与它去重目标表中插入的数据相同的方式对物化视图执行去重。

您可以使用以下设置控制这一过程：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window)

您还可以使用用户配置文件设置 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)。

在将块插入物化视图下的表时，ClickHouse 通过哈希一个将源表的 `block_id`s 和其他标识符组合的字符串来计算 `block_id`。这确保了在物化视图内的准确去重，使数据能够根据其原始插入进行区分，而不受应用到物化视图目标表之前的任何转换的影响。

## 示例 {#examples}

### 物化视图转换后相同块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部转换时生成的相同块不会被去重，因为它们基于不同的插入数据。

以下是一个示例：

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

上述设置允许我们从包含仅一行的块序列中选择表。这些小块不会被压缩，并且在插入到表之前保持不变。

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
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

这里我们看到两个部分已被插入到 `dst` 表。2 个块来自选择 -- 2 个部分在插入时。部分包含不同的数据。

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

这里我们看到两个部分已被插入到 `mv_dst` 表。尽管这些部分包含相同的数据，但它们并没有被去重。

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

这里我们看到，当我们重试插入时，所有数据都被去重。去重在 `dst` 和 `mv_dst` 表都生效。

### 插入时相同的块 {#identical-blocks-on-insertion}

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
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

根据上述设置，选择的结果生成两个块 -- 因此，应该有两个块插入到 `dst` 表中。然而，我们看到只有一个块被插入到 `dst` 表中。这是因为第二个块被去重。它有相同的数据和由插入数据的哈希值计算的去重 `block_id`。这种行为并不是预期的。这种情况很少发生，但理论上是可能的。为了正确处理这种情况，用户必须提供 `insert_deduplication_token`。让我们通过以下示例来解决这个问题：

### 带 `insert_deduplication_token` 的插入时相同块 {#identical-blocks-in-insertion-with-insert-deduplication_token}

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
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

两个相同的块已如预期插入。

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

重试插入按预期进行了去重。

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

该插入也被去重，尽管它包含不同的插入数据。请注意，`insert_deduplication_token` 优先级更高：ClickHouse 在提供 `insert_deduplication_token` 时不会使用数据的哈希和。

### 不同插入操作在物化视图的底层表中生成相同数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

我们每次插入不同数据。然而，相同的数据插入到 `mv_dst` 表中。由于源数据不同，所以数据没有去重。

### 不同的物化视图插入到一个底层表中，数据等价 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

两个相同的块已插入到 `mv_dst` 表中（如预期）。

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

该重试操作在 `dst` 和 `mv_dst` 表上都进行了去重。
