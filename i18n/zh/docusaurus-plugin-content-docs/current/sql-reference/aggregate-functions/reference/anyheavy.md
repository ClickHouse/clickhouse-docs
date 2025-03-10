---
slug: /sql-reference/aggregate-functions/reference/anyheavy
sidebar_position: 104
title: 'anyHeavy'
description: '使用重头算法选择一个频繁出现的值。如果在查询的每个执行线程中，有一个值出现的次数超过一半，则返回该值。通常，结果是非确定性的。'
---


# anyHeavy

使用 [重头](https://doi.org/10.1145/762471.762473) 算法选择一个频繁出现的值。如果在查询的每个执行线程中，有一个值出现的次数超过一半，则返回该值。通常，结果是非确定性的。

``` sql
anyHeavy(column)
```

**参数**

- `column` – 列名。

**示例**

以 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集为例，选择 `AirlineID` 列中任何一个频繁出现的值。

``` sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

``` text
┌───res─┐
│ 19690 │
└───────┘
```
