---
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
sidebar_position: 128
title: 'cramersVBiasCorrected'
description: '计算 Cramér 的 V，但使用偏差校正。'
---


# cramersVBiasCorrected

Cramér 的 V 是衡量表中两个列之间关联程度的指标。 [`cramersV` 函数](./cramersv.md) 的结果范围从 0（对应于变量之间没有关联）到 1，并且只有当每个值完全由另一个值决定时才能达到 1。这个函数可能存在很大的偏差，因此这个版本的 Cramér 的 V 使用了 [偏差校正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

``` sql
cramersVBiasCorrected(column1, column2)
```

**参数**

- `column1`: 第一个要比较的列。
- `column2`: 第二个要比较的列。

**返回值**

- 介于 0（对应于列值之间没有关联）和 1（完全关联）之间的值。

类型: 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间的关联程度较小。注意 `cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

查询：

``` sql
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
┌──────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.41171788506213564 │         0.33369281784141364 │
└─────────────────────┴─────────────────────────────┘
```
