---
'description': '计算由 bfloat16 数字组成的样本的近似分位数。'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantilebfloat16'
'title': 'quantileBFloat16'
'doc_type': 'reference'
---


# quantileBFloat16Weighted

类似于 `quantileBFloat16`，但考虑了每个序列成员的权重。

计算由 [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数字组成的样本的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。`bfloat16` 是一种浮点数据类型，具有 1 位符号位，8 位指数位和 7 位尾数位。
该函数将输入值转换为 32 位浮点数，并获取最重要的 16 位。然后计算 `bfloat16` 分位数值，并通过附加零位将结果转换为 64 位浮点数。
该函数是一个快速的分位数估算器，具有不超过 0.390625% 的相对误差。

**语法**

```sql
quantileBFloat16[(level)](expr)
```

别名：`medianBFloat16`

**参数**

- `expr` — 包含数值数据的列。 [整数](../../../sql-reference/data-types/int-uint.md)， [浮点数](../../../sql-reference/data-types/float.md)。

**参数**

- `level` — 分位数的水平。可选。可能的值范围从 0 到 1。默认值：0.5。 [浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定水平的近似分位数。

类型：[Float64](/sql-reference/data-types/float)。

**示例**

输入表具有整数和浮点列：

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

查询以计算 0.75-分位数（第三四分位数）：

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

结果：

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
注意，示例中的所有浮点值在转换为 `bfloat16` 时都被截断为 1.0。

**另请参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
