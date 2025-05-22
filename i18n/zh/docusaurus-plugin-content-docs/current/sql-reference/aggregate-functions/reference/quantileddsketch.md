计算带有相对误差保证的样本近似 [quantile](https://en.wikipedia.org/wiki/Quantile)。其工作原理是构建一个 [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf)。

**语法**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**参数**

- `expr` — 包含数值数据的列。 [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md)。

**参数**

- `relative_accuracy` — 量化的相对精度。可能的值范围为 0 到 1。 [Float](../../../sql-reference/data-types/float.md)。草图的大小取决于数据的范围和相对精度。范围越大，相对精度越小，草图越大。草图的粗略内存大小为 `log(max_value/min_value)/relative_accuracy`。推荐值为 0.001 或更高。

- `level` — 量化级别。可选。可能的值范围为 0 到 1。默认值：0.5。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的近似量化。

类型：[Float64](/sql-reference/data-types/float)。

**示例**

输入表包含一个整数列和一个浮动列：

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

计算 0.75-quantile（第三四分位数）的查询：

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
