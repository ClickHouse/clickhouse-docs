---
slug: /sql-reference/statements/optimize
sidebar_position: 47
sidebar_label: OPTIMIZE
title: 'OPTIMIZE 语句'
---

该查询尝试初始化表中数据部分的非计划合并。请注意，我们通常建议不要使用 `OPTIMIZE TABLE ... FINAL` （参见这些 [文档](/optimize/avoidoptimizefinal)），因为其使用案例是为了管理，而不是日常操作。

:::note
`OPTIMIZE` 无法修复 `Too many parts` 错误。
:::

**语法**

``` sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` 查询支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 家族（包括 [物化视图](/sql-reference/statements/create/view#materialized-view)）和 [Buffer](../../engines/table-engines/special/buffer.md) 引擎。其他表引擎不支持此功能。

当 `OPTIMIZE` 与 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 家族的表引擎一起使用时，ClickHouse 会创建一个合并任务，并在所有副本上等待执行（如果 [alter_sync](/operations/settings/settings#alter_sync) 设置为 `2`），或者在当前副本上执行（如果 [alter_sync](/operations/settings/settings#alter_sync) 设置为 `1`）。

- 如果 `OPTIMIZE` 由于某种原因没有执行合并，它不会通知客户端。要启用通知，请使用 [optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 设置。
- 如果您指定了 `PARTITION`，则仅优化指定的分区。[如何设置分区表达式](alter/partition.md#how-to-set-partition-expression)。
- 如果您指定 `FINAL` 或 `FORCE`，则即使所有数据已经在一个部分中，也会执行优化。您可以使用 [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions) 来控制此行为。此外，即使执行并发合并，也会强制合并。
- 如果您指定 `DEDUPLICATE`，那么完全相同的行（除非指定了 by 子句）将被去重（比较所有列），这仅适用于 MergeTree 引擎。

您可以通过 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待非活动副本执行 `OPTIMIZE` 查询的时间（以秒为单位）。

:::note    
如果 `alter_sync` 设置为 `2`，而某些副本在 `replication_wait_for_inactive_replica_timeout` 设置指定的时间超过后仍未激活，则会抛出异常 `UNFINISHED`。
:::

## BY expression {#by-expression}

如果您希望在自定义列集合上执行去重，而不是在所有列上，您可以显式指定列列表，或者使用 [`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) 或 [`EXCEPT`](/sql-reference/statements/select#except) 表达式的任意组合。显式写入或隐式扩展的列列表必须包括行排序表达式（主键和排序键）以及分区表达式（分区键）中指定的所有列。

:::note    
注意，`*` 的行为与 `SELECT` 中一样：[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 和 [ALIAS](../../sql-reference/statements/create/table.md#alias) 列不用于扩展。

此外，指定空列列表，或编写导致空列列表的表达式，或通过 `ALIAS` 列去重是错误的。
:::

**语法**

``` sql
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

考虑以下表：

``` sql
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

``` sql
INSERT INTO example (primary_key, secondary_key, value, partition_key)
VALUES (0, 0, 0, 0), (0, 0, 0, 0), (1, 1, 2, 2), (1, 1, 2, 3), (1, 1, 3, 3);
```

``` sql
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

所有随后的示例都在具有 5 行的此状态下执行。

#### `DEDUPLICATE` {#deduplicate}
当未指定去重列时，将考虑所有列。仅当所有列的值与前一行的对应值相等时，行才会被移除：

``` sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

``` sql
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

当隐式指定列时，表将按所有非 `ALIAS` 或 `MATERIALIZED` 列去重。考虑上述表，这些列为 `primary_key`、`secondary_key`、`value` 和 `partition_key` 列：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

``` sql
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
按所有非 `ALIAS` 或 `MATERIALIZED` 列去重，并显式排除 `value`：`primary_key`、`secondary_key` 和 `partition_key` 列。

``` sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

``` sql
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

按 `primary_key`、`secondary_key` 和 `partition_key` 列显式去重：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

``` sql
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

按所有匹配正则表达式的列去重：`primary_key`、`secondary_key` 和 `partition_key` 列：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

``` sql
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
