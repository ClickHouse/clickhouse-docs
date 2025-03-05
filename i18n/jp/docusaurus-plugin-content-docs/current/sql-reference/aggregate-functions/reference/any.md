---
slug: /sql-reference/aggregate-functions/reference/any
sidebar_position: 102
title: "any"
description: "カラムの最初に遭遇した値を選択します。"
---


# any

カラムの最初に遭遇した値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は非決定的です。
任意だが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数はNULLを返さず、入力カラムのNULL値は無視します。
しかし、`RESPECT NULLS`修飾子と一緒に使用すると、NULLかどうかに関わらず最初の値を返します。

**構文**

```sql
any(column) [RESPECT NULLS]
```

`any(column)`（`RESPECT NULLS`なし）のエイリアス
- `any_value`
- [`first_value`](../reference/first_value.md)。

`any(column) RESPECT NULLS`のエイリアス
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**返される値**

最初に遭遇した値。

:::note
関数の返り値の型は入力と同じですが、LowCardinalityは除外されます。
これは、入力がゼロ行の場合、その型のデフォルト値（整数の場合は0、Nullable()カラムの場合はNull）が返されることを意味します。
この動作を変更するために、`-OrNull` [コンビネーター](../../../sql-reference/aggregate-functions/combinators.md) を使用することができます。
:::

**実装の詳細**

場合によっては、実行順序に依存できます。
これは、`SELECT`が`ORDER BY`を使用するサブクエリから来る場合に当てはまります。

`SELECT`クエリに`GROUP BY`句または少なくとも1つの集約関数がある場合、ClickHouseは（MySQLとは異なり）`SELECT`、`HAVING`、および`ORDER BY`句のすべての式がキーまたは集約関数から計算される必要があります。
言い換えれば、テーブルから選択された各カラムは、キーまたは集約関数内で使用されなければなりません。
MySQLのような動作を得るには、他のカラムを`any`集約関数の中に置くことができます。

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
