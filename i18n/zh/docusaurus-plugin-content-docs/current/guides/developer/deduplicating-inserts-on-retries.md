---
'slug': '/guides/developer/deduplicating-inserts-on-retries'
'title': '去重插入操作的重试'
'description': '在重试插入操作时防止重复数据'
'keywords':
- 'deduplication'
- 'deduplicate'
- 'insert retries'
- 'inserts'
'doc_type': 'guide'
---

插入操作有时可能由于超时等错误而失败。当插入失败时，数据可能已成功插入，也可能未成功插入。本指南介绍了如何在插入重试时启用去重，以确保相同的数据不会被插入多次。

当插入被重试时，ClickHouse 尝试确定数据是否已成功插入。如果插入的数据被标记为重复，ClickHouse 不会将其插入目标表中。但是，用户仍然会收到一条成功的操作状态，仿佛数据是正常插入的。

## 限制 {#limitations}

### 不确定的插入状态 {#uncertain-insert-status}

用户必须重试插入操作，直到成功为止。如果所有重试都失败，则无法确定数据是否已插入。当涉及物化视图时，也不清楚数据可能出现在什么表中。物化视图可能与源表不同步。

### 去重窗口限制 {#deduplication-window-limit}

如果在重试序列中发生超过 `*_deduplication_window` 的其他插入操作，去重可能无法按预期工作。在这种情况下，相同的数据可以被插入多次。

## 在重试时启用插入去重 {#enabling-insert-deduplication-on-retries}

### 表的插入去重 {#insert-deduplication-for-tables}

**只有 `*MergeTree` 引擎支持插入时去重。**

对于 `*ReplicatedMergeTree` 引擎，插入去重默认为启用，并由 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 设置控制。对于非复制的 `*MergeTree` 引擎，去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 设置控制。

上述设置决定了表的去重日志的参数。去重日志存储有限数量的 `block_id`，这些 `block_id` 决定了去重的工作方式（见下文）。

### 查询级别的插入去重 {#query-level-insert-deduplication}

设置 `insert_deduplicate=1` 在查询级别启用去重。请注意，如果您使用 `insert_deduplicate=0` 插入数据，则即使您重试插入时设置为 `insert_deduplicate=1`，该数据也无法去重。这是因为在使用 `insert_deduplicate=0` 插入时未为块写入 `block_id`。

## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据插入到 ClickHouse 中时，它根据行数和字节将数据拆分为块。

对于使用 `*MergeTree` 引擎的表，每个块被分配一个唯一的 `block_id`，这是该块数据的哈希值。此 `block_id` 用作插入操作的唯一键。如果在去重日志中找到相同的 `block_id`，则该块被视为重复，不插入表中。

这种方法在插入包含不同数据的情况下效果良好。然而，如果故意多次插入相同的数据，则需要使用设置 `insert_deduplication_token` 来控制去重过程。该设置允许您为每次插入指定一个唯一的令牌，ClickHouse 使用该令牌来确定数据是否为重复。

对于 `INSERT ... VALUES` 查询，将插入的数据拆分为块是确定性的，并由设置决定。因此，用户应使用与初始操作相同的设置值重试插入。

对于 `INSERT ... SELECT` 查询，确保查询的 `SELECT` 部分在每次操作中返回相同的数据且顺序相同是很重要的。请注意，在实际使用中很难实现这一点。为了确保重试时数据顺序稳定，请在查询的 `SELECT` 部分定义精确的 `ORDER BY` 部分。请记住，被选中的表在重试之间可能会被更新：结果数据可能已更改，且不会发生去重。此外，在插入大量数据的情况下，插入后块的数量可能会超出去重日志窗口，ClickHouse 将无法知道去重这些块。

## 使用物化视图的插入去重 {#insert-deduplication-with-materialized-views}

当一个表有一个或多个物化视图时，插入的数据也会根据定义的转换插入到这些视图的目标中。转换后的数据在重试时也会进行去重。ClickHouse 以与去重插入目标表中的数据相同的方式对物化视图执行去重。

您可以使用以下设置控制这些过程：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

您还必须启用用户配置文件设置 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)。
启用设置 `insert_deduplicate=1` 后，在源表中插入的数据会进行去重。设置 `deduplicate_blocks_in_dependent_materialized_views=1` 还可以在依赖表中启用去重。如果希望完全去重，则必须同时启用这两个设置。

在将块插入物化视图下的表时，ClickHouse 通过对来自源表的 `block_id` 和其他标识符的字符串进行哈希来计算 `block_id`。这确保了在物化视图内的准确去重，使数据能够根据其原始插入进行区分，而不管在到达物化视图下的目标表之前应用了什么转换。

## 示例 {#examples}

### 物化视图转换后的相同块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部生成的相同块不会去重，因为它们基于不同的插入数据。

以下是示例：

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

上述设置允许我们从一个包含只有一行的块系列中选择。这些小块不会被压缩，并且在插入到表中之前保持不变。

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

在这里我们看到两个部分已被插入到 `dst` 表中。来自选择的 2 个块 -- 在插入时有 2 个部分。这些部分包含不同的数据。

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

在这里我们看到 2 个部分已被插入到 `mv_dst` 表中。这些部分包含相同的数据，但不被去重。

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

在这里我们看到，当我们重试插入时，所有数据均被去重。去重对于 `dst` 和 `mv_dst` 表均有效。

### 插入时的相同块 {#identical-blocks-on-insertion}

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

插入操作：

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

使用上述设置，选择的结果产生两个块——因此，应该有两个块插入到 `dst` 表中。然而，我们看到只插入到了表 `dst` 中的一个块。这是因为第二个块已被去重。它的数据相同，并且去重的键 `block_id` 是根据插入数据的哈希值计算得出的。这种行为是意外的。这种情况虽然不常见，但理论上是可能的。为了正确处理这种情况，用户必须提供一个 `insert_deduplication_token`。让我们用以下示例来解决这个问题：

### 使用 `insert_deduplication_token` 的插入相同块 {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

插入操作：

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

重试插入如预期般去重。

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

该插入也被去重，尽管它包含了不同的插入数据。请注意，`insert_deduplication_token` 的优先级更高：当提供 `insert_deduplication_token` 时，ClickHouse 不会使用数据的哈希和。

### 不同插入操作在物化视图的基础表中经过转换后生成相同数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

我们每次插入不同的数据。然而，相同的数据被插入到 `mv_dst` 表中。数据未被去重，因为源数据不同。

### 不同物化视图插入到一个基础表中但数据相同 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

两个相同的块被插入到表 `mv_dst`（如预期）。

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

该重试操作在 `dst` 和 `mv_dst` 两个表中进行了去重。
