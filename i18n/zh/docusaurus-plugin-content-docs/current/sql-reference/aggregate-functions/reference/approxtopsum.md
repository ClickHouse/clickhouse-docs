---
description: '返回指定列中近似出现次数最多的值及其计数的数组。'
sidebar_position: 108
slug: /sql-reference/aggregate-functions/reference/approxtopsum
title: 'approx_top_sum'
doc_type: 'reference'
---

# approx&#95;top&#95;sum {#approx&#95;top&#95;sum}

返回一个数组，其中包含指定列中近似最常出现的值及其计数。结果数组按值的近似出现频率降序排序（而不是按值本身排序）。此外，还会考虑各个值的权重。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

此函数不保证返回结果的绝对准确性。在某些情况下，可能会产生误差，并且返回的高频值可能并不是实际出现频率最高的那些值。

`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素数量。可选。默认值：10。
* `reserved` — 为值预留的单元格数量。如果 uniq(column) &gt; reserved，则 topK 函数的结果将是近似值。可选。默认值：N * 3。

**参数**

* `column` — 用于计算频率的值。
* `weight` — 权重。每个值在频率计算时按 `weight` 次计入。[UInt64](../../../sql-reference/data-types/int-uint.md)。

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
