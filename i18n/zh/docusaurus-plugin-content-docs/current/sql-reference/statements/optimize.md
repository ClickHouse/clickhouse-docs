---
description: 'Optimize 文档'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE 语句'
doc_type: 'reference'
---

此查询会尝试为表发起一次未计划的分区片段合并。请注意，我们通常不建议使用 `OPTIMIZE TABLE ... FINAL`（参见这些[文档](/optimize/avoidoptimizefinal)），因为它主要用于管理维护场景，而不是日常业务操作。

:::note
`OPTIMIZE` 无法解决 `Too many parts` 错误。
:::

**语法**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` 查询支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎（包括 [materialized views](/sql-reference/statements/create/view#materialized-view)）以及 [Buffer](../../engines/table-engines/special/buffer.md) 引擎。其他表引擎不支持。

当在 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 系列表引擎中使用 `OPTIMIZE` 时，ClickHouse 会创建一个合并任务，并在所有副本上等待其执行完成（如果 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置为 `2`），或者只在当前副本上等待（如果 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置为 `1`）。

* 如果由于任何原因 `OPTIMIZE` 没有执行合并，它不会通知客户端。要启用通知，请使用 [optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 设置。
* 如果指定了 `PARTITION`，则仅优化指定的分区。[如何设置分区表达式](alter/partition.md#how-to-set-partition-expression)。
* 如果指定了 `FINAL` 或 `FORCE`，则即使所有数据已经在同一个 part 中也会执行优化。可以通过 [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions) 控制此行为。此外，即使正在执行并发合并，也会强制进行合并。
* 如果指定了 `DEDUPLICATE`，则会对完全相同的行进行去重（除非指定了 `BY` 子句；去重时会比较所有列），这一选项仅对 MergeTree 引擎有意义。

可以通过 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置指定等待处于非活动状态的副本执行 `OPTIMIZE` 查询的时间（以秒为单位）。

:::note
如果 `alter_sync` 设置为 `2`，并且某些副本处于非活动状态的时间超过 `replication_wait_for_inactive_replica_timeout` 设置指定的时长，则会抛出 `UNFINISHED` 异常。
:::

## BY 表达式 {#by-expression}

如果希望仅在自定义的一组列上执行去重，而不是在所有列上去重，可以显式指定列列表，或者使用任意组合的 [`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) 或 [`EXCEPT`](/sql-reference/statements/select/except-modifier) 表达式。显式写出或隐式展开得到的列列表必须包含行排序表达式中指定的所有列（包括主键和排序键）以及分区表达式中指定的所有列（分区键）。

:::note
请注意，`*` 的行为与 `SELECT` 中相同：[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 和 [ALIAS](../../sql-reference/statements/create/table.md#alias) 列不会用于展开。

此外，指定空的列列表，或编写导致列列表为空的表达式，或者按某个 `ALIAS` 列去重，都是错误的。
:::

**语法**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- all columns
OPTIMIZE TABLE table DEDUPLICATE BY *; -- excludes MATERIALIZED and ALIAS columns
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**示例**

请看下列表：

```sql
CREATE TABLE example (
    primary_key Int32,
    secondary_key Int32,
    value UInt32,
    partition_key UInt32,
    materialized_value UInt32 MATERIALIZED 12345,
    aliased_value UInt32 ALIAS 2,
    PRIMARY KEY primary_key
) ENGINE=MergeTree
PARTITION BY partition_key
ORDER BY (primary_key, secondary_key);
```

```sql
INSERT INTO example (primary_key, secondary_key, value, partition_key)
VALUES (0, 0, 0, 0), (0, 0, 0, 0), (1, 1, 2, 2), (1, 1, 2, 3), (1, 1, 3, 3);
```

```sql
SELECT * FROM example;
```

结果：

```sql

┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

所有接下来的示例都是在包含 5 行数据的这一状态下执行的。

#### `DEDUPLICATE` {#deduplicate}

当未指定用于去重的列时，将使用所有列进行去重。只有当该行所有列的值都与前一行对应列的值完全相同时，该行才会被移除：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

```sql
SELECT * FROM example;
```

结果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY *` {#deduplicate-by-}

当未显式指定列时，表会按所有不是 `ALIAS` 或 `MATERIALIZED` 的列进行去重。结合上表，这些列是 `primary_key`、`secondary_key`、`value` 和 `partition_key` 列：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

```sql
SELECT * FROM example;
```

结果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY * EXCEPT` {#deduplicate-by--except}

根据所有不是 `ALIAS` 或 `MATERIALIZED` 且显式排除 `value` 的列进行去重，即：`primary_key`、`secondary_key` 和 `partition_key` 列。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

```sql
SELECT * FROM example;
```

结果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY <list of columns>` {#deduplicate-by-list-of-columns}

显式按 `primary_key`、`secondary_key` 和 `partition_key` 列进行去重：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

```sql
SELECT * FROM example;
```

结果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY COLUMNS(<regex>)` {#deduplicate-by-columnsregex}

按所有匹配该正则表达式的列进行去重：`primary_key`、`secondary_key` 和 `partition_key` 列：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

```sql
SELECT * FROM example;
```

结果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```
