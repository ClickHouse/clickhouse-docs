---
'description': '计算数值数据序列的分位数，使用线性插值，同时考虑每个元素的权重。'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted'
'title': 'quantileInterpolatedWeighted'
---


# quantileInterpolatedWeighted

计算数值数据序列的 [quantile](https://en.wikipedia.org/wiki/Quantile)，使用线性插值，考虑每个元素的权重。

为了获取插值，所有传递的值被组合成一个数组，然后根据它们相应的权重进行排序。量化插值接着使用 [weighted percentile method](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) 通过基于权重构建累积分布，然后使用权重和数值进行线性插值来计算分位数。

当在查询中使用多个不同层级的 `quantile*` 函数时，内部状态不会结合（也就是说，该查询的工作效率不如应有的高效）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

别名: `medianInterpolatedWeighted`.

**参数**

- `level` — 分位数的层级。可选参数。范围从0到1的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [median](https://en.wikipedia.org/wiki/Median)。
- `expr` — 对列值的表达式，结果为数值 [data types](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是值出现的次数。

**返回值**

- 指定层级的分位数。

类型：

- 对于数值数据类型输入为 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表：

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

查询：

```sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

结果：

```text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
