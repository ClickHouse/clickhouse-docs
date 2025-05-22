插入操作有时可能会因超时等错误而失败。当插入失败时，数据可能已成功插入也可能未插入。本文指南涵盖了如何在重试插入时启用去重，以确保相同的数据不会被插入多次。

当插入被重试时，ClickHouse 尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 将不会将其插入到目标表中。然而，用户仍然会收到成功操作状态，仿佛数据已正常插入。

## 启用重试时的插入去重 {#enabling-insert-deduplication-on-retries}

### 表的插入去重 {#insert-deduplication-for-tables}

**只有 `*MergeTree` 引擎支持插入时的去重。**

对于 `*ReplicatedMergeTree` 引擎，插入去重默认启用，并由 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 设置控制。对于非复制的 `*MergeTree` 引擎，去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 设置控制。

上述设置确定了表的去重日志的参数。去重日志存储有限数量的 `block_id`，这些 `block_id` 确定了去重的工作方式（见下文）。

### 查询级别的插入去重 {#query-level-insert-deduplication}

设置 `insert_deduplicate=1` 可以在查询级别启用去重。请注意，如果您在插入数据时使用 `insert_deduplicate=0`，即使您使用 `insert_deduplicate=1` 重试插入，也无法进行去重。这是因为在 `insert_deduplicate=0` 设置下，插入的块不会写入 `block_id`。

## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据被插入到 ClickHouse 时，它会根据行数和字节数将数据拆分成块。

对于使用 `*MergeTree` 引擎的表，每个块都会分配一个唯一的 `block_id`，该 `block_id` 是该块中数据的哈希值。这个 `block_id` 被用作插入操作的唯一键。如果在去重日志中发现相同的 `block_id`，则该块被视为重复，不会被插入到表中。

这种方法在插入包含不同数据的情况下效果良好。然而，如果同样的数据被故意插入多次，您需要使用 `insert_deduplication_token` 设置来控制去重过程。此设置允许您为每次插入指定唯一的令牌，ClickHouse 用于确定数据是否为重复数据。

对于 `INSERT ... VALUES` 查询，插入的数据拆分为块是确定性的，由设置决定。因此，用户应该使用与初始操作相同的设置值重试插入。

对于 `INSERT ... SELECT` 查询，确保查询的 `SELECT` 部分每次操作返回相同数据并按照相同顺序是非常重要的。请注意，在实际使用中，这是很难实现的。为了确保重试时数据顺序的稳定性，请在查询的 `SELECT` 部分定义一个精确的 `ORDER BY` 部分。请记住，选择的表在重试之间可能会被更新：结果数据可能已更改，去重将不会发生。此外，在插入大量数据的情况下，插入后块的数量可能会溢出去重日志窗口，ClickHouse 将无法知道如何去重这些块。

## 使用物化视图的插入去重 {#insert-deduplication-with-materialized-views}

当一个表有一个或多个物化视图时，插入的数据还会根据定义的转换插入到这些视图的目标中。转换后的数据在重试时也会进行去重。ClickHouse 对物化视图执行去重的方式与对插入到目标表的数据去重相同。

您可以使用以下源表设置控制此过程：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

您还可以使用用户配置文件设置 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)。

在将块插入物化视图的表中时，ClickHouse 通过对源表的 `block_id` 和其他标识符的组合字符串进行哈希计算来计算 `block_id`。这确保了在物化视图内部的准确去重，使数据能够根据其原始插入进行区分，而不论在到达物化视图下的目标表之前应用了哪些转换。

## 示例 {#examples}

### 物化视图转换后的相同块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部生成的相同块不会被去重，因为它们基于不同的插入数据。

这是一个示例：

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

上述设置允许我们从一个表中选择一系列仅包含一行的小块。这些小块不会被压缩，并保持不变，直到它们被插入到表中。

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

在这里，我们看到两个部分已被插入到 `dst` 表中。2 块来自选择 -- 2 部分用于插入。这些部分包含不同的数据。

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

在这里，我们看到 2 个部分已插入到 `mv_dst` 表中。这些部分包含相同的数据，但它们没有被去重。

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

在这里，我们看到当我们重试插入时，所有数据都被去重。去重对于 `dst` 和 `mv_dst` 表都有效。

### 插入时相同块 {#identical-blocks-on-insertion}

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

使用上述设置，选择的结果产生两个块 - 因此应该在表 `dst` 中插入两个块。然而，我们看到只有一个块被插入到表 `dst`。这是因为第二个块已被去重。它的数据相同，并且去重的键 `block_id` 是根据插入的数据计算的哈希值。这种行为与预期不符。这种情况虽然很少发生，但理论上是可能的。为了正确处理此类情况，用户必须提供 `insert_deduplication_token`。让我们通过以下示例来修复这个问题：

### 使用 `insert_deduplication_token` 插入时的相同块 {#identical-blocks-in-insertion-with-insert-deduplication_token}

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

两个相同的块如预期那样插入。

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

重试的插入按预期进行了去重。

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

该插入也被去重，即使它包含不同的插入数据。请注意，`insert_deduplication_token` 的优先级更高：当提供 `insert_deduplication_token` 时，ClickHouse 不使用数据的哈希和。

### 在物化视图的基础表中，不同插入操作生成相同数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

我们每次插入不同的数据。然而，相同的数据被插入到 `mv_dst` 表中。数据没有被去重，因为源数据是不同的。

### 不同物化视图插入到一个基础表中具有等效数据 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

两个相等的块插入到表 `mv_dst`（如预期）。

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

该重试操作在 `dst` 和 `mv_dst` 两个表中都被去重。
