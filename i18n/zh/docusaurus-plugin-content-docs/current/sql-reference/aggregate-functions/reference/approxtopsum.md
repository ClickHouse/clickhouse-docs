---
slug: /sql-reference/aggregate-functions/reference/approxtopsum
sidebar_position: 108
title: 'approx_top_sum'
description: '返回指定列中出现频率最高的值及其计数的数组。'
---


# approx_top_sum

返回指定列中出现频率最高的值及其计数的数组。结果数组按值的近似频率降序排列（而不是按值本身）。此外，还考虑了值的权重。

``` sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

此函数不提供保证的结果。在某些情况下，可能会出现错误，并且可能返回不是最频繁值的频繁值。

我们建议使用 `N < 10` 的值；较大 `N` 值会降低性能。`N` 的最大值为 `65536`。

**参数**

- `N` — 返回元素的数量。可选。默认值：10。
- `reserved` — 定义为值保留多少个单元。如果 uniq(column) > reserved，topK 函数的结果将是近似的。可选。默认值：N * 3。

**参数说明**

- `column` — 计算频率的值。
- `weight` — 权重。每个值被计算为 `weight` 次，用于频率计算。 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**示例**

查询：

``` sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

结果：

``` text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**参见**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
