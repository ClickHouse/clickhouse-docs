---
description: '使用 heavy hitters 算法选择一个高频出现的值。
  如果在每个查询执行线程中都存在一个值，在超过一半的记录中出现，则返回该值。通常情况下，结果是不确定的。'
sidebar_position: 104
slug: /sql-reference/aggregate-functions/reference/anyheavy
title: 'anyHeavy'
doc_type: 'reference'
---

# anyHeavy

使用 [heavy hitters](https://doi.org/10.1145/762471.762473) 算法选取一个出现频率较高的值。\
如果在查询的每个执行线程中，都存在某个值在超过一半的情况下出现，则返回该值。通常情况下，该结果是不确定的。

```sql
anyHeavy(column)
```

**参数**

* `column` – 列名。

**示例**

以 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集为例，在 `AirlineID` 列中选择任意一个高频出现的值。

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
