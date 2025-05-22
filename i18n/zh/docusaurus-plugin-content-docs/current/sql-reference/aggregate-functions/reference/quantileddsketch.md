---
'description': '计算一个样本的近似分位数，并提供相对误差保证。'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantileddsketch'
'title': 'quantileDD'
---

计算具有相对误差保证的样本的近似 [quantile](https://en.wikipedia.org/wiki/Quantile)。它通过构建一个 [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf) 来工作。

**语法**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**参数**

- `expr` — 包含数值数据的列。 [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md)。

**参数说明**

- `relative_accuracy` — 量化的相对精度。可能的值在 0 到 1 之间。[Float](../../../sql-reference/data-types/float.md)。草图的大小取决于数据的范围和相对精度。范围越大，相对精度越小，草图越大。草图的粗略内存大小为 `log(max_value/min_value)/relative_accuracy`。建议的值为 0.001 或更高。

- `level` — 量化的层级。可选。可能的值在 0 到 1 之间。默认值为 0.5。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定层级的近似量化。

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
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

结果：

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**另请参阅**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
