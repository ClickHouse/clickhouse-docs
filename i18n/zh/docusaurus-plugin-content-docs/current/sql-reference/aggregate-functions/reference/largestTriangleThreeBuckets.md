
# largestTriangleThreeBuckets

应用 [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) 算法对输入数据进行处理。该算法用于对时间序列数据进行降采样以便于可视化。它的设计目的是在按照 x 坐标排序的序列上进行操作。它通过将排序好的序列分成多个桶，然后在每个桶中找到最大的三角形来工作。桶的数量等于结果序列中的点数。该函数将根据 `x` 对数据进行排序，然后对排序后的数据应用降采样算法。

**语法**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

别名: `lttb`.

**参数**

- `x` — x 坐标。 [整数](../../../sql-reference/data-types/int-uint.md) , [浮点数](../../../sql-reference/data-types/float.md) , [十进制](../../../sql-reference/data-types/decimal.md)  , [日期](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [日期时间](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md).
- `y` — y 坐标。 [整数](../../../sql-reference/data-types/int-uint.md) , [浮点数](../../../sql-reference/data-types/float.md) , [十进制](../../../sql-reference/data-types/decimal.md)  , [日期](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [日期时间](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md).

在提供的序列中，NaN 值会被忽略，这意味着任何 NaN 值将被排除在分析之外。这确保了函数仅对有效的数值数据进行操作。

**返回值**

[Array](../../../sql-reference/data-types/array.md) 的 [Tuple](../../../sql-reference/data-types/tuple.md)，包含两个元素：

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
