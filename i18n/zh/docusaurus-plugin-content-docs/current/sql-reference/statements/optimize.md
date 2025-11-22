---
description: 'OPTIMIZE 语句文档'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE 语句'
doc_type: 'reference'
---

此查询尝试为表的数据部分初始化一次未调度的合并操作。请注意，我们通常不建议使用 `OPTIMIZE TABLE ... FINAL`（参见这些[文档](/optimize/avoidoptimizefinal)），因为它的使用场景是管理性操作，而不是日常运行。

:::note
`OPTIMIZE` 不能修复 `Too many parts` 错误。
:::

**语法**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` 查询适用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎（包括 [物化视图](/sql-reference/statements/create/view#materialized-view)）以及 [Buffer](../../engines/table-engines/special/buffer.md) 表引擎。其他表引擎不支持该查询。

在 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 表引擎系列中使用 `OPTIMIZE` 时，ClickHouse 会创建一个合并任务，并等待在所有副本上执行（如果 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置为 `2`），或者仅在当前副本上执行（如果 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置为 `1`）。

* 如果由于任何原因 `OPTIMIZE` 未执行合并，它不会通知客户端。若要启用通知，请使用 [optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 设置。
* 如果指定了 `PARTITION`，则仅优化指定的分区。[如何设置分区表达式](alter/partition.md#how-to-set-partition-expression)。
* 如果指定了 `FINAL` 或 `FORCE`，则即使所有数据已经位于同一数据部分中，仍会执行优化。可以通过 [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions) 控制此行为。同时，即使存在并发合并，仍会强制执行合并。
* 如果指定了 `DEDUPLICATE`，则会对完全相同的行进行去重（除非指定了 BY 子句），即比较所有列，这仅对 MergeTree 引擎有意义。

可以通过 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置，指定等待不活跃副本执行 `OPTIMIZE` 查询的时间（秒）。

:::note\
如果 `alter_sync` 设置为 `2`，且某些副本处于不活跃状态的时间超过 `replication_wait_for_inactive_replica_timeout` 设置指定的时长，则会抛出 `UNFINISHED` 异常。
:::


## BY 表达式 {#by-expression}

如果您希望对自定义列集而非所有列执行去重操作,可以显式指定列列表,或使用 [`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) 或 [`EXCEPT`](/sql-reference/statements/select/except-modifier) 表达式的任意组合。显式编写或隐式展开的列列表必须包含行排序表达式(主键和排序键)以及分区表达式(分区键)中指定的所有列。

:::note  
请注意,`*` 的行为与 `SELECT` 中相同:[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 和 [ALIAS](../../sql-reference/statements/create/table.md#alias) 列不会用于展开。

此外,指定空列列表、编写结果为空列列表的表达式或按 `ALIAS` 列去重都会导致错误。
:::

**语法**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- 所有列
OPTIMIZE TABLE table DEDUPLICATE BY *; -- 排除 MATERIALIZED 和 ALIAS 列
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**示例**

考虑以下表:

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

结果:

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

以下所有示例均针对此包含 5 行的状态执行。

#### `DEDUPLICATE` {#deduplicate}

当未指定去重列时,将考虑所有列。仅当某行所有列的值都等于前一行对应列的值时,该行才会被删除:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

```sql
SELECT * FROM example;
```

结果:


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

当隐式指定列时,表将按所有非 `ALIAS` 或 `MATERIALIZED` 类型的列进行去重。对于上表,这些列包括 `primary_key`、`secondary_key`、`value` 和 `partition_key`:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

```sql
SELECT * FROM example;
```

结果:

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

按所有非 `ALIAS` 或 `MATERIALIZED` 类型的列进行去重,并明确排除 `value` 列:即 `primary_key`、`secondary_key` 和 `partition_key` 列。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

```sql
SELECT * FROM example;
```

结果:

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

明确按 `primary_key`、`secondary_key` 和 `partition_key` 列进行去重:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

```sql
SELECT * FROM example;
```

结果:


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

根据匹配正则表达式的所有列进行去重:`primary_key`、`secondary_key` 和 `partition_key` 列:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

```sql
SELECT * FROM example;
```

结果:

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
