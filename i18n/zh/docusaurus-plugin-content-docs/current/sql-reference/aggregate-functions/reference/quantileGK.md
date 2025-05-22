
# quantileGK

使用 [Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf) 算法计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。Greenwald-Khanna 算法是一种用于在数据流上以高效方式计算分位数的算法。此算法由 Michael Greenwald 和 Sanjeev Khanna 于 2001 年提出。它广泛应用于数据库和大数据系统中，在这些系统中，实时计算大数据流的准确分位数是必要的。该算法效率极高，每个项目只需 O(log n) 的空间和 O(log log n) 的时间（其中 n 为输入的大小）。它的准确性也很高，以高概率提供近似的分位数值。

`quantileGK` 与 ClickHouse 中的其他分位数函数不同，因为它使用户能够控制近似分位数结果的准确性。

**语法**

```sql
quantileGK(accuracy, level)(expr)
```

别名: `medianGK`。

**参数**

- `accuracy` — 分位数的准确性。常量正整数。较大的准确性值意味着更少的误差。例如，如果准确性参数设置为 100，则计算出的分位数的误差在高概率下不超过 1%。计算的分位数的准确性与算法的计算复杂性之间存在权衡。更大的准确性需要更多的内存和计算资源来准确计算分位数，而较小的准确性参数则允许更快和更节省内存的计算，但准确性略低。

- `level` — 分位数的等级。可选参数。常量浮点数，范围为 0 到 1。默认值: 0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 作用于列值的表达式，返回数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。



**返回值**

- 指定等级和准确性的分位数。


类型:

- [Float64](../../../sql-reference/data-types/float.md) 用于数值数据类型输入。
- 如果输入值具有 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
