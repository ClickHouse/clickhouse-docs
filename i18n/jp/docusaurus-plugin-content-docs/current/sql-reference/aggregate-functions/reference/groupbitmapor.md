---
slug: /sql-reference/aggregate-functions/reference/groupbitmapor
sidebar_position: 150
title: groupBitmapOr
description: "ビットマップカラムのORを計算し、型UInt64の基数を返します。サフィックス-Stateを追加すると、ビットマップオブジェクトを返します。これは`groupBitmapMerge`と同等です。"
---


# groupBitmapOr

ビットマップカラムのORを計算し、型UInt64の基数を返します。サフィックス-Stateを追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)を返します。これは`groupBitmapMerge`と同等です。

``` sql
groupBitmapOr(expr)
```

**引数**

`expr` – 結果が `AggregateFunction(groupBitmap, UInt*)` 型になる式。

**戻り値**

`UInt64` 型の値。

**例**

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

SELECT groupBitmapOr(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapOr(z)─┐
│             15   │
└──────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapOrState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapOrState(z)))─┐
│ [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]           │
└─────────────────────────────────────────────────┘
```
