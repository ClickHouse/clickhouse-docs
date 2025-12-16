---
description: '对 bitmap 列进行 OR 运算，返回 UInt64 类型的基数。如果添加 -State 后缀，则返回一个 bitmap 对象。这等价于 `groupBitmapMerge`。'
sidebar_position: 150
slug: /sql-reference/aggregate-functions/reference/groupbitmapor
title: 'groupBitmapOr'
doc_type: 'reference'
---

# groupBitmapOr {#groupbitmapor}

计算位图列的按位或，并以 UInt64 类型返回其基数；如果添加后缀 -State，则返回一个 [bitmap 对象](../../../sql-reference/functions/bitmap-functions.md)。这等价于 `groupBitmapMerge`。

```sql
groupBitmapOr(expr)
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

SELECT groupBitmapOr(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapOr(z)─┐
│             15   │
└──────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapOrState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapOrState(z)))─┐
│ [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]           │
└─────────────────────────────────────────────────┘
```
