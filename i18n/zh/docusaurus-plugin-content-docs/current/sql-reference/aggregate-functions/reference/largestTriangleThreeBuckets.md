---
'description': '将最大三角三桶算法应用于输入数据。'
'sidebar_label': '最大三角三桶'
'sidebar_position': 159
'slug': '/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets'
'title': 'largestTriangleThreeBuckets'
---




# largestTriangleThreeBuckets

应用 [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) 算法到输入数据。
该算法用于对时间序列数据进行下采样，以便于可视化。它旨在对按 x 坐标排序的序列进行操作。
该算法通过将排序后的序列划分为多个桶，然后找出每个桶中的最大三角形来工作。桶的数量等于结果序列中的点数。
该函数将按 `x` 对数据进行排序，然后将下采样算法应用于排序后的数据。

**语法**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

别名: `lttb`。

**参数**

- `x` — x 坐标。 [Integer](../../../sql-reference/data-types/int-uint.md) , [Float](../../../sql-reference/data-types/float.md) , [Decimal](../../../sql-reference/data-types/decimal.md)  , [Date](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [DateTime](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md)。
- `y` — y 坐标。 [Integer](../../../sql-reference/data-types/int-uint.md) , [Float](../../../sql-reference/data-types/float.md) , [Decimal](../../../sql-reference/data-types/decimal.md)  , [Date](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [DateTime](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md)。

在提供的序列中，NaN 值将被忽略，这意味着任何 NaN 值将被排除在分析之外。这确保该函数仅在有效的数值数据上操作。

**返回值**

[Array](../../../sql-reference/data-types/array.md) 的 [Tuple](../../../sql-reference/data-types/tuple.md)，包含两个元素:

**示例**

输入表:

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

查询:

```sql
SELECT largestTriangleThreeBuckets(4)(x, y) FROM largestTriangleThreeBuckets_test;
```

结果:

```text
┌────────largestTriangleThreeBuckets(4)(x, y)───────────┐
│           [(1,10),(3,15),(9,55),(10,70)]              │
└───────────────────────────────────────────────────────┘
```
