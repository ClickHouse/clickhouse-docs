---
slug: /sql-reference/aggregate-functions/reference/any
sidebar_position: 102
---

# any

カラムの最初に遭遇した値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は非決定的です。
任意ですが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数はNULLを返さず、すなわち入力カラムのNULL値を無視します。
ただし、`RESPECT NULLS` 修飾子を使用した場合は、NULLかどうかにかかわらず最初の値が返されます。

**構文**

```sql
any(column) [RESPECT NULLS]
```

`any(column)` の別名（`RESPECT NULLS` なし）
- `any_value`
- [`first_value`](../reference/first_value.md)。

`any(column) RESPECT NULLS` の別名
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**返される値**

最初に遭遇した値。

:::note
関数の返り値の型は入力と同じですが、LowCardinalityは破棄されます。
これは、入力として行がない場合、その型のデフォルト値（整数の場合は0、Nullable()カラムの場合はNull）が返されることを意味します。
この動作を変更するには、`-OrNull` [コンビネータ](../../../sql-reference/aggregate-functions/combinators.md) を使用することができます。
:::

**実装の詳細**

場合によっては、実行順序に依存することができます。
これは、`SELECT` が `ORDER BY` を使用したサブクエリから来る場合に適用されます。

`SELECT` クエリに `GROUP BY` 句または少なくとも1つの集計関数がある場合、ClickHouse（MySQLとは対照的に）は、`SELECT`、`HAVING` および `ORDER BY` 句内のすべての式がキーまたは集計関数から計算される必要があると要求します。
別の言い方をすると、テーブルから選択される各カラムは、キーまたは集計関数内で使用される必要があります。
MySQLのような動作を得たい場合は、他のカラムを `any` 集計関数に入れることができます。

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
