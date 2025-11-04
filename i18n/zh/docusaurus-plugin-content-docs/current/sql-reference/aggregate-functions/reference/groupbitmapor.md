---
'description': '对位图列进行OR计算，返回类型为UInt64的基数，如果添加后缀-State，则返回一个位图对象。这等同于`groupBitmapMerge`。'
'sidebar_position': 150
'slug': '/sql-reference/aggregate-functions/reference/groupbitmapor'
'title': 'groupBitmapOr'
'doc_type': 'reference'
---


# groupBitmapOr

计算一个位图列的 OR，返回类型为 UInt64 的基数，如果添加后缀 -State， 则返回一个 [bitmap object](../../../sql-reference/functions/bitmap-functions.md)。这相当于 `groupBitmapMerge`。

```sql
groupBitmapOr(expr)
```

**参数**

`expr` – 一个结果为 `AggregateFunction(groupBitmap, UInt*)` 类型的表达式。

**返回值**

UInt64 类型的值。

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
