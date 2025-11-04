---
'description': '`contingency` 函数计算 contingence 系数，这是一个测量表中两个列之间关联程度的值。其计算方法类似于 `cramersV`
  函数，但在平方根中使用了不同的分母。'
'sidebar_position': 116
'slug': '/sql-reference/aggregate-functions/reference/contingency'
'title': 'contingency'
'doc_type': 'reference'
---


# contingency

`contingency` 函数计算 [应急系数](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C)，这是一个衡量表中两个列之间关联性的值。该计算类似于 [cramersV 函数](./cramersv.md)，但在取平方根时使用了不同的分母。

**语法**

```sql
contingency(column1, column2)
```

**参数**

- `column1` 和 `column2` 是要比较的列

**返回值**

- 一个介于 0 和 1 之间的值。结果越大，两个列之间的关联越紧密。

**返回类型** 始终是 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间的关联性较小。我们还包括了 `cramersV` 的结果（作为比较）：

```sql
SELECT
    cramersV(a, b),
    contingency(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

结果：

```response
┌──────cramersV(a, b)─┬───contingency(a, b)─┐
│ 0.41171788506213564 │ 0.05812725261759165 │
└─────────────────────┴─────────────────────┘
```
