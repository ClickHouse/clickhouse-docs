---
'description': 'Computes the quantile of a numeric data sequence using the Greenwald-Khanna
  algorithm.'
'sidebar_position': 175
'slug': '/sql-reference/aggregate-functions/reference/quantileGK'
'title': 'quantileGK'
---




# quantileGK

使用[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)算法计算数字数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。Greenwald-Khanna算法是一种用于高效计算数据流中分位数的算法。该算法由Michael Greenwald和Sanjeev Khanna于2001年提出。它在数据库和大数据系统中被广泛使用，因为在实时计算大型数据流的准确分位数是必要的。该算法非常高效，空间复杂度为O(log n)，每个项目的时间复杂度为O(log log n)（其中n是输入的大小）。它还具有很高的准确性，以高概率提供近似的分位数值。

`quantileGK`与ClickHouse中的其他分位数函数不同，因为它允许用户控制近似分位数结果的准确性。

**语法**

```sql
quantileGK(accuracy, level)(expr)
```

别名: `medianGK`。

**参数**

- `accuracy` — 分位数的准确性。常量正整数。较大的准确性值意味着较小的误差。例如，如果将准确性参数设置为100，则计算出的分位数的误差在高概率下不超过1%。计算的分位数的准确性与算法的计算复杂性之间存在权衡。较大的准确性需要更多的内存和计算资源来准确计算分位数，而较小的准确性参数允许更快和更节省内存的计算，但准确性会稍低。

- `level` — 分位数的水平。可选参数。范围从0到1的常量浮点数。默认值: 0.5。在`level=0.5`时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 针对列值的表达式，结果为数值的[数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定水平和准确性的分位数。

类型：

- 数值数据类型输入的[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值的类型为`Date`，则为[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值的类型为`DateTime`，则为[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另请参阅**

- [median]/sql-reference/aggregate-functions/reference/median
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
