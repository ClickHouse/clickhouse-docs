---
'description': '‘theilsU’ 函数计算 Theils'' U 不确定系数，这是一个衡量表中两列之间关联的值。'
'sidebar_position': 201
'slug': '/sql-reference/aggregate-functions/reference/theilsu'
'title': 'theilsU'
---




# theilsU

`theilsU`函数计算[Theil's U不确定性系数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，该值衡量表中两列之间的关联。其值范围从−1.0（100%负关联或完美反转）到+1.0（100%正关联或完美一致）。值为0.0表示不存在关联。

**语法**

```sql
theilsU(column1, column2)
```

**参数**

- `column1`和`column2`是要比较的列

**返回值**

- 一个介于-1和1之间的值

**返回类型**始终是[Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间的关联较小，因此`theilsU`的值为负:

```sql
SELECT
    theilsU(a ,b)
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
┌────────theilsU(a, b)─┐
│ -0.30195720557678846 │
└──────────────────────┘
```
