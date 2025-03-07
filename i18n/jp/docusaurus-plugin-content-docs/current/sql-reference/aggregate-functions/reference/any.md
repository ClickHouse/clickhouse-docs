---
slug: /sql-reference/aggregate-functions/reference/any
sidebar_position: 102
title: 'any'
description: 'カラムの最初に遭遇した値を選択します。'
---


# any

カラムの最初に遭遇した値を選択します。

:::warning
クエリは任意の順序で実行できるため、この関数の結果は非決定的です。 決定的な結果が必要な場合は、関数 [`min`](../reference/min.md) または [`max`](../reference/max.md) を使用してください。
:::

デフォルトでは、この関数は NULL を返さず、つまり入力カラムの NULL 値を無視します。 ただし、`RESPECT NULLS` 修飾子を使用した場合、NULL であろうとないとにかかわらず、最初に読まれた値が返されます。

**構文**

```sql
any(column) [RESPECT NULLS]
```

エイリアス `any(column)`（`RESPECT NULLS` なし）
- `any_value`
- [`first_value`](../reference/first_value.md)。

エイリアス `any(column) RESPECT NULLS`
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**返される値**

最初に遭遇した値。

:::note
関数の戻り値の型は入力と同じですが、LowCardinality は無視されます。 これは、入力として行がない場合、その型のデフォルト値（整数の場合は 0、Nullable() カラムの場合は Null）が返されることを意味します。 この動作を修正するには、`-OrNull` [コンビネータ](../../../sql-reference/aggregate-functions/combinators.md) を使用できます。
:::

**実装の詳細**

場合によっては、実行の順序に依存できます。 これは、`SELECT` が `ORDER BY` を使用するサブクエリから来る場合に当てはまります。

`SELECT` クエリに `GROUP BY` 句または少なくとも一つの集約関数がある場合、ClickHouse（MySQLとは対照的に）は、`SELECT`、`HAVING`、`ORDER BY` 句内のすべての式がキーまたは集約関数から計算される必要があります。 言い換えれば、テーブルから選択された各カラムは、キーのいずれかまたは集約関数の内部で使用されなければなりません。 MySQLのような動作を得るには、他のカラムを `any` 集約関数に入れることができます。

**例**

クエリ:

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
