---
'description': 'DISTINCT 子句的文档'
'sidebar_label': 'DISTINCT'
'slug': '/sql-reference/statements/select/distinct'
'title': 'DISTINCT 子句'
---


# DISTINCT 子句

如果指定了 `SELECT DISTINCT`，查询结果中只会保留唯一的行。因此，在结果中，所有完全匹配的行中只会保留一行。

您可以指定必须具有唯一值的列列表：`SELECT DISTINCT ON (column1, column2,...)`。如果未指定列，则考虑所有列。

请考虑以下表：

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

使用未指定列的 `DISTINCT`：

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

使用指定列的 `DISTINCT`：

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

请考虑以下表：

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

选择不同排序方向的数据：

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

在排序之前，第 `2` 和 `4` 行被剪切。

在编写查询时，请考虑这一实现细节。

## NULL 处理 {#null-processing}

`DISTINCT` 将 [NULL](/sql-reference/syntax#null) 视作特定值，并且 `NULL==NULL`。换句话说，在 `DISTINCT` 结果中，包含 `NULL` 的不同组合只出现一次。这与其他大多数上下文中的 `NULL` 处理有所不同。

## 替代方案 {#alternatives}

可以通过在与 `SELECT` 子句指定的相同值集合上应用 [GROUP BY](/sql-reference/statements/select/group-by)，而不使用任何聚合函数，从而获得相同的结果。但与 `GROUP BY` 方法有一些不同之处：

- `DISTINCT` 可以与 `GROUP BY` 一起使用。
- 当省略 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 并定义 [LIMIT](../../../sql-reference/statements/select/limit.md) 时，查询将在读取所需数量的不同行后立即停止运行。
- 数据块在处理时输出，而不等待整个查询完成。
