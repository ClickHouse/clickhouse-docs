---
'description': 'Provides a statistical test for one-way analysis of variance (ANOVA
  test). It is a test over several groups of normally distributed observations to
  find out whether all groups have the same mean or not.'
'sidebar_position': 101
'slug': '/sql-reference/aggregate-functions/reference/analysis_of_variance'
'title': 'analysisOfVariance'
---




# analysisOfVariance

提供单因素方差分析的统计检验（ANOVA 测试）。该测试用于检查几组正态分布的观察值，以确定所有组的均值是否相同。

**语法**

```sql
analysisOfVariance(val, group_no)
```

别名：`anova`

**参数**
- `val`：值。
- `group_no`：`val` 所属的组号。

:::note
组的编号从 0 开始，进行测试时至少需要两个组。
至少需要一个组的观察值数量大于 1。
:::

**返回值**

- `(f_statistic, p_value)`。[元组](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md))。

**示例**

查询：

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

结果：

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```
