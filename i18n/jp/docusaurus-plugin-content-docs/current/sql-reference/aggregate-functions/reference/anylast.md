---
slug: /sql-reference/aggregate-functions/reference/anylast
sidebar_position: 105
title: "anyLast"
description: "列の最後に出会った値を選択します。"
---


# anyLast

列の最後に出会った値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は非決定的です。
任意の決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数はNULLを返さないため、入力カラム内のNULL値を無視します。
ただし、`RESPECT NULLS` 修飾子を使用した場合、この関数はNULLであろうとなかろうと最初に読み取った値を返します。

**構文**

```sql
anyLast(column) [RESPECT NULLS]
```

エイリアス `anyLast(column)` ( `RESPECT NULLS` なし )
- [`last_value`](../reference/last_value.md).

`anyLast(column) RESPECT NULLS` のエイリアス
- `anyLastRespectNulls`, `anyLast_respect_nulls`
- `lastValueRespectNulls`, `last_value_respect_nulls`

**パラメーター**
- `column`: カラム名。

**返される値**

- 最後に出会った値。

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
