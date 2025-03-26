---
description: 'Вычисляет XOR для столбца битовой карты и возвращает кардинальность типа UInt64; при использовании суффикса -State возвращает объект битовой карты.'
sidebar_position: 151
slug: /sql-reference/aggregate-functions/reference/groupbitmapxor
title: 'groupBitmapXor'
---


# groupBitmapXor

`groupBitmapXor` вычисляет XOR для столбца битовой карты и возвращает кардинальность типа UInt64; если используется суффикс -State, тогда он возвращает [объект битовой карты](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmapOr(expr)
```

**Аргументы**

`expr` – выражение, которое дает результат типа `AggregateFunction(groupBitmap, UInt*)`.

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

INSERT INTO bitmap_column_expr_test2 VALUES ('tag1', bitmapBuild(cast([1,2,3,4,5,6,7,8,9,10] as Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag2', bitmapBuild(cast([6,7,8,9,10,11,12,13,14,15] as Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag3', bitmapBuild(cast([2,4,6,8,10,12] as Array(UInt32))));

SELECT groupBitmapXor(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapXor(z)─┐
│              10   │
└───────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapXorState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapXorState(z)))─┐
│ [1,3,5,6,8,10,11,13,14,15]                       │
└──────────────────────────────────────────────────┘
```
