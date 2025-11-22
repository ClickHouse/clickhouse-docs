---
description: 'Вычисляет XOR битмап-столбца и возвращает мощность множества типа UInt64. Если используется с суффиксом -State, то возвращает объект битмапа'
sidebar_position: 151
slug: /sql-reference/aggregate-functions/reference/groupbitmapxor
title: 'groupBitmapXor'
doc_type: 'reference'
---

# groupBitmapXor

`groupBitmapXor` вычисляет XOR столбца типа bitmap и возвращает его мощность (cardinality) в виде значения типа UInt64; при использовании с суффиксом -State возвращает [bitmap object](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmapXor(expr)
```

**Аргументы**

`expr` – выражение с результатом типа `AggregateFunction(groupBitmap, UInt*)`.

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

SELECT groupBitmapXor(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapXor(z)─┐
│              10   │
└───────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapXorState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapXorState(z)))─┐
│ [1,3,5,6,8,10,11,13,14,15]                       │
└──────────────────────────────────────────────────┘
```
