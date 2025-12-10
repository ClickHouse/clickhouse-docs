---
description: '返回指定列中近似出现最频繁值的数组。结果数组按值的近似出现频率降序排列（而不是按值本身排序）。此外，还会考虑值的权重。'
sidebar_position: 203
slug: /sql-reference/aggregate-functions/reference/topkweighted
title: 'topKWeighted'
doc_type: 'reference'
---

# topKWeighted {#topkweighted}

返回一个数组，其中包含指定列中近似出现频率最高的值。结果数组按照值的近似出现频率降序排列（而不是按值本身排序）。同时会考虑各个值的权重。

**语法**

```sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**参数**

* `N` — 要返回的元素个数。可选。默认值：10。
* `load_factor` — 定义为存储值预留的单元格数量。如果 uniq(column) &gt; N * load&#95;factor，则 topK 函数的结果是近似值。可选。默认值：3。
* `counts` — 定义结果中是否应包含近似计数和误差值。

**参数说明**

* `column` — 值。
* `weight` — 权重。每个值在频率计算中按 `weight` 次计入。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**返回值**

返回一个数组，包含其权重近似总和最大的值。

**示例**

查询：

```sql
SELECT topKWeighted(2)(k, w) FROM
VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

结果：

```text
┌─topKWeighted(2)(k, w)──┐
│ ['z','x']              │
└────────────────────────┘
```

查询：

```sql
SELECT topKWeighted(2, 10, 'counts')(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

结果：

```text
┌─topKWeighted(2, 10, 'counts')(k, w)─┐
│ [('z',10,0),('x',5,0)]              │
└─────────────────────────────────────┘
```

**另请参阅**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
