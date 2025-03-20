---
slug: /sql-reference/aggregate-functions/reference/groupbitmapand
sidebar_position: 149
title: groupBitmapAnd
description: "Вычисление AND колонки битовой карты, возвращает кардинальность типа UInt64, если добавить суффикс -State, то вернуть объект [битовой карты](../../../sql-reference/functions/bitmap-functions.md)."
---

Вычисление AND колонки битовой карты, возвращает кардинальность типа UInt64, если добавить суффикс -State, то вернуть [битовой карты](../../../sql-reference/functions/bitmap-functions.md).

``` sql
groupBitmapAnd(expr)
```

**Аргументы**

`expr` – Выражение, результатом которого является тип `AggregateFunction(groupBitmap, UInt*)`.

**Возвращаемое значение**

Значение типа `UInt64`.

**Пример**

``` sql
DROP TABLE IF EXISTS bitmap_column_expr_test2;
CREATE TABLE bitmap_column_expr_test2
(
    tag_id String,
    z AggregateFunction(groupBitmap, UInt32)
)
ENGINE = MergeTree
ORDER BY tag_id;

INSERT INTO bitmap_column_expr_test2 VALUES ('tag1', bitmapBuild(cast([1,2,3,4,5,6,7,8,9,10] as Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag2', bitmapBuild(cast([6,7,8,9,10,11,12,13,14,15] as Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag3', bitmapBuild(cast([2,4,6,8,10,12] as Array(UInt32))));

SELECT groupBitmapAnd(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapAnd(z)─┐
│               3   │
└───────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapAndState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapAndState(z)))─┐
│ [6,8,10]                                         │
└──────────────────────────────────────────────────┘
```
