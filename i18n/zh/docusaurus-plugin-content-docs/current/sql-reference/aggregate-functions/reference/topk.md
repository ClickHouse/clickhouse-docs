
# topK

返回指定列中大约最频繁值的数组。结果数组按值的近似频率降序排列（而不是按值本身）。

实现了 [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 算法来分析 TopK，基于 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 中的归约和组合算法。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

此函数不提供保证的结果。在某些情况下，可能会发生错误，并且可能返回不是最频繁值的频繁值。

我们建议使用 `N < 10` 的值；对于较大的 `N` 值，性能会降低。最大值为 `N = 65536`。

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `load_factor` — 定义为值保留多少单元格。如果 uniq(column) > N * load_factor，topK 函数的结果将是近似的。可选。默认值：3。
- `counts` — 定义结果是否应包含近似计数和误差值。

**参数**

- `column` — 计算频率的值。

**示例**

使用 [OnTime](../../../getting-started/example-datasets/ontime.md) 数据集，选择 `AirlineID` 列中出现最频繁的三个值。

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**参见**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
