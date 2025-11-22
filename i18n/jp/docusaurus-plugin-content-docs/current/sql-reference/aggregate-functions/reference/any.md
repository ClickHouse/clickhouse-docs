---
description: '列の最初に出現した値を選択します。'
sidebar_position: 102
slug: /sql-reference/aggregate-functions/reference/any
title: 'any'
doc_type: 'reference'
---

# any

列で最初に出現した値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は決定論的ではありません。
任意ではあるが決定論的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数が NULL を返すことはなく、入力列中の NULL 値は無視されます。
ただし、この関数を `RESPECT NULLS` 修飾子とともに使用した場合は、NULL かどうかに関係なく、読み取った最初の値を返します。

**構文**

```sql
any(カラム) [RESPECT NULLS]
```

エイリアス `any(column)`（`RESPECT NULLS` なし）

* `any_value`
* [`first_value`](../reference/first_value.md).

`any(column) RESPECT NULLS` のエイリアス

* `anyRespectNulls`, `any_respect_nulls`
* `firstValueRespectNulls`, `first_value_respect_nulls`
* `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**

* `column`: 列名。

**返される値**

最初に出現した値。

:::note
この関数の戻り値の型は、LowCardinality が除去される点を除き、入力と同じです。
つまり、入力として行が 0 件の場合、その型のデフォルト値（整数なら 0、Nullable() 列なら Null）を返します。
この挙動を変更するには、`-OrNull` [コンビネータ](../../../sql-reference/aggregate-functions/combinators.md) を使用できます。
:::

**実装の詳細**

場合によっては、実行順序に依存できます。
これは、`ORDER BY` を使用するサブクエリから `SELECT` が行われる場合に該当します。

`SELECT` クエリに `GROUP BY` 句、または少なくとも 1 つの集約関数が含まれる場合、ClickHouse は（MySQL とは対照的に）、`SELECT`、`HAVING`、`ORDER BY` 句内のすべての式が、キーまたは集約関数から計算されることを要求します。
言い換えると、テーブルから選択される各列は、キーとして、または集約関数の内部で使用されなければなりません。
MySQL のような挙動を得るには、その他の列を `any` 集約関数に含めることができます。

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
