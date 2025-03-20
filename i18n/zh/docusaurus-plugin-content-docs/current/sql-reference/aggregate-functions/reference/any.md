---
slug: /sql-reference/aggregate-functions/reference/any
sidebar_position: 102
title: 'any'
description: '选择列中第一个遇到的值。'
---


# any

选择列中第一个遇到的值。

:::warning
由于查询可以以任意顺序执行，因此该函数的结果是不确定的。
如果需要一个任意但确定的结果，请使用函数 [`min`](../reference/min.md) 或 [`max`](../reference/max.md)。
:::

默认情况下，该函数永远不会返回 NULL，即忽略输入列中的 NULL 值。
但是，如果使用 `RESPECT NULLS` 修饰符，则无论是否为 NULL，都会返回第一个读取的值。

**语法**

```sql
any(column) [RESPECT NULLS]
```

`any(column)` 的别名（不带 `RESPECT NULLS`）
- `any_value`
- [`first_value`](../reference/first_value.md)。

`any(column) RESPECT NULLS` 的别名
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**参数**
- `column`: 列名。

**返回值**

第一个遇到的值。

:::note
该函数的返回类型与输入类型相同，但低基数类型会被丢弃。
这意味着在没有行作为输入时，它将返回该类型的默认值（整数为 0，或 Nullable() 列为 Null）。
您可以使用 `-OrNull` [组合器](../../../sql-reference/aggregate-functions/combinators.md) 来修改此行为。
:::

**实现细节**

在某些情况下，您可以依赖执行顺序。
这适用于 `SELECT` 来自使用 `ORDER BY` 的子查询的情况。

当 `SELECT` 查询包含 `GROUP BY` 子句或至少一个聚合函数时，ClickHouse（与 MySQL 相对）要求 `SELECT`、`HAVING` 和 `ORDER BY` 子句中的所有表达式都必须从键或聚合函数计算得出。
换句话说，从表中选择的每一列都必须在键或聚合函数内使用。
要获得类似 MySQL 的行为，您可以将其他列放入 `any` 聚合函数中。

**示例**

查询：

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES (NULL), ('Amsterdam'), ('New York'), ('Tokyo'), ('Valencia'), (NULL);

SELECT any(city), anyRespectNulls(city) FROM tab;
```

```response
┌─any(city)─┬─anyRespectNulls(city)─┐
│ Amsterdam │ ᴺᵁᴸᴸ                  │
└───────────┴───────────────────────┘
```
