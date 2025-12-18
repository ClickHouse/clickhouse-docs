---
description: 'Выполняет операцию OR над битмап-столбцом и возвращает кардинальность типа UInt64; при добавлении суффикса -State возвращает объект битмапа. Эквивалентна функции `groupBitmapMerge`.'
sidebar_position: 150
slug: /sql-reference/aggregate-functions/reference/groupbitmapor
title: 'groupBitmapOr'
doc_type: 'reference'
---

# groupBitmapOr {#groupbitmapor}

Вычисляет побитовое OR для битмап-столбца, возвращает мощность множества типа UInt64; если добавить суффикс `-State`, то возвращается [объект bitmap](../../../sql-reference/functions/bitmap-functions.md). Эквивалентно `groupBitmapMerge`.

```sql
groupBitmapOr(expr)
```

**Аргументы**

`expr` – выражение, результат вычисления которого имеет тип `AggregateFunction(groupBitmap, UInt*)`.

**Возвращаемое значение**

Значение типа `UInt64`.

**Пример**

```sql
DROP TABLE IF EXISTS bitmap_column_expr_test2;
CREATE TABLE bitmap_column_expr_test2
(
    tag_id String,
    z AggregateFunction(groupBitmap, UInt32)
)
ENGINE = MergeTree
ORDER BY tag_id;

INSERT INTO bitmap_column_expr_test2 VALUES ('tag1', bitmapBuild(cast([1,2,3,4,5,6,7,8,9,10] AS Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag2', bitmapBuild(cast([6,7,8,9,10,11,12,13,14,15] AS Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag3', bitmapBuild(cast([2,4,6,8,10,12] AS Array(UInt32))));

SELECT groupBitmapOr(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapOr(z)─┐
│             15   │
└──────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapOrState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapOrState(z)))─┐
│ [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]           │
└─────────────────────────────────────────────────┘
```
