---
description: '返回一个数组，包含指定列中近似出现频率最高的值及其计数。'
sidebar_position: 107
slug: /sql-reference/aggregate-functions/reference/approxtopk
title: 'approx_top_k'
doc_type: 'reference'
---

# approx&#95;top&#95;k

返回一个数组，其中包含指定列中出现频率最高的一些值及其近似计数。结果数组按值的近似出现频率降序排列（而不是按值本身排列）。

```sql
approx_top_k(N)(列)
approx_top_k(N, reserved)(列)
```

此函数不保证结果精确。在某些情况下可能会产生误差，并且它返回的高频值可能并非真正最频繁的值。

我们建议将 `N` 设置为小于 10 的值；当 `N` 较大时，性能会下降。`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素数量。可选。默认值：10。
* `reserved` — 定义为这些值预留多少个单元格。如果 uniq(column) &gt; reserved，则 topK 函数的结果将是近似值。可选。默认值：N * 3。

**参数说明**

* `column` — 要计算频率的列。

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

是 `approx_top_k` 函数的别名。

**另请参阅**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)