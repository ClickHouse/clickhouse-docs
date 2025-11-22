---
description: 'PREWHERE 子句文档'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'PREWHERE 子句'
doc_type: 'reference'
---



# PREWHERE 子句

Prewhere 是一种用于更高效执行过滤操作的优化机制。即使没有显式指定 `PREWHERE` 子句，该优化默认也是启用的。它的工作方式是自动将部分 [WHERE](../../../sql-reference/statements/select/where.md) 条件移动到 prewhere 阶段。`PREWHERE` 子句的作用只是用于在你认为自己比默认行为更了解如何进行该优化时，对这一优化进行控制。

在使用 prewhere 优化时，首先只读取执行 prewhere 表达式所必需的列。然后再读取执行查询其余部分所需的其他列，但仅限于那些 prewhere 表达式在至少某些行上为 `true` 的数据块。如果有大量数据块中 prewhere 表达式对所有行都为 `false`，并且 prewhere 所需的列比查询其他部分所需的列更少，这通常可以在查询执行时显著减少从磁盘读取的数据量。



## 手动控制 Prewhere {#controlling-prewhere-manually}

该子句与 `WHERE` 子句具有相同的含义。区别在于从表中读取哪些数据。当手动控制 `PREWHERE` 用于查询中仅涉及少数列的过滤条件,但这些条件能提供强大的数据过滤效果时,可以减少需要读取的数据量。

查询可以同时指定 `PREWHERE` 和 `WHERE`。在这种情况下,`PREWHERE` 先于 `WHERE` 执行。

如果将 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 设置为 0,则会禁用自动将表达式部分从 `WHERE` 移动到 `PREWHERE` 的启发式优化。

如果查询包含 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符,`PREWHERE` 优化并不总是正确的。只有当 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 和 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) 两个设置都启用时,该优化才会生效。

:::note  
`PREWHERE` 部分在 `FINAL` 之前执行,因此当使用 `PREWHERE` 处理不在表的 `ORDER BY` 部分中的字段时,`FROM ... FINAL` 查询的结果可能会出现偏差。
:::


## 限制 {#limitations}

`PREWHERE` 仅支持 [\*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 系列的表。


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

-- 启用跟踪以查看哪些谓词被移动到 PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE
-- ClickHouse 自动将 `B = 0` 移动到 PREWHERE,但这没有意义,因为 B 始终为 0。

-- 让我们移动另一个谓词 `C = 'x'`

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- 使用手动 `PREWHERE` 的此查询处理的数据略少:158.89 MB 对比 168.89 MB
```
