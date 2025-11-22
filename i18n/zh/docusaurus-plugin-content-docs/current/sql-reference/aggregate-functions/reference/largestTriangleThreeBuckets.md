---
description: '将 Largest-Triangle-Three-Buckets 算法应用于输入数据。'
sidebar_label: 'largestTriangleThreeBuckets'
sidebar_position: 159
slug: /sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets
title: 'largestTriangleThreeBuckets'
doc_type: 'reference'
---

# largestTriangleThreeBuckets

对输入数据应用 [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) 算法。
该算法用于对时间序列数据进行降采样，以便进行可视化展示。它被设计为在按 x 坐标排序的序列上运行。
其工作原理是将已排序序列划分为若干桶，然后在每个桶中找到面积最大的三角形。桶的数量等于结果序列中的点数。
该函数会先按 `x` 对数据进行排序，然后对排序后的数据应用降采样算法。

**语法**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

别名：`lttb`。

**参数**

* `x` — x 坐标。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Decimal](../../../sql-reference/data-types/decimal.md)、[Date](../../../sql-reference/data-types/date.md)、[Date32](../../../sql-reference/data-types/date32.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[DateTime64](../../../sql-reference/data-types/datetime64.md)。
* `y` — y 坐标。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Decimal](../../../sql-reference/data-types/decimal.md)、[Date](../../../sql-reference/data-types/date.md)、[Date32](../../../sql-reference/data-types/date32.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[DateTime64](../../../sql-reference/data-types/datetime64.md)。

在输入序列中会忽略 NaN 值，也就是说，所有 NaN 值都会从分析中排除。这样可以确保该函数仅在有效的数值数据上运行。

**参数**

* `n` — 结果序列中的点数。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**返回值**

由包含两个元素的 [Tuple](../../../sql-reference/data-types/tuple.md) 组成的 [Array](../../../sql-reference/data-types/array.md)：

**示例**

输入表：

```text
┌─────x───────┬───────y──────┐
│ 1.000000000 │ 10.000000000 │
│ 2.000000000 │ 20.000000000 │
│ 3.000000000 │ 15.000000000 │
│ 8.000000000 │ 60.000000000 │
│ 9.000000000 │ 55.000000000 │
│ 10.00000000 │ 70.000000000 │
│ 4.000000000 │ 30.000000000 │
│ 5.000000000 │ 40.000000000 │
│ 6.000000000 │ 35.000000000 │
│ 7.000000000 │ 50.000000000 │
└─────────────┴──────────────┘
```

查询：

```sql
SELECT largestTriangleThreeBuckets(4)(x, y) FROM largestTriangleThreeBuckets_test;
```

结果：

```text
┌────────largestTriangleThreeBuckets(4)(x, y)───────────┐
│           [(1,10),(3,15),(9,55),(10,70)]              │
└───────────────────────────────────────────────────────┘
```
