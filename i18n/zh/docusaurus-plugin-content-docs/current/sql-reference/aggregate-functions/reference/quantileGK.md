---
'description': '使用 Greenwald-Khanna 算法计算数字数据序列的分位数。'
'sidebar_position': 175
'slug': '/sql-reference/aggregate-functions/reference/quantileGK'
'title': 'quantileGK'
---


# quantileGK

计算一个数字数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)，使用 [Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf) 算法。Greenwald-Khanna 算法用于以高效方式计算数据流上的分位数。该算法由 Michael Greenwald 和 Sanjeev Khanna 于 2001 年提出。它在数据库和大数据系统中广泛使用，因为在实时处理大量数据流时需要计算精确的分位数。该算法非常高效，空间复杂度为 O(log n)，每个项目的时间复杂度为 O(log log n)（其中 n 是输入的大小）。它还具有很高的准确性，以较高的概率提供近似的分位数值。

`quantileGK` 与 ClickHouse 中的其他分位数函数不同，因为它使用户能够控制近似分位数结果的准确性。

**语法**

```sql
quantileGK(accuracy, level)(expr)
```

别名：`medianGK`。

**参数**

- `accuracy` — 分位数的准确性。常数正整数。较大的准确度值意味着误差较小。例如，如果将准确度参数设置为 100，计算出的分位数的误差不会大于 1%，以较高的概率。计算的分位数的准确性与算法的计算复杂性之间存在权衡。较大的准确度需要更多的内存和计算资源以准确计算分位数，而较小的准确度参数则可以实现更快和更节省内存的计算，但准确性稍低。

- `level` — 分位数的级别。可选参数。常数浮点数，范围从 0 到 1。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 表示列值的表达式，结果为数字 [数据类型](/sql-reference/data-types)， [Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别和准确性下的分位数。

类型：

- 输入为数字数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

```sql
SELECT quantileGK(1, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1, 0.25)(plus(number, 1))─┐
│                                    1 │
└──────────────────────────────────────┘

SELECT quantileGK(10, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(10, 0.25)(plus(number, 1))─┐
│                                   156 │
└───────────────────────────────────────┘

SELECT quantileGK(100, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(100, 0.25)(plus(number, 1))─┐
│                                    251 │
└────────────────────────────────────────┘

SELECT quantileGK(1000, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1000, 0.25)(plus(number, 1))─┐
│                                     249 │
└─────────────────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
