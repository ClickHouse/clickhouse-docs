---
description: '`theilsU` 函数用于计算 Theil 的 U 不确定性系数，用来衡量表中两列之间的相关性。'
sidebar_position: 201
slug: /sql-reference/aggregate-functions/reference/theilsu
title: 'theilsU'
doc_type: 'reference'
---

# theilsU {#theilsu}

`theilsU` 函数计算 [Theil&#39;s U 不确定性系数](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，用于度量表中两列之间的关联程度。其取值范围为 0.0（无关联）到 1.0（完全一致）。

**语法**

```sql
theilsU(column1, column2)
```

**参数**

* `column1` 和 `column2` 是要进行比较的列

**返回值**

* 介于 0 和 1 之间的值

**返回类型** 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面被比较的这两列之间只有较弱的相关性，因此 `theilsU` 的值较小且为正数：

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
│  0.30195720557678846 │
└──────────────────────┘
```
