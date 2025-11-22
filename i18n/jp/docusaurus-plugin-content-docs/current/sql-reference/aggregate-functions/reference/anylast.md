---
description: '列で最後に出現した値を選択します。'
sidebar_position: 105
slug: /sql-reference/aggregate-functions/reference/anylast
title: 'anyLast'
doc_type: 'reference'
---

# anyLast

列内で最後に出現した値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は非決定的です。
値は任意だが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数が NULL を返すことはなく、入力列中の NULL 値は無視されます。
ただし、`RESPECT NULLS` 修飾子とともに使用された場合は、NULL かどうかに関係なく、最初に読み取った値を返します。

**構文**

```sql
anyLast(column) [RESPECT NULLS]
```

エイリアス `anyLast(column)`（`RESPECT NULLS` なし）

* [`last_value`](../reference/last_value.md)。

`anyLast(column) RESPECT NULLS` のエイリアス

* `anyLastRespectNulls`, `anyLast_respect_nulls`
* `lastValueRespectNulls`, `last_value_respect_nulls`

**パラメータ**

* `column`: 列名。

**戻り値**

* 最後に出現した値。

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
