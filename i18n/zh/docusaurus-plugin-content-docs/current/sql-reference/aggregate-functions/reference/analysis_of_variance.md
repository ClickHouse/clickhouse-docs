
# analysisOfVariance

提供了一种用于单因素方差分析（ANOVA测试）的统计检验。该测试用于多个服从正态分布的观察组，以确定所有组的均值是否相同。

**语法**

```sql
analysisOfVariance(val, group_no)
```

别名: `anova`

**参数**
- `val`: 值。
- `group_no`: `val`所属的组编号。

:::note
组的编号从0开始，至少应有两个组才能执行测试。
至少应有一个组的观察数量大于一。
:::

**返回值**

- `(f_statistic, p_value)`。[元组](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md))。

**示例**

查询:

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

结果:

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```
