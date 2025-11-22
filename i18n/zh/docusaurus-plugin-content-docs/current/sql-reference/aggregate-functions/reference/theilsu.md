---
description: '`theilsU` 函数用于计算 Theil 的 U 不确定性系数，该系数衡量表中两列之间的关联程度。'
sidebar_position: 201
slug: /sql-reference/aggregate-functions/reference/theilsu
title: 'theilsU'
doc_type: 'reference'
---

# theilsU

`theilsU` 函数用于计算 [Theil&#39;s U 不确定性系数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，用于度量表中两列之间的关联程度。其取值范围从 −1.0（100% 负相关，或完全相反）到 +1.0（100% 正相关，或完全一致）。值为 0.0 表示不存在关联。

**语法**

```sql
theilsU(column1, column2)
```

**参数**

* `column1` 和 `column2` 是要进行比较的列

**返回值**

* 一个介于 -1 和 1 之间的值

**返回类型** 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面被比较的两列之间仅有较弱的关联，因此 `theilsU` 的值为负数：

```sql
SELECT
    theilsU(a, b)
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
