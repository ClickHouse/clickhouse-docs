---
'description': '返回指定列中大约最频繁值的数组。结果数组按值的近似频率降序排序（而不是按值本身排序）。'
'sidebar_position': 202
'slug': '/sql-reference/aggregate-functions/reference/topk'
'title': 'topK'
---


# topK

返回指定列中大约最频繁值的数组。结果数组按值的近似频率降序排序（而不是按值本身）。

实现了 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法，用于分析 TopK，基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 的 reduce-and-combine 算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

此函数不提供保证结果。在某些情况下，可能会发生错误，返回的频繁值可能不是最频繁的值。

我们建议使用 `N < 10` 的值；当 `N` 值较大时，性能会降低。最大值为 `N = 65536`。

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `load_factor` — 定义为值保留多少单元。如果 uniq(column) > N * load_factor，则 topK 函数的结果将是近似的。可选。默认值：3。
- `counts` — 定义结果是否应包含近似计数和误差值。
 
**参数**

- `column` — 要计算频率的值。

**示例**

取 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，并选择 `AirlineID` 列中最频繁出现的三个值。

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**另请参见**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
