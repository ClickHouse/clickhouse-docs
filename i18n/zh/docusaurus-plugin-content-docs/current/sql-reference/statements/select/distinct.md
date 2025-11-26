---
description: 'DISTINCT 子句参考文档'
sidebar_label: 'DISTINCT'
slug: /sql-reference/statements/select/distinct
title: 'DISTINCT 子句'
doc_type: 'reference'
---



# DISTINCT 子句

如果指定了 `SELECT DISTINCT`，查询结果中只会保留唯一的行。也就是说，在所有完全相同的行集合中，最终结果每组只会保留一行。

可以指定必须具有唯一值的列列表：`SELECT DISTINCT ON (column1, column2,...)`。如果未指定列，则默认使用所有列。

考虑如下表：

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

在不指定列的情况下使用 `DISTINCT`：

```sql
SELECT DISTINCT * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

对指定列使用 `DISTINCT`：

```sql
SELECT DISTINCT ON (a,b) * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```


## DISTINCT 和 ORDER BY

ClickHouse 支持在单个查询中对不同的列分别使用 `DISTINCT` 和 `ORDER BY` 子句。`DISTINCT` 子句会先于 `ORDER BY` 子句执行。

请看如下数据表：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

选择数据：

```sql
SELECT DISTINCT a FROM t1 ORDER BY b ASC;
```

```text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```

按不同的排序方向选择数据：

```sql
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

```text
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

在排序之前，第 `2, 4` 行就被删除了。

在编写查询时请将这一实现特性考虑在内。


## NULL 处理 {#null-processing}

`DISTINCT` 与 [NULL](/sql-reference/syntax#null) 的行为就好像 `NULL` 是一个具体的值，并且 `NULL==NULL`。换句话说，在 `DISTINCT` 的结果中，包含 `NULL` 的不同组合只会出现一次。这与大多数其他上下文中的 `NULL` 处理方式不同。



## 替代方案 {#alternatives}

也可以在不使用任何聚合函数的情况下，对 `SELECT` 子句中指定的同一组值使用 [GROUP BY](/sql-reference/statements/select/group-by)，从而获得相同的结果。但与基于 `GROUP BY` 的方式相比，仍存在一些差异：

- `DISTINCT` 可以与 `GROUP BY` 一起使用。
- 当省略 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 且指定了 [LIMIT](../../../sql-reference/statements/select/limit.md) 时，在读取到所需数量的不同结果行后，查询会立刻停止运行。
- 数据块在处理的同时就会被输出，而无需等待整个查询运行结束。
