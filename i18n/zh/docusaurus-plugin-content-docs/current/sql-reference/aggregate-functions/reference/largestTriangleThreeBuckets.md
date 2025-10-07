---
'description': '将Largest-Triangle-Three-Buckets算法应用于输入数据。'
'sidebar_label': 'largestTriangleThreeBuckets'
'sidebar_position': 159
'slug': '/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets'
'title': 'largestTriangleThreeBuckets'
'doc_type': 'reference'
---


# largestTriangleThreeBuckets

应用 [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) 算法于输入数据。该算法用于对时间序列数据进行降采样以便可视化。它被设计为在按 x 坐标排序的序列上操作。它通过将排序后的序列划分为多个桶，然后在每个桶中寻找最大的三角形来工作。桶的数量等于结果序列中的点数。该函数将会按 `x` 对数据进行排序，然后将降采样算法应用于排序后的数据。

**语法**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

别名: `lttb`。

**参数**

- `x` — x 坐标。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md), [十进制](../../../sql-reference/data-types/decimal.md), [日期](../../../sql-reference/data-types/date.md), [日期32](../../../sql-reference/data-types/date32.md), [日期时间](../../../sql-reference/data-types/datetime.md), [日期时间64](../../../sql-reference/data-types/datetime64.md)。
- `y` — y 坐标。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md), [十进制](../../../sql-reference/data-types/decimal.md), [日期](../../../sql-reference/data-types/date.md), [日期32](../../../sql-reference/data-types/date32.md), [日期时间](../../../sql-reference/data-types/datetime.md), [日期时间64](../../../sql-reference/data-types/datetime64.md)。

在提供的序列中会忽略 NaN，这意味着任何 NaN 值将被排除在分析之外。这确保了该函数仅在有效的数值数据上进行操作。

**参数**

- `n` — 结果序列中的点数。 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**返回值**

[数组](../../../sql-reference/data-types/array.md) 的 [元组](../../../sql-reference/data-types/tuple.md)，包含两个元素：

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
