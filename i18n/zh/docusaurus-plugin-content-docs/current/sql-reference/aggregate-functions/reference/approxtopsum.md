---
'description': '返回指定列中大约最频繁的值及其计数的数组。'
'sidebar_position': 108
'slug': '/sql-reference/aggregate-functions/reference/approxtopsum'
'title': 'approx_top_sum'
---


# approx_top_sum

返回指定列中大约最频繁值及其计数的数组。结果数组按值的近似频率降序排列（而不是按值本身）。此外，还考虑了值的权重。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

此函数不提供保证结果。在某些情况下，可能会发生错误，并可能返回不是最频繁值的频繁值。

我们建议使用 `N < 10` 的值；使用较大的 `N` 值时性能会降低。最大值为 `N = 65536`。

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `reserved` — 定义为值保留的单元格数量。如果 uniq(column) > reserved，topK 函数的结果将是近似的。可选。默认值：N * 3。

**参数说明**

- `column` — 用于计算频率的值。
- `weight` — 权重。每个值在频率计算中被计算 `weight` 次。 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

结果：

```text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**另请参阅**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
