---
'description': '精确计算数值数据序列的分位数，同时考虑每个元素的权重。'
'sidebar_position': 174
'slug': '/sql-reference/aggregate-functions/reference/quantileexactweighted'
'title': 'quantileExactWeighted'
---


# quantileExactWeighted

准确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，考虑到每个元素的权重。

为了获得准确值，所有传入的值被组合成一个数组，然后进行部分排序。每个值按其权重计算，就好像它出现了`weight`次。在算法中使用了哈希表。因此，如果传入的值频繁重复，此函数消耗的内存比[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)要少。您可以将此函数替换`quantileExact`并指定权重为1。

在查询中使用多个具有不同级别的`quantile*`函数时，内部状态不会合并（即，查询的效率不如预期）。在这种情况下，请使用[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)函数。

**语法**

```sql
quantileExactWeighted(level)(expr, weight)
```

别名: `medianExactWeighted`.

**参数**

- `level` — 分位数的级别。可选参数。介于0到1之间的常数浮点数。我们建议在`[0.01, 0.99]`范围内使用`level`值。默认值: 0.5。在`level=0.5`时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，返回数值[数据类型](/sql-reference/data-types)，[日期](../../../sql-reference/data-types/date.md)或[日期时间](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是值出现的次数，使用[无符号整数类型](../../../sql-reference/data-types/int-uint.md)。

**返回值**

- 指定级别的分位数。

类型:

- 输入为数值数据类型时为[Float64](../../../sql-reference/data-types/float.md)。
- 输入值为`Date`类型时为[Date](../../../sql-reference/data-types/date.md)。
- 输入值为`DateTime`类型时为[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另请参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
