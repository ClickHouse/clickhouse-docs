---
'description': 'Documentation for PREWHERE Clause'
'sidebar_label': 'PREWHERE'
'slug': '/sql-reference/statements/select/prewhere'
'title': 'PREWHERE Clause'
---




# PREWHERE 子句

Prewhere 是一种优化，用于更有效地应用过滤。即使没有显式指定 `PREWHERE` 子句，它也默认启用。它的工作原理是自动将部分 [WHERE](../../../sql-reference/statements/select/where.md) 条件移至 prewhere 阶段。`PREWHERE` 子句的作用只是控制这一优化，如果您认为您知道如何比默认情况做得更好。

在 prewhere 优化中，初始阶段仅读取执行 prewhere 表达式所需的列。接下来，读取剩余查询所需的其他列，但仅限于那些在某些行上 `prewhere` 表达式为 `true` 的块。如果有很多块在所有行上 `prewhere` 表达式为 `false` ，并且 prewhere 所需的列少于查询的其他部分，这通常可以减少查询执行时从磁盘读取的数据量。

## 手动控制 Prewhere {#controlling-prewhere-manually}

该子句与 `WHERE` 子句具有相同的含义。区别在于从表中读取的数据。在手动控制 `PREWHERE` 以过滤条件时，这些条件只被查询中的少数列使用，但能够提供强有力的数据过滤。这减少了要读取的数据量。

一个查询可以同时指定 `PREWHERE` 和 `WHERE`。在这种情况下，`PREWHERE` 优先于 `WHERE`。

如果 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 设置为 0，则自动将表达式的部分从 `WHERE` 移至 `PREWHERE` 的启发式算法将被禁用。

如果查询具有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符，则 `PREWHERE` 优化并不总是正确。它仅在 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 和 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) 两个设置都开启时启用。

:::note    
`PREWHERE` 部分在 `FINAL` 之前执行，因此当使用 `PREWHERE` 和不在表的 `ORDER BY` 部分中的字段时，`FROM ... FINAL` 查询的结果可能会受到影响。
:::

## 限制 {#limitations}

`PREWHERE` 仅支持来自 [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 系列的表。

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
