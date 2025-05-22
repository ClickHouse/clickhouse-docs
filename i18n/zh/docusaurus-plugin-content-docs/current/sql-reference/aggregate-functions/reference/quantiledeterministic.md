
# quantileDeterministic

计算数值数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。

此函数应用 [水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，水库大小最高可达到 8192，并使用确定性抽样算法。结果是确定性的。要获得精确的分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个不同水平的 `quantile*` 函数时，内部状态不会合并（也就是说，该查询的效率低于可能的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileDeterministic(level)(expr, determinator)
```

别名：`medianDeterministic`。

**参数**

- `level` — 分位数的水平。可选参数。范围从 0 到 1 的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `determinator` — 在水库抽样算法中，用于替代随机数生成器的数字的哈希，以使抽样结果具有确定性。您可以使用任何确定性的正数作为 determinator，例如用户 ID 或事件 ID。如果相同的 determinator 值出现得过于频繁，该函数会出现错误。

**返回值**

- 指定水平的近似分位数。

类型：

- 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另请参阅**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
