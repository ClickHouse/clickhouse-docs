这个查询尝试为表中的数据部分初始化一个未调度的合并。请注意，我们通常不建议使用 `OPTIMIZE TABLE ... FINAL`（请参见这些 [文档](/optimize/avoidoptimizefinal)），因为它的用例主要用于管理，而不是日常操作。

:::note
`OPTIMIZE` 不能修复 `Too many parts` 错误。
:::

**语法**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` 查询支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 系列（包括 [物化视图](/sql-reference/statements/create/view#materialized-view)）和 [Buffer](../../engines/table-engines/special/buffer.md) 引擎。其他表引擎不受支持。

当 `OPTIMIZE` 与 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 系列表引擎一起使用时，ClickHouse 会创建一个合并任务，并等待所有副本执行（如果 [alter_sync](/operations/settings/settings#alter_sync) 设置为 `2`）或等待当前副本执行（如果 [alter_sync](/operations/settings/settings#alter_sync) 设置为 `1`）。

- 如果 `OPTIMIZE` 由于某种原因未执行合并，则不会通知客户端。要启用通知，请使用 [optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 设置。
- 如果指定了 `PARTITION`，则仅优化指定的分区。[如何设置分区表达式](alter/partition.md#how-to-set-partition-expression)。
- 如果指定了 `FINAL` 或 `FORCE`，则即使所有数据已经在一个部分中，仍会执行优化。您可以通过 [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions) 设置来控制此行为。如果同时执行合并，也会强制合并。
- 如果指定了 `DEDUPLICATE`，则完全相同的行（除非指定了 by-clause）将被去重（比较所有列），这仅对 MergeTree 引擎有意义。

您可以通过 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待不活跃副本执行 `OPTIMIZE` 查询的最长时间（以秒为单位）。

:::note    
如果 `alter_sync` 设置为 `2`，并且某些副本在设置的 `replication_wait_for_inactive_replica_timeout` 超过指定时间不活跃，则会抛出异常 `UNFINISHED`。
:::

## BY 表达式 {#by-expression}

如果您想对自定义列集进行去重而不是对所有列，您可以显式指定列的列表或使用 [`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) 或 [`EXCEPT`](/sql-reference/statements/select#except) 表达式的任意组合。显式书写的或隐式扩展的列列表必须包括在行排序表达式（主键和排序键）和分区表达式（分区键）中指定的所有列。

:::note    
请注意，`*` 的行为与 `SELECT` 中相同：[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 和 [ALIAS](../../sql-reference/statements/create/table.md#alias) 列不用于扩展。

此外，指定空列列表，或写出结果为空列列表的表达式，或通过 `ALIAS` 列去重是错误的。
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

考虑以下表：

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

所有以下示例均针对包含 5 行的这个状态执行。

#### `DEDUPLICATE` {#deduplicate}
当未指定去重列时，会考虑所有列。只有当所有列的值都与前一行的相应值相等时，行才会被移除：

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

当隐式指定列时，表通过所有不是 `ALIAS` 或 `MATERIALIZED` 的列去重。考虑上面的表，这些是 `primary_key`、`secondary_key`、`value` 和 `partition_key` 列：

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
按所有不是 `ALIAS` 或 `MATERIALIZED` 的列去重，并显式不考虑 `value` 列：`primary_key`、`secondary_key` 和 `partition_key` 列。

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

显式通过 `primary_key`、`secondary_key` 和 `partition_key` 列去重：

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

通过匹配正则表达式的所有列去重：`primary_key`、`secondary_key` 和 `partition_key` 列：

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
