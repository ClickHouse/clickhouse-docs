---
description: '计算 Cramer''s V，但进行了偏差修正。'
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected {#cramersvbiascorrected}

Cramer&#39;s V 是用于衡量表中两列之间关联程度的指标。[`cramersV` 函数](./cramersV.md) 的结果范围是从 0（表示变量之间没有关联）到 1，并且只有在每个值都完全由另一个值决定时才会达到 1。该函数可能存在较大偏差，因此此版本的 Cramer&#39;s V 使用了[偏差校正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

```sql
cramersVBiasCorrected(column1, column2)
```

**参数**

* `column1`: 要比较的第一个列。
* `column2`: 要比较的第二个列。

**返回值**

* 一个介于 0 到 1 之间的值，0 对应列值之间没有关联，1 对应完全关联。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的这两列之间存在中等程度的关联。注意 `cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

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
