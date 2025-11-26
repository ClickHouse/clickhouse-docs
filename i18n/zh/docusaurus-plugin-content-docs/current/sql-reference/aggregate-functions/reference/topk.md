---
description: '返回一个包含指定列中近似出现频率最高值的数组。结果数组按这些值的近似出现频率降序排列（而不是按值本身排序）。'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
doc_type: 'reference'
---

# topK

返回指定列中近似出现频率最高的值的数组。结果数组按这些值的近似出现频率降序排列（而不是按值本身的大小排序）。

实现了用于 TopK 分析的 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法，该算法基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 中的 reduce-and-combine 算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

此函数不保证结果完全准确。在某些情况下，可能会出现误差，返回的高频值也可能并非真正最频繁的值。

我们建议将 `N < 10` 作为取值；当 `N` 较大时性能会下降。`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素个数。可选。默认值：10。
* `load_factor` — 用于定义为存储值预留多少单元格。如果 uniq(column) &gt; N * load&#95;factor，则 topK 函数的结果将是近似值。可选。默认值：3。
* `counts` — 用于指定结果中是否应包含近似计数和误差值。

**参数说明**

* `column` — 要计算频率的列。

**示例**

使用 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，并从 `AirlineID` 列中选出出现频率最高的三个值。

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
