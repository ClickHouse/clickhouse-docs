
# quantileExactWeightedInterpolated

计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，使用线性插值，并考虑每个元素的权重。

为了获取插值结果，所有传入的值被组合成一个数组，然后按照相应的权重进行排序。分位数插值是通过基于权重构建累积分布，然后使用权重和数值执行线性插值来计算分位数，使用[加权百分位法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)进行。

在查询中使用多个具有不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率低于可能的效率）。在这种情况下，请使用[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

我们强烈建议使用 `quantileExactWeightedInterpolated` 而不是 `quantileInterpolatedWeighted`，因为 `quantileExactWeightedInterpolated` 的精度更高。以下是一个示例：

```sql
SELECT
    quantileExactWeightedInterpolated(0.99)(number, 1),
    quantile(0.99)(number),
    quantileInterpolatedWeighted(0.99)(number, 1)
FROM numbers(9)


┌─quantileExactWeightedInterpolated(0.99)(number, 1)─┬─quantile(0.99)(number)─┬─quantileInterpolatedWeighted(0.99)(number, 1)─┐
│                                               7.92 │                   7.92 │                                             8 │
└────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────────────────────────┘
```

**语法**

```sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

别名：`medianExactWeightedInterpolated`。

**参数**

- `level` — 分位数级别。可选参数。从 0 到 1 的常量浮点数。我们建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值：0.5。在 `level=0.5` 时，这个函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 对列值的表达式，结果为数值[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是值出现次数的[无符号整数类型](../../../sql-reference/data-types/int-uint.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入，返回[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，返回[DateTime](../../../sql-reference/data-types/datetime.md)。

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

结果：

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
