---
description: 'DISTINCT 子句文档'
sidebar_label: 'DISTINCT'
slug: /sql-reference/statements/select/distinct
title: 'DISTINCT 子句'
doc_type: 'reference'
---



# DISTINCT 子句

如果指定了 `SELECT DISTINCT`，查询结果中只会保留唯一的行。也就是说，在结果中，每一组完全相同的行中只会保留一行。

可以指定必须具有唯一值的列表达式：`SELECT DISTINCT ON (column1, column2,...)`。如果未指定任何列，则默认会考虑所有列。

考虑下列表：

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

在指定列上使用 `DISTINCT`：

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


## DISTINCT 与 ORDER BY {#distinct-and-order-by}

ClickHouse 支持在一个查询中对不同列使用 `DISTINCT` 和 `ORDER BY` 子句。`DISTINCT` 子句在 `ORDER BY` 子句之前执行。

考虑以下表:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

查询数据:

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

使用不同排序方向查询数据:

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

行 `2, 4` 在排序前被过滤。

编写查询时需要考虑这一实现特性。


## NULL 值处理 {#null-processing}

`DISTINCT` 将 [NULL](/sql-reference/syntax#null) 视为特定值来处理,即 `NULL==NULL`。换句话说,在 `DISTINCT` 结果中,包含 `NULL` 的不同组合仅出现一次。这与大多数其他上下文中 `NULL` 的处理方式不同。


## 替代方案 {#alternatives}

可以通过对 `SELECT` 子句中指定的同一组值应用 [GROUP BY](/sql-reference/statements/select/group-by) 来获得相同的结果,而无需使用任何聚合函数。但与 `GROUP BY` 方法相比存在以下几点差异:

- `DISTINCT` 可以与 `GROUP BY` 一起使用。
- 当省略 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 并定义了 [LIMIT](../../../sql-reference/statements/select/limit.md) 时,查询会在读取到所需数量的不同行后立即停止执行。
- 数据块在处理过程中即时输出,无需等待整个查询执行完成。
