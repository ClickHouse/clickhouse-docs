---
description: '计算位图列的按位与，并返回 UInt64 类型的基数；如果增加后缀 -State，则返回位图对象。'
sidebar_position: 149
slug: /sql-reference/aggregate-functions/reference/groupbitmapand
title: 'groupBitmapAnd'
doc_type: 'reference'
---

计算位图列的按位与，并返回 UInt64 类型的基数；如果增加后缀 -State，则返回 [bitmap 对象](../../../sql-reference/functions/bitmap-functions.md)。

```sql
groupBitmapAnd(expr)
```

**参数**

`expr` – 结果类型为 `AggregateFunction(groupBitmap, UInt*)` 的表达式。

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

SELECT groupBitmapAnd(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapAnd(z)─┐
│               3   │
└───────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapAndState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapAndState(z)))─┐
│ [6,8,10]                                         │
└──────────────────────────────────────────────────┘
```
