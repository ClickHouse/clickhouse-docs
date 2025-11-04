---
'description': '计算数字数据序列的近似分位数。'
'sidebar_position': 172
'slug': '/sql-reference/aggregate-functions/reference/quantiledeterministic'
'title': 'quantileDeterministic'
'doc_type': 'reference'
---


# quantileDeterministic

计算数字数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。

此函数应用 [水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，水库大小可达 8192，并且采用确定性抽样算法。结果是确定性的。要获得精确的分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个具有不同级别的 `quantile*` 函数时，内部状态不会结合（即，查询的效率低于预期）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileDeterministic(level)(expr, determinator)
```

别名：`medianDeterministic`。

**参数**

- `level` — 分位数级别。可选参数。0 到 1 之间的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 作用于列值的表达式，结果为数字 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `determinator` — 在水库抽样算法中用来替代随机数生成器的数字的哈希值，以使抽样结果是确定性的。可以使用任何确定性的正数作为 determinator，例如，用户 ID 或事件 ID。如果相同的 determinator 值发生得太频繁，函数将无法正常工作。

**返回值**

- 指定级别的近似分位数。

类型：

- 输入为数字数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表：

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

查询：

```sql
SELECT quantileDeterministic(val, 1) FROM t
```

结果：

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
