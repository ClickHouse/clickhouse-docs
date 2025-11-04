---
'description': '返回指定列中大约最频繁值的数组。结果数组按值的近似频率降序排列（而不是按值本身）。'
'sidebar_position': 202
'slug': '/sql-reference/aggregate-functions/reference/topk'
'title': 'topK'
'doc_type': 'reference'
---


# topK

返回指定列中大约最频繁值的数组。结果数组按值的近似频率降序排序（而不是按值本身排序）。

实现了 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法来分析 TopK，基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 的 reduce-and-combine 算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

该函数无法保证结果。在某些情况下，可能会发生错误，并返回不是最频繁的值的频繁值。

我们建议使用 `N < 10` 的值；使用较大的 `N` 值时性能会降低。`N` 的最大值为 65536。

**参数**

- `N` — 返回的元素数量。可选。默认值：10。
- `load_factor` — 定义为值保留的单元格数量。如果 uniq(column) > N * load_factor，那么 topK 函数的结果将是近似值。可选。默认值：3。
- `counts` — 定义结果是否应包含近似计数和误差值。
 
**参数**

- `column` — 计算频率的值。

**示例**

以 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集为例，选择 `AirlineID` 列中出现频率最高的三个值。

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
