---
slug: /sql-reference/statements/select/distinct
sidebar_label: 'DISTINCT'
---


# DISTINCT 子句

如果指定了 `SELECT DISTINCT`，查询结果中只会保留唯一的行。这样，所有完全匹配的行中只会保留一行。

您可以指定必须具有唯一值的列列表：`SELECT DISTINCT ON (column1, column2,...)`。如果未指定列，则所有列都会被考虑在内。

考虑以下表：

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

使用 `DISTINCT` 而不指定列：

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

使用 `DISTINCT` 并指定列：

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

## DISTINCT 和 ORDER BY {#distinct-and-order-by}

ClickHouse 支持在一个查询中对不同列使用 `DISTINCT` 和 `ORDER BY` 子句。`DISTINCT` 子句在 `ORDER BY` 子句之前执行。

考虑以下表：

``` text
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

``` text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```
使用不同的排序方向选择数据：

```sql
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

``` text
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

行 `2, 4` 在排序前已被截取。

在编写查询时请考虑这一实现特性。

## NULL 处理 {#null-processing}

`DISTINCT` 处理 [NULL](/sql-reference/syntax#null) 的方式就像 `NULL` 是一个特定值，并且 `NULL==NULL`。换句话说，在 `DISTINCT` 结果中，与 `NULL` 的不同组合只会出现一次。这与大多数其他上下文中的 `NULL` 处理有所不同。

## 替代方法 {#alternatives}

可以通过在与 `SELECT` 子句中指定的相同值集合上应用 [GROUP BY](/sql-reference/statements/select/group-by) 来获得相同的结果，而不使用任何聚合函数。但与 `GROUP BY` 方法有一些不同之处：

- `DISTINCT` 可以与 `GROUP BY` 一起使用。
- 当省略 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 而定义了 [LIMIT](../../../sql-reference/statements/select/limit.md) 时，查询在读取到所需数量的不同行后会立即停止运行。
- 数据块会在处理时输出，而无需等待整个查询完成运行。
