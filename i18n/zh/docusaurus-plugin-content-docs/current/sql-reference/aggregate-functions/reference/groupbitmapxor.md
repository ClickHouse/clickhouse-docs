---
description: '计算 bitmap 列的按位异或值，并返回其基数（UInt64 类型）；如果使用后缀 -State，则返回 bitmap 对象'
sidebar_position: 151
slug: /sql-reference/aggregate-functions/reference/groupbitmapxor
title: 'groupBitmapXor'
doc_type: 'reference'
---

# groupBitmapXor

`groupBitmapXor` 计算一个 bitmap 列的按位异或，并返回其基数，类型为 UInt64。如果使用后缀 -State，则返回一个 [bitmap 对象](../../../sql-reference/functions/bitmap-functions.md)。

```sql
groupBitmapXor(expr)
```

**参数**

`expr` – 其结果类型为 `AggregateFunction(groupBitmap, UInt*)` 的表达式。

**返回值**

`UInt64` 类型的值。

**示例**

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
