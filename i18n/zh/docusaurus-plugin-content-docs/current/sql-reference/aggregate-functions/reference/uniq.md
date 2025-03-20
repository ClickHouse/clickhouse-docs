---
slug: /sql-reference/aggregate-functions/reference/uniq
sidebar_position: 204
title: 'uniq'
description: '计算参数的不同值的近似数量。'
---


# uniq

计算参数的不同值的近似数量。

``` sql
uniq(x[, ...])
```

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数字类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

函数：

- 为聚合中的所有参数计算哈希值，然后在计算中使用它。

- 使用自适应抽样算法。在计算状态下，该函数使用最多 65536 个元素哈希值的样本。该算法非常精确，并且在 CPU 上效率很高。当查询包含多个这些函数时，使用 `uniq` 几乎和使用其他聚合函数一样快。

- 提供确定性的结果（不依赖于查询处理顺序）。

我们建议在几乎所有场景中使用这个函数。

**另请参阅**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
