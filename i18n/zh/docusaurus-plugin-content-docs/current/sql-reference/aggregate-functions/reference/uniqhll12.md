---
description: '使用 HyperLogLog 算法近似计算不同参数值的数量。'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
doc_type: 'reference'
---

# uniqHLL12

使用 [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 算法计算不同参数取值的近似数量。

```sql
uniqHLL12(x[, ...])
```

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数值。

**实现细节**

函数：

* 对聚合中的所有参数计算哈希值，然后在计算中使用该哈希值。

* 使用 HyperLogLog 算法来近似估算不同参数取值的数量。

  使用 2^12 个 5 位单元。状态大小略大于 2.5 KB。对于较小数据集（&lt;10K 个元素），结果不够精确（误差可达约 10%）。但对于高基数数据集（10K-100M），结果相当精确，最大误差约为 1.6%。从 100M 起，估算误差会增大，对于基数极高的数据集（1B+ 个元素），函数将返回非常不准确的结果。

* 提供确定性的结果（不依赖于查询处理顺序）。

不推荐使用该函数。在大多数情况下，请使用 [uniq](/sql-reference/aggregate-functions/reference/uniq) 或 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 函数。

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
