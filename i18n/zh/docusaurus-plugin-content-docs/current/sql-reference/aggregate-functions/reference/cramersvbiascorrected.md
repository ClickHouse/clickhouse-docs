---
description: '计算 Cramer''s V 统计量，但进行了偏倚校正。'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected

Cramer&#39;s V 是用于衡量表中两列之间关联程度的指标。[`cramersV` 函数](./cramersv.md) 的结果范围从 0（表示变量之间没有关联）到 1，且只有在每个值都被另一个值完全决定时才会达到 1。该函数可能存在较大偏差，因此此版本的 Cramer&#39;s V 使用了[偏差校正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

```sql
cramersVBiasCorrected(column1, column2)
```

**参数**

* `column1`: 要比较的第一列。
* `column2`: 要比较的第二列。

**返回值**

* 一个在 0（表示列值之间没有关联）到 1（完全关联）之间的数值。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面被比较的这两列彼此之间具有中等程度的关联。请注意，`cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

查询：

```sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
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
┌─────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.5798088336225178 │          0.5305112825189074 │
└────────────────────┴─────────────────────────────┘
```
