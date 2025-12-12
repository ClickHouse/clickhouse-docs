---
description: '计算参数中不同值的近似个数。'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
doc_type: 'reference'
---

# uniq {#uniq}

计算参数中不同值的近似个数。

```sql
uniq(x[, ...])
```

**参数**

该函数的参数数量可变。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数值。

**实现细节**

函数：

* 计算聚合中所有参数的哈希值，并在后续计算中使用该哈希值。

* 使用自适应采样算法。对于计算状态，函数会维护最多 65536 个元素哈希值的样本。该算法在 CPU 上既非常精确又非常高效。当查询中包含多个此类函数时，使用 `uniq` 的速度几乎与使用其他聚合函数一样快。

* 保证结果具有确定性（不依赖于查询处理顺序）。

我们建议在几乎所有场景中使用此函数。

**另请参阅**

* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
