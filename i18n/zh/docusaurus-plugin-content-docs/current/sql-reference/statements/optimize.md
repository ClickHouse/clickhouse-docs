---
description: 'Optimize 的文档'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE 语句'
doc_type: 'reference'
---

此查询尝试为表的数据片段触发一次非计划内的合并操作。请注意，我们通常不建议使用 `OPTIMIZE TABLE ... FINAL`（参见这些[文档](/optimize/avoidoptimizefinal)），因为它主要用于管理性维护，而不是日常操作。

:::note
`OPTIMIZE` 无法修复 `Too many parts` 错误。
:::

**语法**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` 查询支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎（包括 [物化视图](/sql-reference/statements/create/view#materialized-view)）以及 [Buffer](../../engines/table-engines/special/buffer.md) 引擎。其他表引擎不支持。

当在 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 系列表引擎上使用 `OPTIMIZE` 时，ClickHouse 会创建一个合并任务，并在所有副本上等待执行（如果 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置为 `2`），或者只在当前副本上等待执行（如果 [alter&#95;sync](/operations/settings/settings#alter_sync) 设置为 `1`）。

* 如果 `OPTIMIZE` 由于任何原因未执行合并，它不会通知客户端。要启用通知，请使用 [optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 设置。
* 如果指定了 `PARTITION`，则仅优化指定的分区。[如何设置分区表达式](alter/partition.md#how-to-set-partition-expression)。
* 如果指定了 `FINAL` 或 `FORCE`，即使所有数据已经在一个 part 中，也会执行优化。可以通过 [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions) 控制此行为。此外，即使正在执行并发合并，也会强制执行合并。
* 如果指定了 `DEDUPLICATE`，则完全相同的行（除非指定了 BY 子句）会被去重（比较所有列），这仅对 MergeTree 引擎有意义。

可以通过 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待处于非活动状态的副本执行 `OPTIMIZE` 查询的最长时间（以秒为单位）。

:::note\
如果将 `alter_sync` 设置为 `2`，并且某些副本处于非活动状态的时间超过 `replication_wait_for_inactive_replica_timeout` 设置指定的时间，则会抛出 `UNFINISHED` 异常。
:::


## BY 表达式

如果希望基于自定义的一组列而不是所有列进行去重，可以显式指定列列表，或使用 [`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) 或 [`EXCEPT`](/sql-reference/statements/select/except-modifier) 表达式的任意组合。显式写出或隐式展开得到的列列表必须包含行排序表达式（主键和排序键）以及分区表达式（分区键）中指定的所有列。

:::note\
注意，`*` 的行为与在 `SELECT` 中相同：[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 和 [ALIAS](../../sql-reference/statements/create/table.md#alias) 列不会参与展开。

此外，指定空列表、写出会得到空列表的表达式，或者按某个 `ALIAS` 列进行去重，都是错误的。
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

考虑如下表：

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

下面所有示例都在当前包含 5 行的数据状态下执行。

#### `DEDUPLICATE`

当未指定用于去重的列时，将使用所有列进行去重。只有当一行中所有列的值都与前一行对应列的值相等时，该行才会被删除：

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

#### `DEDUPLICATE BY *`

当未显式指定列时，表会按所有不是 `ALIAS` 或 `MATERIALIZED` 的列进行去重。结合上表来看，这些列是 `primary_key`、`secondary_key`、`value` 和 `partition_key` 列：

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

#### `DEDUPLICATE BY * EXCEPT`

根据所有既不是 `ALIAS` 也不是 `MATERIALIZED`，且不为 `value` 的列（即 `primary_key`、`secondary_key` 和 `partition_key` 列）进行去重。

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

#### `DEDUPLICATE BY <list of columns>`

显式按 `primary_key`、`secondary_key` 和 `partition_key` 列去重：

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

#### `DEDUPLICATE BY COLUMNS(<regex>)`

根据所有匹配该正则表达式的列进行去重：`primary_key`、`secondary_key` 和 `partition_key` 列：

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
