
# theilsU

`theilsU` 函数计算 [Theil's U 不确定性系数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，该值衡量一个表中两个列之间的关联。其值范围从 −1.0（100% 负关联或完全反转）到 +1.0（100% 正关联或完全一致）。值为 0.0 表示缺乏关联。

**语法**

```sql
theilsU(column1, column2)
```

**参数**

- `column1` 和 `column2` 是要进行比较的列

**返回值**

- 一个介于 -1 和 1 之间的值

**返回类型** 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

以下被比较的两个列之间的关联很小，因此 `theilsU` 的值为负：

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
