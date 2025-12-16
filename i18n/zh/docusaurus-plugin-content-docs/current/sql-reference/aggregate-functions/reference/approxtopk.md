---
description: '返回一个数组，包含指定列中近似出现频率最高的值及其计数。'
sidebar_position: 107
slug: /sql-reference/aggregate-functions/reference/approxtopk
title: 'approx_top_k'
doc_type: 'reference'
---

# approx&#95;top&#95;k {#approx&#95;top&#95;k}

返回一个数组，其中包含指定列中近似出现频率最高的值及其计数。结果数组按照值的近似出现频率降序排列（而不是按值本身排序）。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

此函数不保证返回精确结果。在某些情况下可能会发生错误，并且可能返回的频繁值并不是最频繁出现的那些值。

`N` 的最大值为 `65536`。

**参数**

* `N` — 要返回的元素个数。可选。默认值：10。
* `reserved` — 为值预留的单元格数量。如果 uniq(column) &gt; reserved，则 topK 函数的结果将是近似值。可选。默认值：N * 3。

**参数说明**

* `column` — 要统计频率的值。

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

# approx&#95;top&#95;count {#approx&#95;top&#95;count}

是 `approx_top_k` 函数的别名。

**另请参阅**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)