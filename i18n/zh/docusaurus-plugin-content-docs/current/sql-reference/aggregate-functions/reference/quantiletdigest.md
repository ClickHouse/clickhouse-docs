---
description: '使用 t-digest 算法计算数值数据序列的近似分位数。'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
doc_type: 'reference'
---

# quantileTDigest

使用 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 算法，对数值数据序列计算近似的[分位数](https://en.wikipedia.org/wiki/Quantile)。

内存消耗为 `log(n)`，其中 `n` 为值的数量。结果依赖于查询的执行顺序，因此是非确定性的。

该函数的性能低于 [quantile](/sql-reference/aggregate-functions/reference/quantile) 或 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) 函数。就状态（State）大小与精度的比率而言，该函数比 `quantile` 好得多。

在一个查询中使用多个具有不同 level 的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率低于其理论最优效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTDigest(level)(expr)
```

别名：`medianTDigest`。

**参数**

* `level` — 分位数级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 对列值进行运算的表达式，结果为数值[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

* 指定级别的近似分位数。

类型：

* 数值数据类型输入时为 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值的类型为 `Date`，则为 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

结果：

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
