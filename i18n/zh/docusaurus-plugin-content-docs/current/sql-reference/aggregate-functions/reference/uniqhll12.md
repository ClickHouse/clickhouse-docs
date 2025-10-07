---
'description': '使用 HyperLogLog 算法计算不同参数值的近似数量。'
'sidebar_position': 208
'slug': '/sql-reference/aggregate-functions/reference/uniqhll12'
'title': 'uniqHLL12'
'doc_type': 'reference'
---


# uniqHLL12

计算不同参数值的近似数量，使用 [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 算法。

```sql
uniqHLL12(x[, ...])
```

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

函数：

- 为聚合中的所有参数计算哈希，然后在计算中使用它。

- 使用 HyperLogLog 算法来近似不同参数值的数量。

        使用 2^12 个 5 位单元格。状态的大小略大于 2.5 KB。对于小数据集（&lt;10K 元素），结果的准确性不是很高（误差可达 ~10%）。然而，对于高基数数据集（10K-100M），结果相当准确，最大误差为 ~1.6%。从 100M 开始，估计误差会增加，对于具有极高基数的数据集（1B+ 元素），函数会返回非常不准确的结果。

- 提供确定性结果（不依赖于查询处理顺序）。

我们不建议使用此函数。在大多数情况下，请使用 [uniq](/sql-reference/aggregate-functions/reference/uniq) 或 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 函数。

**另请参阅**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
