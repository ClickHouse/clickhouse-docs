---
'description': '返回指定列中大约最频繁的值及其计数的数组。'
'sidebar_position': 107
'slug': '/sql-reference/aggregate-functions/reference/approxtopk'
'title': 'approx_top_k'
---


# approx_top_k

返回指定列中大约出现最频繁值及其计数的数组。结果数组按值的近似频率降序排序（而不是按值本身）。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

此函数不提供保证的结果。在某些情况下，可能会发生错误，并可能返回并非最频繁的值。

我们建议使用`N < 10`的值；随着`N`值的增大，性能会下降。`N`的最大值为65536。

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `reserved` — 定义为值保留的单元格数。如果 uniq(column) > reserved，则 topK 函数的结果将是近似的。可选。默认值：N * 3。
 
**参数**

- `column` — 计算频率的值。

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

是`approx_top_k`函数的别名。

**另见**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
