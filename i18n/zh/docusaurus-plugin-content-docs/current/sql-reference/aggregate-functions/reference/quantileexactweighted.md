---
'description': 'Exactly computes the quantile of a numeric data sequence, taking into
  account the weight of each element.'
'sidebar_position': 174
'slug': '/sql-reference/aggregate-functions/reference/quantileexactweighted'
'title': 'quantileExactWeighted'
---




# quantileExactWeighted

准确计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)，考虑到每个元素的权重。

为了获得准确的值，所有传递的值被组合成一个数组，然后进行部分排序。每个值根据其权重进行计数，就好像它出现了 `weight` 次。算法中使用了哈希表。因此，如果传入的值频繁重复，函数消耗的 RAM 比 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 少。您可以将此函数替代 `quantileExact` 并指定权重为 1。

在查询中使用多个不同层次的 `quantile*` 函数时，内部状态不会合并（也就是说，查询的效率低于可能的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExactWeighted(level)(expr, weight)
```

别名： `medianExactWeighted`。

**参数**

- `level` — 分位数的层次。可选参数。范围为 0 到 1 的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，返回数值 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是具有 [无符号整数类型](../../../sql-reference/data-types/int-uint.md) 的值出现次数。

**返回值**

- 指定层次的分位数。

类型：

- 输入为数值数据类型时，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表：

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

查询：

```sql
SELECT quantileExactWeighted(n, val) FROM t
```

结果：

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**另请参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
