---
'description': '选择列的第一个遇到的值.'
'sidebar_position': 102
'slug': '/sql-reference/aggregate-functions/reference/any'
'title': 'any'
---




# any

选择列中第一个遇到的值。

:::warning
由于查询可以以任意顺序执行，因此此函数的结果是非确定性的。
如果您需要一个任意但确定的结果，请使用函数 [`min`](../reference/min.md) 或 [`max`](../reference/max.md)。
:::

默认情况下，该函数永远不会返回 NULL，即忽略输入列中的 NULL 值。
然而，如果函数与 `RESPECT NULLS` 修饰符一起使用，则无论是否为 NULL，都会返回读取到的第一个值。

**语法**

```sql
any(column) [RESPECT NULLS]
```

别名 `any(column)` （不带 `RESPECT NULLS`）
- `any_value`
- [`first_value`](../reference/first_value.md)。

`any(column) RESPECT NULLS` 的别名
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**参数**
- `column`: 列名。

**返回值**

遇到的第一个值。

:::note
该函数的返回类型与输入类型相同，低基数类型会被丢弃。
这意味着在没有行作为输入时，它将返回该类型的默认值（对于整数为 0，对于 Nullable() 列为 Null）。
您可以使用 `-OrNull` [组合子](../../../sql-reference/aggregate-functions/combinators.md) 来修改此行为。
:::

**实现细节**

在某些情况下，您可以依赖执行顺序。
这适用于 `SELECT` 来自使用 `ORDER BY` 的子查询的情况。

当一个 `SELECT` 查询包含 `GROUP BY` 子句或至少包含一个聚合函数时，ClickHouse（与 MySQL 相对）要求 `SELECT`、`HAVING` 和 `ORDER BY` 子句中的所有表达式均从键或聚合函数计算得出。
换句话说，从表中选择的每个列必须要么在键中使用，要么在聚合函数中使用。
为了获得类似 MySQL 的行为，您可以将其他列放入 `any` 聚合函数中。

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
