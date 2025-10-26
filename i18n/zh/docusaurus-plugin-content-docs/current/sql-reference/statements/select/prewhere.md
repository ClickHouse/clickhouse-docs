---
'description': '关于 PREWHERE 子句的文档'
'sidebar_label': 'PREWHERE'
'slug': '/sql-reference/statements/select/prewhere'
'title': 'PREWHERE 子句'
'doc_type': 'reference'
---


# PREWHERE子句

Prewhere是一种优化，用于更有效地应用过滤。即使未显式指定`PREWHERE`子句，它默认为启用状态。它的工作原理是自动将部分[WHERE](../../../sql-reference/statements/select/where.md)条件移动到prewhere阶段。`PREWHERE`子句的作用仅是控制这种优化，如果你认为自己知道如何比默认情况更好地处理它。

通过prewhere优化，最初仅读取执行prewhere表达式所需的列。然后读取其他列，以运行查询的其余部分，但仅限于那些在某些行中prewhere表达式为`true`的区块。如果存在许多区块，其中所有行的prewhere表达式均为`false`，并且prewhere所需的列少于查询的其他部分，这通常允许从磁盘中读取更少的数据以执行查询。

## 手动控制Prewhere {#controlling-prewhere-manually}

该子句的含义与`WHERE`子句相同。区别在于从表中读取的数据。当手动控制`PREWHERE`时，针对查询中仅使用少数列的过滤条件，但提供强大的数据过滤。这减少了要读取的数据量。

一个查询可以同时指定`PREWHERE`和`WHERE`。在这种情况下，`PREWHERE`优先于`WHERE`。

如果[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)设置为0，则禁用自动将表达式部分从`WHERE`移动到`PREWHERE`的启发式。

如果查询具有[FINAL](/sql-reference/statements/select/from#final-modifier)修饰符，则`PREWHERE`优化并不总是正确的。只有在同时启用设置[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)和[optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)时才会启用。

:::note    
`PREWHERE`部分在`FINAL`之前执行，因此在使用不在表的`ORDER BY`部分中的字段的`FROM ... FINAL`查询时，结果可能会偏斜。
:::

## 限制 {#limitations}

`PREWHERE`仅支持来自[*MergeTree](../../../engines/table-engines/mergetree-family/index.md)家族的表。

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
