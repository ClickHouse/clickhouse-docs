---
'description': '使用线性插值计算数值数据序列的分位数，考虑每个元素的权重。'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted'
'title': 'quantileInterpolatedWeighted'
'doc_type': 'reference'
---


# quantileInterpolatedWeighted

计算使用线性插值的数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)，考虑每个元素的权重。

为了获得插值结果，将所有传入的值组合成一个数组，然后根据它们对应的权重进行排序。然后使用 [加权百分位法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) 进行分位数插值，通过基于权重构建累积分布，然后使用权重和数值进行线性插值以计算分位数。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，该查询的效率比可能更低）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

别名：`medianInterpolatedWeighted`。

**参数**

- `level` — 分位数等级。可选参数。0 到 1 的常量浮点数。我们建议使用的 `level` 值范围为 `[0.01, 0.99]`。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 基于列值的表达式，结果为数值 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员权重的列。权重是值出现的次数。

**返回值**

- 指定级别的分位数。

类型：

- 输入为数值数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 输入值具有 `Date` 类型时为 [Date](../../../sql-reference/data-types/date.md)。
- 输入值具有 `DateTime` 类型时为 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另请参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
