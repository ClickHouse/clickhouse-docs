---
'description': '使用 t-digest 算法计算数值数据序列的近似分位数。'
'sidebar_position': 179
'slug': '/sql-reference/aggregate-functions/reference/quantiletdigestweighted'
'title': 'quantileTDigestWeighted'
'doc_type': 'reference'
---


# quantileTDigestWeighted

使用[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)算法计算数值数据序列的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。该函数考虑了每个序列成员的权重。最大错误为1%。内存消耗为`log(n)`，其中`n`是值的数量。

该函数的性能低于[quantile](/sql-reference/aggregate-functions/reference/quantile)或[quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)的性能。在状态大小与精度的比率方面，该函数比`quantile`要好得多。

结果依赖于查询的执行顺序，并且是非确定性的。

在查询中使用多个不同层级的`quantile*`函数时，内部状态不会被组合（即，查询的效率低于可能的效率）。在这种情况下，请使用[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)函数。

:::note    
使用`quantileTDigestWeighted` [不推荐用于小型数据集](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)，并可能导致显著误差。在这种情况下，请考虑使用[`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)。
:::

**语法**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

别名：`medianTDigestWeighted`。

**参数**

- `level` — 分位数层级。可选参数。范围从0到1的常量浮点数。推荐使用`level`值在`[0.01, 0.99]`范围内。默认值：0.5。在`level=0.5`时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数值[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 带有序列元素权重的列。权重是值出现的次数。

**返回值**

- 指定层级的近似分位数。

类型：

- 对于数值数据类型输入，返回[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为`Date`类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为`DateTime`类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

结果：

```text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
