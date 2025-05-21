---
'slug': '/guides/developer/deduplicating-inserts-on-retries'
'title': '重试时去重插入'
'description': '在重试插入操作时防止重复数据'
'keywords':
- 'deduplication'
- 'deduplicate'
- 'insert retries'
- 'inserts'
---



插入操作有时会因超时等错误而失败。当插入失败时，数据可能已经被成功插入，也可能没有。本文指南介绍如何在插入重试时启用去重，以防止相同的数据被多次插入。

当插入被重试时，ClickHouse 尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 并不会将其插入到目标表中。然而，用户仍然会收到成功操作状态，仿佛数据已正常插入。

## 启用插入重试的去重 {#enabling-insert-deduplication-on-retries}

### 表的插入去重 {#insert-deduplication-for-tables}

**只有 `*MergeTree` 引擎支持插入时的去重。**

对于 `*ReplicatedMergeTree` 引擎，插入去重默认启用，并由 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 和 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 设置控制。对于非复制的 `*MergeTree` 引擎，去重由 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 设置控制。

上述设置决定了表的去重日志参数。去重日志存储有限数量的 `block_id`，这些 ID 决定了去重的工作方式（见下文）。

### 查询级别的插入去重 {#query-level-insert-deduplication}

设置 `insert_deduplicate=1` 可以启用查询级别的去重。请注意，如果您使用 `insert_deduplicate=0` 插入数据，则即使您用 `insert_deduplicate=1` 重试插入，该数据也无法去重。这是因为在使用 `insert_deduplicate=0` 插入时，`block_id` 并不会被写入区块中。

## 插入去重的工作原理 {#how-insert-deduplication-works}

当数据插入到 ClickHouse 时，它会根据行数和字节数将数据拆分为块。

对于使用 `*MergeTree` 引擎的表，每个块都会分配一个唯一的 `block_id`，它是该块数据的哈希值。这个 `block_id` 被用作插入操作的唯一键。如果在去重日志中找到相同的 `block_id`，则该块被视为重复并不会被插入到表中。

这种方法对于插入包含不同数据的情况效果良好。然而，如果相同的数据被有意多次插入，则需要使用 `insert_deduplication_token` 设置来控制去重过程。该设置允许您为每次插入指定一个唯一令牌，ClickHouse 用这个令牌来判断数据是否为重复。

对于 `INSERT ... VALUES` 查询，将插入的数据拆分为块是确定性的，并由设置决定。因此，用户应该使用与初始操作相同的设置值重试插入。

对于 `INSERT ... SELECT` 查询，重要的是查询的 `SELECT` 部分在每次操作中返回相同的数据，并且顺序一致。请注意，这在实际使用中很难实现。为了确保重试时数据顺序稳定，请在查询的 `SELECT` 部分定义精确的 `ORDER BY` 部分。请记住，在重试之间，所选择的表可能会更新：结果数据可能已更改，去重将不会发生。此外，在插入大量数据时，插入后生成的块数量可能会溢出去重日志窗口，ClickHouse 将不知道去重这些块。

## 使用物化视图的插入去重 {#insert-deduplication-with-materialized-views}

当一个表有一个或多个物化视图时，插入的数据也会以定义的转换插入到这些视图的目标中。转换后的数据在重试时也会进行去重。ClickHouse 以与对目标表插入的数据去重相同的方式，对物化视图进行去重。

您可以使用以下设置来控制源表的去重过程：

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

您还可以使用用户配置设置 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)。

在向物化视图下的表中插入块时，ClickHouse 通过哈希一个结合了源表的 `block_id` 和额外标识符的字符串来计算 `block_id`。这确保了在物化视图中进行准确的去重，使数据能够根据其原始插入进行区分，而不受在到达物化视图下的目标表之前应用的任何转换的影响。

## 示例 {#examples}

### 物化视图转换后的相同块 {#identical-blocks-after-materialized-view-transformations}

在物化视图内部生成的相同块不会被去重，因为它们基于不同的插入数据。

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

以上设置允许我们从一个仅包含一行的块系列的表中选择。这些小块不会被压缩，并保持不变，直到它们被插入到表中。

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

在此，我们可以看到两个部分已插入到 `dst` 表中。 从选择中得到 2 个块 -- 插入时有 2 个部分。这些部分包含不同的数据。

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

在此，我们可以看到 2 个部分已插入到 `mv_dst` 表中。 那些部分包含相同的数据，但它们没有被去重。

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

在此，我们看到当我们重试插入时，所有数据都被去重。去重在 `dst` 和 `mv_dst` 表中都有效。

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

在上述设置下，由于选择产生两个块——因此，应该有两个块插入到 `dst` 表中。然而，我们看到只插入了一个块到 `dst` 表。这是因为第二个块被去重了。它具有相同的数据和用于去重的 `block_id`，这是通过插入的数据计算的哈希值。这种行为并不是预期的。这样的情况很少发生，但理论上是可能的。为了正确处理这种情况，用户需要提供 `insert_deduplication_token`。让我们通过以下示例来修复这个问题：

### 使用 `insert_deduplication_token` 的插入中的相同块 {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

两个相同的块已按预期插入。

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

该插入也进行了去重，即使它包含不同的插入数据。请注意，`insert_deduplication_token` 优先级更高：提供了 `insert_deduplication_token` 时，ClickHouse 不使用数据的哈希和。

### 物化视图的底层表中不同插入操作生成相同数据 {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

我们每次插入不同的数据。但是，相同的数据被插入到 `mv_dst` 表中。数据没有去重，因为源数据不同。

### 向一个底层表进行不同的物化视图插入，产生等效数据 {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

两个相等的块被插入到表 `mv_dst`（如预期）。

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

该重试操作在 `dst` 和 `mv_dst` 两个表中都进行了去重。
