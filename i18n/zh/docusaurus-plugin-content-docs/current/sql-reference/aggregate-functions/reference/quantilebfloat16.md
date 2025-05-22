
# quantileBFloat16Weighted

与 `quantileBFloat16` 类似，但考虑到每个序列成员的权重。

计算由 [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数字组成的样本的近似 [quantile](https://en.wikipedia.org/wiki/Quantile)。 `bfloat16` 是一种浮点数据类型，具有 1 个符号位、8 个指数位和 7 个小数位。该函数将输入值转换为 32 位浮点数，并取最重要的 16 位。然后计算 `bfloat16` 的 quantile 值，并通过附加零位将结果转换为 64 位浮点数。该函数是一种快速的 quantile 估计器，相对误差不超过 0.390625%。

**语法**

```sql
quantileBFloat16[(level)](expr)
```

别名: `medianBFloat16`

**参数**

- `expr` — 数值数据的列。 [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md)。

**选项**

- `level` — quantile 的级别。可选。可能的值范围是 0 到 1 之间。默认值: 0.5。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的近似 quantile。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

输入表具有一个整数列和一个浮点列：

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

查询以计算 0.75-quantile（第三四分位数）：

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

结果：

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
请注意，示例中的所有浮点值在转换为 `bfloat16` 时都截断为 1.0。

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
