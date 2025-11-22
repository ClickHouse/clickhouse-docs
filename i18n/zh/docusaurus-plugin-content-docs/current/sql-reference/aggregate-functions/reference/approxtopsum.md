---
description: '返回指定列中出现频率最高的值及其计数的近似数组。'
sidebar_position: 108
slug: /sql-reference/aggregate-functions/reference/approxtopsum
title: 'approx_top_sum'
doc_type: 'reference'
---

# approx&#95;top&#95;sum

返回一个数组，其中包含指定列中近似出现频率最高的值及其计数。结果数组按值的近似出现频率降序排序（而不是按值本身排序)。同时还会考虑每个值的权重。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

此函数不保证结果精确。在某些情况下可能会出现误差，并且可能返回的一些高频值并不是实际最频繁的值。

建议将 `N` 设为小于 10 的值；较大的 `N` 会降低性能。`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素数量。可选。默认值：10。
* `reserved` — 定义为这些值预留多少个单元格。如果 uniq(column) &gt; reserved，则 topK 函数的结果为近似值。可选。默认值：N * 3。

**参数列表**

* `column` — 用于计算频率的列。
* `weight` — 权重。每个值在频率计算时被计为 `weight` 次。[UInt64](../../../sql-reference/data-types/int-uint.md)。

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

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
