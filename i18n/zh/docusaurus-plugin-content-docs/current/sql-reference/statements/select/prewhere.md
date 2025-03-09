---
slug: /sql-reference/statements/select/prewhere
sidebar_label: PREWHERE
---


# PREWHERE 子句

Prewhere 是一种优化，用于更高效地应用过滤。即使没有显式指定 `PREWHERE` 子句，它默认情况下也是启用的。它通过自动将部分 [WHERE](../../../sql-reference/statements/select/where.md) 条件移动到 prewhere 阶段来实现。`PREWHERE` 子句的作用只是控制这种优化，前提是您认为自己知道如何比默认方式做得更好。

通过 prewhere 优化，最初只读取执行 prewhere 表达式所需的列。然后读取运行其余查询所需的其他列，但只限于那些在某些行中 prewhere 表达式为 `true` 的数据块。如果有大量的数据块在所有行中 prewhere 表达式为 `false` 并且 prewhere 需要的列少于查询的其他部分，这通常可以减少从磁盘读取的数据量，从而加快查询执行。

## 手动控制 Prewhere {#controlling-prewhere-manually}

该子句的含义与 `WHERE` 子句相同。不同之处在于从表中读取哪些数据。当手动控制 `PREWHERE` 时，适用于查询中少量列的过滤条件，但这些条件提供强大的数据过滤。这减少了要读取的数据量。

查询可以同时指定 `PREWHERE` 和 `WHERE`。在这种情况下，`PREWHERE` 优先于 `WHERE`。

如果 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 设置为 0，则禁用自动将表达式部分从 `WHERE` 移动到 `PREWHERE` 的启发式方法。

如果查询具有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符，则 `PREWHERE` 优化并不总是正确。仅在两个设置 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 和 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) 都开启时才启用。

:::note    
`PREWHERE` 部分在 `FINAL` 之前执行，因此在使用 `PREWHERE` 结合未在表的 `ORDER BY` 部分的字段时，`FROM ... FINAL` 查询的结果可能会出现偏差。
:::

## 限制 {#limitations}

`PREWHERE` 仅支持来自 [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 家族的表。

## 示例 {#example}

```sql
CREATE TABLE mydata
(
    `A` Int64,
    `B` Int8,
    `C` String
)
ENGINE = MergeTree
ORDER BY A AS
SELECT
    number,
    0,
    if(number between 1000 and 2000, 'x', toString(number))
FROM numbers(10000000);

SELECT count()
FROM mydata
WHERE (B = 0) AND (C = 'x');

1 row in set. Elapsed: 0.074 sec. Processed 10.00 million rows, 168.89 MB (134.98 million rows/s., 2.28 GB/s.)

-- 让我们启用追踪以查看哪些谓词被移动到 PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- ClickHouse 自动将 `B = 0` 移动到 PREWHERE，但这没有意义，因为 B 总是 0。

-- 让我们移动其他谓词 `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- 这个手动使用 `PREWHERE` 的查询处理的数据量稍微少一些：158.89 MB 对比 168.89 MB
```
