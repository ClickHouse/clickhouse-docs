---
description: '返回一个包含指定列中近似出现频率最高值的数组。结果数组按这些值的近似出现频率降序排列（而不是按值本身排序）。'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
doc_type: 'reference'
---

# topK {#topk}

返回一个数组，其中包含指定列中近似最常出现的值。结果数组按这些值的近似出现频率降序排序（而不是按值本身排序）。

实现了用于计算 TopK 的 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法，基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 中的 reduce-and-combine 算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

此函数不保证结果是精确的。在某些情况下，可能会产生误差，并且可能返回的一些高频值并不是最频繁的值。

`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素数量。可选。默认值：10。
* `load_factor` — 定义为值预留多少单元格。如果 `uniq(column) > N * load_factor`，则 `topK` 函数的结果将是近似值。可选。默认值：3。
* `counts` — 定义结果中是否应包含近似计数和误差值。

**参数**

* `column` — 要计算频率的值。

**示例**

使用 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，并在 `AirlineID` 列中选择出现频率最高的三个值。

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**另请参阅**

* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
