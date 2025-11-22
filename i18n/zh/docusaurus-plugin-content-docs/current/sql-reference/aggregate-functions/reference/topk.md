---
description: '返回一个包含指定列中近似出现频率最高值的数组。结果数组按出现频率的近似值降序排列（不是按值本身排序）。'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
doc_type: 'reference'
---

# topK

返回指定列中出现频率最高的近似值数组。结果数组按照值的近似出现频率降序排序（而不是按照值本身排序）。

实现了用于 TopK 分析的 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法，基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 中的 reduce-and-combine 算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

此函数不保证返回精确结果。在某些情况下可能会出错，并且返回的高频值可能不是最频繁的值。

建议使用 `N < 10`；`N` 较大时性能会下降。`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素个数。可选。默认值：10。
* `load_factor` — 指定为值预留的单元格数量。如果 uniq(column) &gt; N * load&#95;factor，则 topK 函数的结果将是近似值。可选。默认值：3。
* `counts` — 指定结果中是否应包含近似计数和误差值。

**参数（Arguments）**

* `column` — 要统计频率的列（值）。

**示例**

使用 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，在 `AirlineID` 列中选出最常出现的三个值。

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
