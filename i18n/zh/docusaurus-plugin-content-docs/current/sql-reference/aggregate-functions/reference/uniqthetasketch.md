---
description: '使用 Theta Sketch Framework 计算不同参数取值的近似数量。'
sidebar_position: 209
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
title: 'uniqTheta'
doc_type: 'reference'
---

使用 [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework) 计算不同参数取值的近似数量。

```sql
uniqTheta(x[, ...])
```

**参数**

该函数接受可变个数的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数值。

**实现细节**

该函数：

* 对参与聚合的所有参数计算哈希值，然后在计算中使用该哈希值。

* 使用 [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) 算法来估算不同参数取值的个数。

  使用了 4096（2^12）个 64 位 sketch。状态占用空间约为 41 KB。

* 相对误差为 3.125%（在 95% 置信水平下），详情参见[相对误差表](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)。

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
