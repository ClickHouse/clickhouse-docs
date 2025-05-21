---
'description': 'Computes an approximate quantile of a numeric data sequence.'
'sidebar_position': 170
'slug': '/sql-reference/aggregate-functions/reference/quantile'
'title': 'quantile'
---




# quantile

计算数值数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。

该函数使用 [水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，最大水库大小为 8192，并使用随机数生成器进行抽样。结果是非确定性的。要获取精确的分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，该查询的效率低于预期）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

请注意，对于空的数值序列，`quantile` 将返回 NaN，但其 `quantile*` 变体将返回 NaN 或序列类型的默认值，具体取决于变体。

**语法**

```sql
quantile(level)(expr)
```

别名：`median`。

**参数**

- `level` — 分位数的级别。可选参数。0 到 1 之间的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数值 [数据类型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date) 或 [DateTime](/sql-reference/data-types/datetime)。

**返回值**

- 指定级别的近似分位数。

类型：

- 数值数据类型输入的 [Float64](/sql-reference/data-types/float)。
- 如果输入值具有 `Date` 类型，则为 [Date](/sql-reference/data-types/date)。
- 如果输入值具有 `DateTime` 类型，则为 [DateTime](/sql-reference/data-types/datetime)。

**示例**

输入表：

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

查询：

```sql
SELECT quantile(val) FROM t
```

结果：

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**另请参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
