
# quantileInterpolatedWeighted

计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)，使用线性插值，考虑每个元素的权重。

为了获得插值值，所有传入的值被组合成一个数组，然后根据它们对应的权重进行排序。然后，通过基于权重构建累积分布来执行分位数插值，接着使用权重和值进行线性插值以计算分位数。

当在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即查询的效率低于其潜在效率）。在这种情况下，使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

别名：`medianInterpolatedWeighted`。

**参数**

- `level` — 分位数级别。可选参数。取值范围为 0 到 1 的常量浮点数。我们建议使用范围在 `[0.01, 0.99]` 的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数值 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 包含序列成员权重的列。权重是值出现次数的数量。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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
