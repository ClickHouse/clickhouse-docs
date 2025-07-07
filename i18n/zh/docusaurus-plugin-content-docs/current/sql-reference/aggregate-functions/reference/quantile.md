---
'description': '计算数值数据序列的近似分位数。'
'sidebar_position': 170
'slug': '/sql-reference/aggregate-functions/reference/quantile'
'title': 'quantile'
---


# quantile

计算数字数据序列的近似 [quantile](https://en.wikipedia.org/wiki/Quantile)。

该函数使用 [reservoir sampling](https://en.wikipedia.org/wiki/Reservoir_sampling)，其水槽大小最大为 8192，并使用随机数生成器进行采样。结果是非确定性的。要获得精确的分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率低于预期）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

请注意，对于空的数字序列，`quantile` 将返回 NaN，但其 `quantile*` 变体将根据变体返回 NaN 或序列类型的默认值。

**语法**

```sql
quantile(level)(expr)
```

别名：`median`。

**参数**

- `level` — 分位数的级别。可选参数。介于 0 到 1 之间的常量浮点数。我们建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值：0.5。在 `level=0.5` 时，该函数计算 [median](https://en.wikipedia.org/wiki/Median)。
- `expr` — 基于列值的表达式，结果为数字 [data types](/sql-reference/data-types)、[Date](/sql-reference/data-types/date) 或 [DateTime](/sql-reference/data-types/datetime)。

**返回值**

- 指定级别的近似分位数。

类型：

- [Float64](/sql-reference/data-types/float) 适用于数字数据类型输入。
- [Date](/sql-reference/data-types/date) 如果输入值为 `Date` 类型。
- [DateTime](/sql-reference/data-types/datetime) 如果输入值为 `DateTime` 类型。

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

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
