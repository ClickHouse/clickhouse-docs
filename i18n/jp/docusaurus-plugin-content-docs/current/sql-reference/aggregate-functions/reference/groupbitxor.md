---
'description': '数値の系列に対してビット単位の `XOR` を適用します。'
'sidebar_position': 153
'slug': '/sql-reference/aggregate-functions/reference/groupbitxor'
'title': 'groupBitXor'
'doc_type': 'reference'
---


# groupBitXor

シリーズの数値に対してビット単位の `XOR` を適用します。

```sql
groupBitXor(expr)
```

**引数**

`expr` – `UInt*` または `Int*` 型になる式。

**戻り値**

`UInt*` または `Int*` 型の値。

**例**

テストデータ:

```text
binary     decimal
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

クエリ:

```sql
SELECT groupBitXor(num) FROM t
```

ここで `num` はテストデータを含むカラムです。

結果:

```text
binary     decimal
01101000 = 104
```
