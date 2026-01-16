---
description: 'PREWHERE 子句文档'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'PREWHERE 子句'
doc_type: 'reference'
---

# PREWHERE 子句 \\{#prewhere-clause\\}

PREWHERE 是一种用于更高效执行过滤的优化机制。即使未显式指定 `PREWHERE` 子句，该优化也会默认启用。其工作方式是自动将部分 [WHERE](../../../sql-reference/statements/select/where.md) 条件移动到 PREWHERE 阶段。`PREWHERE` 子句的作用只是用于在你认为自己比默认策略更了解如何进行优化时，手动控制这一优化行为。

启用 PREWHERE 优化后，首先只读取执行 PREWHERE 表达式所需的列。之后，再读取执行查询其余部分所需的其他列，但仅限于那些在至少某些行上 PREWHERE 表达式为 `true` 的数据块。如果存在大量数据块在所有行上 PREWHERE 表达式均为 `false`，并且 PREWHERE 所需的列比查询其他部分所需的列更少，那么在执行查询时通常可以显著减少从磁盘读取的数据量。

## 手动控制 PREWHERE \\{#controlling-prewhere-manually\\}

该子句与 `WHERE` 子句具有相同的作用。区别在于它决定从表中读取哪些数据。对于在查询中仅被少数列使用、但能够提供强过滤效果的过滤条件，可以手动将其放入 `PREWHERE` 中进行控制，从而减少需要读取的数据量。

查询中可以同时指定 `PREWHERE` 和 `WHERE`。在这种情况下，`PREWHERE` 先于 `WHERE` 执行。

如果将 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 设置为 0，则会禁用将表达式的一部分从 `WHERE` 自动移动到 `PREWHERE` 的启发式算法。

如果查询带有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符，则 `PREWHERE` 优化并不总是正确。只有在同时启用了 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 和 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) 两个设置时，才会启用该优化。

:::note    
`PREWHERE` 部分在 `FINAL` 之前执行，因此，当在不属于表 `ORDER BY` 部分的字段上使用 `PREWHERE` 时，`FROM ... FINAL` 查询的结果可能会产生偏差。
:::

## 限制 \\{#limitations\\}

`PREWHERE` 仅支持由 [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 系列表引擎创建的表。

## 示例 \\{#example\\}

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

-- let's enable tracing to see which predicate are moved to PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouse moves automatically `B = 0` to PREWHERE, but it has no sense because B is always 0.

-- Let's move other predicate `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- This query with manual `PREWHERE` processes slightly less data: 158.89 MB VS 168.89 MB
```
