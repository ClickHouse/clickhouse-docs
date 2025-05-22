
# DISTINCT 子句

如果指定了 `SELECT DISTINCT`，查询结果中将只保留唯一行。因此，在结果中，所有完全匹配的行集将只剩下一行。

您可以指定必须具有唯一值的列列表：`SELECT DISTINCT ON (column1, column2,...)`。如果未指定列，则所有列均被考虑在内。

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

在未指定列的情况下使用 `DISTINCT`：

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

在指定列的情况下使用 `DISTINCT`：

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
选择具有不同排序方向的数据：

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

行 `2, 4` 在排序之前被裁剪。

在编写查询时，请考虑此实现特性。

## 空值处理 {#null-processing}

`DISTINCT` 对 [NULL](/sql-reference/syntax#null) 的处理方式就像 `NULL` 是一个特定值，并且 `NULL==NULL`。换句话说，在 `DISTINCT` 结果中，包含 `NULL` 的不同组合只出现一次。这与大多数其他上下文中的 `NULL` 处理有所不同。

## 替代方案 {#alternatives}

通过对与 `SELECT` 子句中指定的相同值集应用 [GROUP BY](/sql-reference/statements/select/group-by)，而无需使用任何聚合函数，也可以得到相同的结果。但与 `GROUP BY` 方法有几个不同之处：

- `DISTINCT` 可以与 `GROUP BY` 一起应用。
- 当省略 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 并且定义了 [LIMIT](../../../sql-reference/statements/select/limit.md) 时，查询在读取所需数量的不同行后立即停止运行。
- 数据块在处理时直接输出，而不等待整个查询完成。
