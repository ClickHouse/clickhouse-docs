---
'description': '提供一个针对单因素方差分析 (ANOVA test) 的统计测试。它是对几组正态分布观察值的测试，旨在找出所有组的均值是否相同。'
'sidebar_position': 101
'slug': '/sql-reference/aggregate-functions/reference/analysis_of_variance'
'title': 'analysisOfVariance'
---


# analysisOfVariance

提供单因素方差分析的统计检验（ANOVA检验）。它是对几个正态分布观察值组进行检验，以找出所有组是否具有相同的均值。

**语法**

```sql
analysisOfVariance(val, group_no)
```

别名：`anova`

**参数**
- `val`：值。
- `group_no`：`val`所属的组编号。

:::note
组的编号从0开始，执行检验时至少应有两个组。
应至少有一个组的观察值数量大于一。
:::

**返回值**

- `(f_statistic, p_value)`。[元组](../../data-types/tuple.md)([Float64](../../data-types/float.md)， [Float64](../../data-types/float.md))。

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
