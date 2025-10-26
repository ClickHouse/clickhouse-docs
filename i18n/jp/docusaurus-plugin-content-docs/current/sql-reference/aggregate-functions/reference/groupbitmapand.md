---
'description': 'ビットマップカラムのANDを計算し、UInt64型の基数を返します。-Stateサフィックスを追加すると、ビットマップオブジェクトを返します。'
'sidebar_position': 149
'slug': '/sql-reference/aggregate-functions/reference/groupbitmapand'
'title': 'groupBitmapAnd'
'doc_type': 'reference'
---

ビットマップカラムのAND計算を行い、UInt64型の基数を返します。接尾辞-Stateを追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)が返されます。

```sql
groupBitmapAnd(expr)
```

**引数**

`expr` – `AggregateFunction(groupBitmap, UInt*)`型の結果となる式。

**戻り値**

UInt64型の値。

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
