---
'description': 'PREWHERE 子句的文档'
'sidebar_label': 'PREWHERE'
'slug': '/sql-reference/statements/select/prewhere'
'title': 'PREWHERE 子句'
---


# PREWHERE 子句

PREWHERE 是一种优化，用于更有效地应用过滤条件。即使未显式指定 `PREWHERE` 子句，它也是默认启用的。它通过自动将部分 [WHERE](../../../sql-reference/statements/select/where.md) 条件移到预处理阶段来工作。`PREWHERE` 子句的作用仅在于控制此优化，如果您认为自己可以比默认情况做得更好。

通过预处理优化，首先仅读取执行预处理表达式所需的列。然后读取进行其余查询所需的其他列，但仅读取预处理表达式在某些行中为 `true` 的那些块。如果存在许多预处理表达式在所有行中为 `false` 的块，并且预处理所需的列少于查询其他部分所需的列，这通常允许从磁盘读取更少的数据以执行查询。

## 手动控制 PREWHERE {#controlling-prewhere-manually}

该子句的含义与 `WHERE` 子句相同。区别在于从表中读取哪些数据。当手动控制 `PREWHERE` 以过滤查询中少数列使用的条件，但提供强大的数据过滤时。这样可以减少读取的数据量。

查询可以同时指定 `PREWHERE` 和 `WHERE`。在这种情况下，`PREWHERE` 的优先级高于 `WHERE`。

如果 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 设置为 0，则禁用从 `WHERE` 自动移动表达式部分到 `PREWHERE` 的启发式操作。

如果查询具有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符，则 `PREWHERE` 优化并不总是正确。如果要启用它，则必须同时开启设置 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 和 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)。

:::note    
`PREWHERE` 部分在 `FINAL` 之前执行，因此在使用不在表的 `ORDER BY` 部分的字段时，`FROM ... FINAL` 查询的结果可能会失真。
:::

## 限制 {#limitations}

`PREWHERE` 仅支持 [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 家族的表。

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
