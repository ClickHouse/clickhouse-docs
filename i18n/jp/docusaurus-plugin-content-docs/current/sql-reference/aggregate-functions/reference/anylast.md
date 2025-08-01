---
description: 'Selects the last encountered value of a column.'
sidebar_position: 105
slug: '/sql-reference/aggregate-functions/reference/anylast'
title: 'anyLast'
---




# anyLast

カラムの最後に遭遇した値を選択します。

:::warning
クエリは任意の順序で実行できるため、この関数の結果は非決定的です。
任意ですが決定的な結果が必要な場合は、関数 [`min`](../reference/min.md) または [`max`](../reference/max.md) を使用してください。
:::

デフォルトでは、この関数はNULLを返すことはなく、つまり入力カラム内のNULL値を無視します。
ただし、`RESPECT NULLS` 修飾子を使用して関数を呼び出すと、NULLであろうと構わずに最初に読み取った値を返します。

**構文**

```sql
anyLast(column) [RESPECT NULLS]
```

エイリアス `anyLast(column)` ( `RESPECT NULLS` なし)
- [`last_value`](../reference/last_value.md).

`anyLast(column) RESPECT NULLS` のエイリアス
- `anyLastRespectNulls`, `anyLast_respect_nulls`
- `lastValueRespectNulls`, `last_value_respect_nulls`

**パラメーター**
- `column`: カラム名。

**返される値**

- 最後に遭遇した値。

**例**

クエリ:

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES ('Amsterdam'),(NULL),('New York'),('Tokyo'),('Valencia'),(NULL);

SELECT anyLast(city), anyLastRespectNulls(city) FROM tab;
```

```response
┌─anyLast(city)─┬─anyLastRespectNulls(city)─┐
│ Valencia      │ ᴺᵁᴸᴸ                      │
└───────────────┴───────────────────────────┘
```
