---
description: '计算参数中不同取值的近似数量。'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
doc_type: 'reference'
---

# uniq

计算参数中不同值的近似个数。

```sql
uniq(x[, ...])
```

**参数**

该函数接受可变个数的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数值。

**实现细节**

函数：

* 对聚合中的所有参数计算哈希值，然后在计算中使用该哈希值。

* 使用自适应采样算法。在计算状态中，函数使用由最多 65536 个元素哈希值组成的样本。该算法在 CPU 上非常精确且高效。当查询中包含多个此类函数时，使用 `uniq` 的速度几乎与其他聚合函数一样快。

* 以确定性的方式提供结果（结果不依赖于查询处理顺序）。

我们建议在几乎所有场景中使用此函数。

**另请参阅**

* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
