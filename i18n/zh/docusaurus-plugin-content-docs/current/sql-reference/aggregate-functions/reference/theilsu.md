---
'description': '`theilsU` 函数计算 Theils'' U 不确定系数，这是一个衡量表中两列之间关联的值。'
'sidebar_position': 201
'slug': '/sql-reference/aggregate-functions/reference/theilsu'
'title': 'theilsU'
'doc_type': 'reference'
---


# theilsU

`theilsU` 函数计算 [Theil's U 不确定性系数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，该值用于衡量表中两列之间的关联性。其值范围从 -1.0（100% 的负关联，或完全反转）到 +1.0（100% 的正关联，或完全一致）。值为 0.0 表示没有关联。

**语法**

```sql
theilsU(column1, column2)
```

**参数**

- `column1` 和 `column2` 是要进行比较的列

**返回值**

- 在 -1 和 1 之间的一个值

**返回类型** 始终是 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间的关联性较小，因此 `theilsU` 的值为负：

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
