---
'description': 'Returns an array of the approximately most frequent values in the
  specified column. The resulting array is sorted in descending order of approximate
  frequency of values (not by the values themselves).'
'sidebar_position': 202
'slug': '/sql-reference/aggregate-functions/reference/topk'
'title': 'topK'
---




# topK

返回指定列中大约最频繁值的数组。结果数组按值的近似频率降序排序（而不是按值本身排序）。

实现了 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法用于分析 TopK，基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 的 reduce-and-combine 算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

该函数不提供保证的结果。在某些情况下，可能会发生错误，并且它可能返回的频繁值并不是最频繁的值。

我们建议使用 `N < 10` 的值；对于较大的 `N` 值，性能会降低。最大值 `N = 65536`。

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `load_factor` — 定义为值保留的单元格数量。如果 uniq(column) > N * load_factor，topK 函数的结果将是近似的。可选。默认值：3。
- `counts` — 定义结果是否应包含近似计数和误差值。

**参数**

- `column` — 计算频率的值。

**示例**

取 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，选择 `AirlineID` 列中出现频率最高的三个值。

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
