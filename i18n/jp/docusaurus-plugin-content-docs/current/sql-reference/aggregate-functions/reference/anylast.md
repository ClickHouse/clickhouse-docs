---
description: '列で最後に現れた値を選択します。'
sidebar_position: 105
slug: /sql-reference/aggregate-functions/reference/anylast
title: 'anyLast'
doc_type: 'reference'
---

# anyLast

列で最後に出現した値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は決定的ではありません。
任意の値でよいが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数は NULL を返しません。つまり、入力列中の NULL 値は無視されます。
ただし、`RESPECT NULLS` 修飾子とともに使用された場合、NULL かどうかに関わらず、読み取った最初の値を返します。

**構文**

```sql
anyLast(カラム) [RESPECT NULLS]
```

別名 `anyLast(column)`（`RESPECT NULLS` なし）

* [`last_value`](../reference/last_value.md)

`anyLast(column) RESPECT NULLS` の別名

* `anyLastRespectNulls`, `anyLast_respect_nulls`
* `lastValueRespectNulls`, `last_value_respect_nulls`

**パラメータ**

* `column`: 列名。

**返り値**

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
