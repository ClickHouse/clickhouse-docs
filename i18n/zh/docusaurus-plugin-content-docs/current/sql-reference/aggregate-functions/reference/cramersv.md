---
description: '`cramersV` 函数的结果范围为 0 到 1，其中 0 表示变量之间没有关联，只有在每个取值都被另一个变量的取值完全决定时才会达到 1。它可以被视为两个变量之间的关联程度，相对于其最大可能变动的百分比。'
sidebar_position: 127
slug: /sql-reference/aggregate-functions/reference/cramersv
title: 'cramersV'
doc_type: 'reference'
---

# cramersV

[Cramer&#39;s V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（有时也称为 Cramer&#39;s phi）是用于衡量表中两列之间关联程度的指标。`cramersV` 函数的结果范围为 0（表示变量之间没有关联）到 1，并且只有在每个值完全由另一个值决定时才会达到 1。它可以被视为两个变量之间的关联程度，相对于其最大可能变化的百分比。

:::note
关于偏差校正的 Cramer&#39;s V 版本，请参见：[cramersVBiasCorrected](./cramersvbiascorrected.md)
:::

**语法**

```sql
cramersV(column1, column2)
```

**参数**

* `column1`: 要比较的第一列。
* `column2`: 要比较的第二列。

**返回值**

* 一个介于 0（表示列值之间没有关联）到 1（表示完全关联）之间的值。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的这两列彼此之间没有任何关联，因此 `cramersV` 的结果为 0：

查询：

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 3 AS a,
            number % 5 AS b
        FROM
            numbers(150)
    );
```

结果：

```response
┌─cramersV(a, b)─┐
│              0 │
└────────────────┘
```

下面的两列之间具有相当紧密的关联性，因此 `cramersV` 的值较高：

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 10 AS a,
            if(number % 12 = 0, (number + 1) % 5, number % 5) AS b
        FROM
            numbers(150)
    );
```

结果：

```response
┌─────cramersV(a, b)─┐
│ 0.9066801892162646 │
└────────────────────┘
```
