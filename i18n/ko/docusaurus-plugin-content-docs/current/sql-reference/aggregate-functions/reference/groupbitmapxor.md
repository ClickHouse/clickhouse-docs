---
'description': '비트맵 컬럼의 XOR을 계산하고, UInt64 유형의 기수(카디널리티)를 반환합니다. -State 접미사와 함께 사용하면
  비트맵 객체를 반환합니다.'
'sidebar_position': 151
'slug': '/sql-reference/aggregate-functions/reference/groupbitmapxor'
'title': 'groupBitmapXor'
'doc_type': 'reference'
---


# groupBitmapXor

`groupBitmapXor`는 비트맵 컬럼의 XOR을 계산하며, UInt64 유형의 기수를 반환합니다. -State 접미사와 함께 사용되면 [비트맵 객체](../../../sql-reference/functions/bitmap-functions.md)를 반환합니다.

```sql
groupBitmapXor(expr)
```

**인수**

`expr` – `AggregateFunction(groupBitmap, UInt*)` 유형의 결과를 내는 표현식입니다.

**반환 값**

`UInt64` 유형의 값입니다.

**예제**

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
