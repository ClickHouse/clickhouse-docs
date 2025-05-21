---
'description': 'Computes an approximate quantile of a sample with relative-error guarantees.'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantileddsketch'
'title': 'quantileDD'
---



计算具有相对误差保证的样本的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。它通过构建一个 [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf) 来工作。

**语法**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**参数**

- `expr` — 包含数值数据的列。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md)。

**参数说明**

- `relative_accuracy` — 分位数的相对准确性。可能的值范围从 0 到 1。 [浮点数](../../../sql-reference/data-types/float.md)。草图的大小依赖于数据的范围和相对准确性。范围越大，相对准确性越小，草图就越大。草图的粗略内存大小为 `log(max_value/min_value)/relative_accuracy`。建议值为 0.001 或更高。

- `level` — 分位数的水平。可选。可能的值范围从 0 到 1。默认值：0.5。 [浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定水平的近似分位数。

类型：[Float64](/sql-reference/data-types/float).

**示例**

输入表包含一个整数列和一个浮点列：

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
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

结果：

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
