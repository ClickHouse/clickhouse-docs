---
'description': 'Calculates the approximate number of different argument values, using
  the HyperLogLog algorithm.'
'sidebar_position': 208
'slug': '/sql-reference/aggregate-functions/reference/uniqhll12'
'title': 'uniqHLL12'
---




# uniqHLL12

计算不同参数值的近似数量，使用[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)算法。

```sql
uniqHLL12(x[, ...])
```

**参数**

该函数接受可变数量的参数。参数可以是`Tuple`、`Array`、`Date`、`DateTime`、`String`或数字类型。

**返回值**

- 一个[UInt64](../../../sql-reference/data-types/int-uint.md)类型的数字。

**实现细节**

函数：

- 为所有聚合中的参数计算哈希值，然后在计算中使用它。

- 使用HyperLogLog算法近似不同参数值的数量。

        使用了2^12个5位单元。状态的大小稍微超过2.5 KB。对于小数据集（&lt;10K元素），结果不是非常准确（误差高达~10%）。然而，对于高基数数据集（10K-100M），结果相当准确，最大误差约为~1.6%。从100M开始，估算误差增加，对于基数极高的数据集（1B+元素），该函数将返回非常不准确的结果。

- 提供确定性结果（不依赖于查询处理顺序）。

我们不推荐使用此函数。在大多数情况下，请使用[uniq](/sql-reference/aggregate-functions/reference/uniq)或[uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)函数。

**另请参见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
