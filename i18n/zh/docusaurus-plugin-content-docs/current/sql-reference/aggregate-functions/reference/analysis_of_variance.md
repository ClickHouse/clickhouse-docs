---
'description': '提供单因素方差分析的统计测试（ANOVA 测试）。这是对多个正态分布观察组进行的检验，以找出所有组的均值是否相同。'
'sidebar_position': 101
'slug': '/sql-reference/aggregate-functions/reference/analysis_of_variance'
'title': 'analysisOfVariance'
'doc_type': 'reference'
---


# analysisOfVariance

提供单向方差分析的统计检验（ANOVA 测试）。它是对多个正态分布观测值组的检验，以确定所有组的均值是否相同。

**语法**

```sql
analysisOfVariance(val, group_no)
```

别名： `anova`

**参数**
- `val`：值。
- `group_no`：`val` 所属的组编号。

:::note
组的编号从 0 开始，进行测试时至少应有两个组。
至少应有一个组的观测值数量大于一。
:::

**返回值**

- `(f_statistic, p_value)`。 [元组](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md))。

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
