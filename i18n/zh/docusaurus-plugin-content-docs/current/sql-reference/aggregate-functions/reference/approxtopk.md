---
'description': '返回指定列中大致出现频率最高的值及其计数的数组。'
'sidebar_position': 107
'slug': '/sql-reference/aggregate-functions/reference/approxtopk'
'title': 'approx_top_k'
---




# approx_top_k

返回指定列中大致最常见值及其计数的数组。结果数组按值的近似频率降序排列（而不是按值本身）。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

此函数不能保证结果。在某些情况下，可能会出现错误，并返回不是最常见值的频繁值。

我们建议使用 `N < 10` 的值；使用较大的 `N` 值时，性能会下降。`N` 的最大值为 65536。

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `reserved` — 定义为值保留多少单元格。如果 uniq(column) > reserved，topK 函数的结果将是近似值。可选。默认值：N * 3。

**参数**

- `column` — 要计算频率的值。

**示例**

查询：

```sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

结果：

```text
┌─approx_top_k(2)(k)────┐
│ [('y',3,0),('x',1,0)] │
└───────────────────────┘
```


# approx_top_count

是 `approx_top_k` 函数的别名

**参见**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
