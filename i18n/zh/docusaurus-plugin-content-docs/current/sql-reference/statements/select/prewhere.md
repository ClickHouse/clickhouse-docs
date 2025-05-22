
# PREWHERE 子句

Prewhere 是一种优化，旨在更高效地应用过滤。即使没有显式指定 `PREWHERE` 子句，它也默认启用。它通过自动将部分 [WHERE](../../../sql-reference/statements/select/where.md) 条件移动到 prewhere 阶段来工作。`PREWHERE` 子句的作用仅在于控制此优化，如果您认为自己比默认情况更好地执行此操作。

通过 prewhere 优化，最初只读取执行 prewhere 表达式所需的列。然后读取处理查询其余部分所需的其他列，但只读取在某些行中 prewhere 表达式为 `true` 的分块。如果存在许多在所有行中 prewhere 表达式为 `false` 的分块，并且 prewhere 所需的列比查询其他部分少，这通常允许从磁盘上读取更少的数据以执行查询。

## 手动控制 Prewhere {#controlling-prewhere-manually}

该子句与 `WHERE` 子句具有相同的含义。不同之处在于从表中读取的数据。当手动控制 `PREWHERE` 以过滤在查询中仅用于少数列的条件但提供强数据过滤时，这将减少读取的数据量。

一个查询可以同时指定 `PREWHERE` 和 `WHERE`。在这种情况下，`PREWHERE` 优先于 `WHERE`。

如果 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 设置为 0，则禁用自动将表达式的部分从 `WHERE` 移动到 `PREWHERE` 的启发式。

如果查询有 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符，则 `PREWHERE` 优化并不总是正确。只有在设置 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 和 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) 都开启的情况下，它才会启用。

:::note    
`PREWHERE` 部分在 `FINAL` 之前执行，因此在使用 `PREWHERE` 与不在表的 `ORDER BY` 部分的字段时，`FROM ... FINAL` 查询的结果可能会失真。
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
