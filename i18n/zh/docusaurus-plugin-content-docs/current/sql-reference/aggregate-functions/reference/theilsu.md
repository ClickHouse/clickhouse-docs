---
'description': '`theilsU` 函数计算 Theils 的 U 不确定性系数，这是一个衡量表中两个列之间关联的值。'
'sidebar_position': 201
'slug': '/sql-reference/aggregate-functions/reference/theilsu'
'title': 'theilsU'
---


# theilsU

`theilsU` 函数计算 [Theil's U 不确定性系数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，该值用于衡量表中两列之间的关联程度。其值范围从 −1.0（100% 负关联，或完美反转）到 +1.0（100% 正关联，或完美一致）。值为 0.0 表示没有关联。

**语法**

```sql
theilsU(column1, column2)
```

**参数**

- `column1` 和 `column2` 是需要比较的列

**返回值**

- 一个介于 -1 和 1 之间的值

**返回类型**始终是 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两列之间的关联较小，因此 `theilsU` 的值为负：

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
