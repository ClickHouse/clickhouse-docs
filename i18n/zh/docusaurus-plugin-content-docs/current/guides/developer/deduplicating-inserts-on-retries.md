---
'slug': '/guides/developer/deduplicating-inserts-on-retries'
'title': '去重插入失败重试'
'description': '在重试插入操作时防止重复数据'
'keywords':
- 'deduplication'
- 'deduplicate'
- 'insert retries'
- 'inserts'
---

插入操作有时可能因超时等错误而失败。当插入失败时，数据可能已成功插入，也可能没有。 本指南介绍如何在插入重试时启用去重，以确保相同数据不会被插入多次。

当插入被重试时，ClickHouse会尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse将不会将其插入到目标表中。然而，用户仍然会收到一个成功的操作状态，就好像数据已正常插入一样。

## 启用重试时插入去重 {#enabling-insert-deduplication-on-retries}

### 表的插入去重 {#insert-deduplication-for-tables}

**仅支持 `*MergeTree` 引擎的插入去重。**

对于 `*ReplicatedMergeTree` 引擎，插入去重默认启用，并由 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 设置进行控制。对于非复制的 `*MergeTree` 引擎，去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 设置进行控制。

上述设置确定表的去重日志的参数。去重日志存储有限数量的 `block_id`，这决定了去重的工作方式（见下文）。

### 查询级别的插入去重 {#query-level-insert-deduplication}

设置 `insert_deduplicate=1` 在查询级别启用去重。请注意，如果您以 `insert_deduplicate=0` 插入数据，则即使您使用 `insert_deduplicate=1` 重试插入，也无法对该数据进行去重。这是因为在使用 `insert_deduplicate=0` 进行插入时不会为块写入 `block_id`。

## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据插入 ClickHouse 时，它会根据行数和字节数将数据拆分为多个块。

对于使用 `*MergeTree` 引擎的表，每个块被分配一个唯一的 `block_id`，这是该块数据的哈希值。这个 `block_id` 被用作插入操作的唯一键。如果在去重日志中找到相同的 `block_id`，则该块被视为重复，并且不会插入到表中。

这种方法在插入包含不同数据的情况下效果良好。然而，如果相同数据被故意插入多次，您需要使用 `insert_deduplication_token` 设置来控制去重过程。该设置允许您为每个插入指定一个唯一的令牌，ClickHouse 用其来判断数据是否是重复的。

对于 `INSERT ... VALUES` 查询，将插入的数据拆分为块是确定性的，并由设置决定。因此，用户应使用与初始操作相同的设置值来重试插入。

对于 `INSERT ... SELECT` 查询，重要的是查询的 `SELECT` 部分在每次操作中都返回相同的数据且顺序相同。请注意，在实际使用中这很难实现。为了确保重试时数据顺序稳定，请在查询的 `SELECT` 部分定义一个精确的 `ORDER BY` 部分。请记住，选择表可能在重试之间被更新：结果数据可能已更改，去重将不会发生。此外，在插入大量数据的情况下，插入后块的数量可能会超出去重日志窗口，ClickHouse 将无法知道去重块。

## 使用物化视图的插入去重 {#insert-deduplication-with-materialized-views}

当表有一个或多个物化视图时，插入的数据也会插入到这些视图的目标中，并应用定义的转换。转换后的数据在重试时也会去重。ClickHouse 对物化视图的去重方式与对插入目标表的数据进行去重的方式相同。

您可以使用源表的以下设置来控制此过程：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

您还可以使用用户配置设置 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)。

当将块插入物化视图下的表时，ClickHouse 通过对来源表的 `block_id` 和附加标识符进行哈希来计算 `block_id`。 这确保在物化视图中进行准确的去重，即使在达到物化视图下的目标表之前应用了任何转换，数据仍然可以基于其原始插入进行区分。

## 示例 {#examples}

### 物化视图转换后的相同块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部生成的相同块不会去重，因为它们基于不同的插入数据。

以下是一个例子：

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

上述设置使我们能够从一个表中选择一系列仅包含一行的块。这些小块不会被压缩，并且在插入到表中之前保持相同。

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

在这里我们看到两个部分已插入到 `dst` 表中。来自选择的 2 块 -- 插入时的 2 部分。这些部分包含不同的数据。

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

在这里我们看到有 2 部分已插入到 `mv_dst` 表中。这些部分包含相同的数据，但它们没有被去重。

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

在这里我们看到当我们重试插入时，所有数据都被去重。去重在 `dst` 和 `mv_dst` 表中都有效。

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

在上述设置下，来自选择的两个块 -- 结果应该是向 `dst` 表插入两个块。然而，我们看到只有一个块被插入到 `dst` 表中。这是因为第二个块已被去重。它具有相同的数据和作为去重键的 `block_id`，该值是从插入的数据中计算的哈希。这个行为与预期不符。这种情况比较少见，但理论上是可能的。为了正确处理此类情况，用户必须提供一个 `insert_deduplication_token`。让我们通过以下示例来修复这个问题：

### 使用 `insert_deduplication_token` 的插入时相同块 {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

两个相同的块按预期插入。

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

重试插入按预期被去重。

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

即使包含不同插入数据，该插入也被去重。请注意，`insert_deduplication_token` 具有更高的优先级：在提供 `insert_deduplication_token` 时，ClickHouse 不会使用数据的哈希和。

### 不同插入操作在物化视图底层表中生成相同数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

我们每次插入不同的数据。然而，相同的数据被插入到 `mv_dst` 表中。数据没有去重，因为源数据是不同的。

### 不同的物化视图在一个底层表中插入等效数据 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

两个相同的块插入到表 `mv_dst` 中（如预期）。

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
