---
description: '计算Cramer''s V，但进行了偏倚校正。'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected

Cramer&#39;s V 是用于衡量数据表中两列之间关联强度的指标。[`cramersV` 函数](./cramersv.md) 的结果范围从 0（表示变量之间没有关联）到 1，且只有在每个取值都能由另一个变量唯一确定时才能达到 1。由于该函数可能存在明显偏差，因此此版本的 Cramer&#39;s V 使用了[偏差校正（bias correction）](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

```sql
cramersVBiasCorrected(column1, column2)
```

**参数**

* `column1`: 要比较的第一列。
* `column2`: 要比较的第二列。

**返回值**

* 一个介于 0（表示列值之间没有关联）到 1（表示完全关联）之间的值。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的这两列彼此之间具有中等程度的关联。请注意，`cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

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
