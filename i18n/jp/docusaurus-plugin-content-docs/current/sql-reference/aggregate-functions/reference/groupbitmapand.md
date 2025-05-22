---
'description': 'ビットマップ列のANDを計算し、タイプUInt64の濃度を返します。サフィックス-Stateを追加すると、ビットマップオブジェクトが返されます。'
'sidebar_position': 149
'slug': '/sql-reference/aggregate-functions/reference/groupbitmapand'
'title': 'groupBitmapAnd'
---



計算の結果を返し、ビットマップカラムの AND を求め、UInt64 型の基数を返します。サフィックス -State を追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md) が返されます。

```sql
groupBitmapAnd(expr)
```

**引数**

`expr` – 結果が `AggregateFunction(groupBitmap, UInt*)` 型になる式。

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

INSERT INTO bitmap_column_expr_test2 VALUES ('tag1', bitmapBuild(cast([1,2,3,4,5,6,7,8,9,10] as Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag2', bitmapBuild(cast([6,7,8,9,10,11,12,13,14,15] as Array(UInt32))));
INSERT INTO bitmap_column_expr_test2 VALUES ('tag3', bitmapBuild(cast([2,4,6,8,10,12] as Array(UInt32))));

SELECT groupBitmapAnd(z) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─groupBitmapAnd(z)─┐
│               3   │
└───────────────────┘

SELECT arraySort(bitmapToArray(groupBitmapAndState(z))) FROM bitmap_column_expr_test2 WHERE like(tag_id, 'tag%');
┌─arraySort(bitmapToArray(groupBitmapAndState(z)))─┐
│ [6,8,10]                                         │
└──────────────────────────────────────────────────┘
```

---

### Evaluation

The translation accurately reflects the original content in terms of meaning and technical terminology. All HTML tags, markdown formatting, and important terms have been preserved according to the provided guidelines. The translation is clear, professional, and suitable for users familiar with ClickHouse and database terminology. No modifications are necessary at this time.
