---
'description': '准确计算数值数据序列的分位数，同时考虑每个元素的权重。'
'sidebar_position': 174
'slug': '/sql-reference/aggregate-functions/reference/quantileexactweighted'
'title': 'quantileExactWeighted'
'doc_type': 'reference'
---


# quantileExactWeighted

精确计算数字数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，考虑每个元素的权重。

为了获得精确值，所有传入的值被组合成一个数组，然后部分排序。每个值的计数与其权重相结合，仿佛它出现了 `weight` 次。算法中使用了哈希表。因此，如果传入的值频繁重复，该函数消耗的内存比 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 更少。您可以使用此函数替代 `quantileExact` 并指定权重为 1。

在查询中使用多个不同层级的 `quantile*` 函数时，内部状态不会合并（即，查询的效率低于预期）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExactWeighted(level)(expr, weight)
```

别名: `medianExactWeighted`。

**参数**

- `level` — 分位数层级。可选参数。0 到 1 之间的常数浮点数。我们建议使用的 `level` 值范围为 `[0.01, 0.99]`。默认值: 0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 生成数字[数据类型](/sql-reference/data-types)的列值表达式，支持[日期](../../../sql-reference/data-types/date.md)或[日期时间](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是具有[无符号整数类型](../../../sql-reference/data-types/int-uint.md)的值出现次数。

**返回值**

- 指定层级的分位数。

类型:

- 对于输入为数字数据类型：[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值类型为 `Date`，则返回[日期](../../../sql-reference/data-types/date.md)。
- 如果输入值类型为 `DateTime`，则返回[日期时间](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

查询:

```sql
SELECT quantileExactWeighted(n, val) FROM t
```

结果:

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**另请参阅**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
