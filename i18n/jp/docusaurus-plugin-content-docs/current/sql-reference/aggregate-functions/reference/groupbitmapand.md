---
description: 'ビットマップ列の論理積 (AND) を計算し、型 UInt64 の基数 (cardinality) を返します。-State サフィックスを付けた場合は、ビットマップオブジェクトを返します。'
sidebar_position: 149
slug: /sql-reference/aggregate-functions/reference/groupbitmapand
title: 'groupBitmapAnd'
doc_type: 'reference'
---

ビットマップ列の論理積 (AND) を計算し、型 UInt64 の基数 (cardinality) を返します。-State サフィックスを付けた場合は、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)を返します。

```sql
groupBitmapAnd(expr)
```

**引数**

`expr` – 評価結果が `AggregateFunction(groupBitmap, UInt*)` 型となる式。

**戻り値**

`UInt64` 型の値。

**例**

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
