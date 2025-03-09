---
slug: /sql-reference/aggregate-functions/reference/topkweighted
sidebar_position: 203
title: 'topKWeighted'
description: '返回指定列中大约最常见值的数组。结果数组按值的近似频率降序排列（而不是按值本身）。此外，还考虑了值的权重。'
---


# topKWeighted

返回指定列中大约最常见值的数组。结果数组按值的近似频率降序排列（而不是按值本身）。此外，还考虑了值的权重。

**语法**

``` sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**参数**

- `N` — 要返回的元素数量。可选。默认值：10。
- `load_factor` — 定义为值保留多少单元格。如果 uniq(column) > N * load_factor，topK 函数的结果将是近似的。可选。默认值：3。
- `counts` — 定义结果是否应包含近似计数和误差值。

**参数说明**

- `column` — 值。
- `weight` — 权重。每个值在频率计算中计入 `weight` 次。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**返回值**

返回一个具有最大近似权重总和的值的数组。

**示例**

查询：

``` sql
SELECT topKWeighted(2)(k, w) FROM
VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

结果：

``` text
┌─topKWeighted(2)(k, w)──┐
│ ['z','x']              │
└────────────────────────┘
```

查询：

``` sql
SELECT topKWeighted(2, 10, 'counts')(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

结果：

``` text
┌─topKWeighted(2, 10, 'counts')(k, w)─┐
│ [('z',10,0),('x',5,0)]              │
└─────────────────────────────────────┘
```

**参见**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
