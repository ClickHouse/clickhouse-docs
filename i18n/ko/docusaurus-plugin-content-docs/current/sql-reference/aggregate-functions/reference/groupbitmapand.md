---
'description': '비트맵 컬럼의 AND 계산, UInt64 유형의 기본 키 수를 반환하며, -State 접미사를 추가하면 비트맵 객체를
  반환합니다.'
'sidebar_position': 149
'slug': '/sql-reference/aggregate-functions/reference/groupbitmapand'
'title': 'groupBitmapAnd'
'doc_type': 'reference'
---

계산은 비트맵 컬럼의 AND를 수행하며, UInt64 유형의 기수(cardinality)를 반환합니다. 접미사 -State를 추가하면 [비트맵 객체](../../../sql-reference/functions/bitmap-functions.md)를 반환합니다.

```sql
groupBitmapAnd(expr)
```

**인수**

`expr` – `AggregateFunction(groupBitmap, UInt*)` 유형의 결과를 생성하는 표현식입니다.

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

SELECT groupBitmapAnd(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapAnd(z)─┐
│               3   │
└───────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapAndState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapAndState(z)))─┐
│ [6,8,10]                                         │
└──────────────────────────────────────────────────┘
```
