---
description: 'カラムの最初に出会った値を選択します。'
sidebar_position: 102
slug: /sql-reference/aggregate-functions/reference/any
title: 'any'
---


# any

カラムの最初に出会った値を選択します。

:::warning
クエリは任意の順序で実行できるため、この関数の結果は非決定的です。
任意のランダムですが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数は NULL を返さず、つまり、入力カラム内の NULL 値を無視します。
ただし、関数が `RESPECT NULLS` 修飾子と一緒に使用されると、NULL かどうかにかかわらず、最初に読み込まれた値を返します。

**構文**

```sql
any(column) [RESPECT NULLS]
```

エイリアス `any(column)`（`RESPECT NULLS` なし）
- `any_value`
- [`first_value`](../reference/first_value.md).

エイリアス `any(column) RESPECT NULLS`
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**返される値**

最初に出会った値。

:::note
関数の返り値の型は入力と同じですが、LowCardinality は除外されます。
これは、行が入力としてない場合、型のデフォルト値（整数の場合は 0、Nullable() カラムの場合は Null）を返すことを意味します。
この動作を変更するために、`-OrNull` [コンビネータ](../../../sql-reference/aggregate-functions/combinators.md) を使用できます。
:::

**実装の詳細**

いくつかのケースでは、実行順序に依存できます。
これは、`SELECT` が `ORDER BY` を使用するサブクエリから来る場合に該当します。

`SELECT` クエリに `GROUP BY` 句や少なくとも 1 つの集約関数がある場合、ClickHouse は（MySQL と対照的に）`SELECT`、`HAVING`、および `ORDER BY` 句のすべての式が主キーまたは集約関数から計算されることを要求します。
言い換えれば、テーブルから選択された各カラムは、主キーまたは集約関数内で使用する必要があります。
MySQL のような動作を得るには、他のカラムを `any` 集約関数に入れることができます。

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
