---
description: 'カラムの最初に出会った値を選択します。'
sidebar_position: 102
slug: '/sql-reference/aggregate-functions/reference/any'
title: 'any'
---




# any

カラムの最初に出会った値を選択します。

:::warning
クエリは任意の順序で実行できるため、この関数の結果は非決定的です。
任意だが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数はNULLを返さず、入力カラムのNULL値を無視します。
ただし、`RESPECT NULLS` モディファイアと共に使用されると、NULLであっても最初に読み取られた値を返します。

**構文**

```sql
any(column) [RESPECT NULLS]
```

エイリアス `any(column)`（`RESPECT NULLS` なし）
- `any_value`
- [`first_value`](../reference/first_value.md)

`any(column) RESPECT NULLS` のエイリアス
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**戻り値**

最初に出会った値。

:::note
関数の戻り値の型は入力と同じですが、LowCardinality は破棄されます。
つまり、入力として行がない場合、その型のデフォルト値（整数の場合は0、Nullable() カラムの場合はNull）が返されます。
この動作を変更するには、`-OrNull` [コンビネータ](../../../sql-reference/aggregate-functions/combinators.md) を使用できます。
:::

**実装の詳細**

場合によっては、実行順序に依存できます。
これは、`SELECT` が `ORDER BY` を使用したサブクエリから来る場合に当てはまります。

`SELECT` クエリに `GROUP BY` 句または少なくとも1つの集計関数が含まれている場合、ClickHouse は（MySQL と対照的に）`SELECT`、`HAVING`、および `ORDER BY` 句のすべての式がキーまたは集計関数から計算されることを要求します。
言い換えれば、テーブルから選択された各カラムは、キーまたは集計関数の内側で使用されなければなりません。
MySQL のような動作を得るには、他のカラムを `any` 集計関数の中に置くことができます。

**例**

クエリ：

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
