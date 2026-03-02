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

```sql
OPTIMIZE TABLE [db.]name DRY RUN PARTS 'part_name1', 'part_name2' [, ...] [DEDUPLICATE [BY expression]] [CLEANUP]
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

## DRY RUN \{#dry-run\}

`DRY RUN` 子句会模拟合并指定的分区片段，而不提交结果。合并后的分区片段会被写入到临时位置、进行校验，然后被丢弃。原始分区片段和表数据保持不变。

这在以下场景中非常有用：

* 在不同 ClickHouse 版本之间测试合并的正确性。
* 以确定性方式重现与合并相关的缺陷。
* 对合并性能进行基准测试。

`DRY RUN` 仅支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 家族的表。必须使用带有分区片段名称列表的 `PARTS` 关键字。所有指定的分区片段必须存在、处于活动状态，并且属于同一分区。

`DRY RUN` 与 `FINAL` 和 `PARTITION` 不兼容。它可以与 `DEDUPLICATE`（可选列指定）以及 `CLEANUP`（用于 `ReplacingMergeTree` 表）组合使用。

**语法**

```sql
OPTIMIZE TABLE [db.]name DRY RUN PARTS 'part_name1', 'part_name2' [, ...] [DEDUPLICATE [BY expression]] [CLEANUP]
```

默认情况下，合并生成的分片会以类似于 [`CHECK TABLE`](/sql-reference/statements/check-table) 查询的方式进行校验。此行为由 [optimize&#95;dry&#95;run&#95;check&#95;part](/operations/settings/settings#optimize_dry_run_check_part) SETTING 控制（默认启用）。禁用该设置会跳过校验，这在对合并过程本身进行基准测试时很有用。

**示例**

```sql
CREATE TABLE dry_run_example (key UInt64, value String) ENGINE = MergeTree ORDER BY key;

INSERT INTO dry_run_example VALUES (1, 'a'), (2, 'b');
INSERT INTO dry_run_example VALUES (1, 'c'), (4, 'd');

-- Simulate merging using two parts
OPTIMIZE TABLE dry_run_example DRY RUN PARTS 'all_1_1_0', 'all_2_2_0';

-- Simulate merging with deduplication
OPTIMIZE TABLE dry_run_example DRY RUN PARTS 'all_1_1_0', 'all_2_2_0' DEDUPLICATE;

-- Parts and data remain unchanged after DRY RUN
SELECT name, rows FROM system.parts
WHERE database = currentDatabase() AND table = 'dry_run_example' AND active
ORDER BY name;
```

```response
┌─name────────┬─rows─┐
│ all_1_1_0   │    2 │
│ all_2_2_0   │    2 │
└─────────────┴──────┘
```

## BY 表达式 \{#by-expression\}

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

请考虑如下表：

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

#### `DEDUPLICATE` \{#deduplicate\}

当未指定用于去重的列时，将会考虑所有列。只有当某行中所有列的值都等于前一行中对应列的值时，该行才会被删除：

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

#### `DEDUPLICATE BY *` \{#deduplicate-by-\}

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

#### `DEDUPLICATE BY * EXCEPT` \{#deduplicate-by--except\}

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

#### `DEDUPLICATE BY <list of columns>` \{#deduplicate-by-list-of-columns\}

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

#### `DEDUPLICATE BY COLUMNS(<regex>)` \{#deduplicate-by-columnsregex\}

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
