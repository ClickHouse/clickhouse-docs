---
'description': '複数の数値にビット単位の `OR` を適用します。'
'sidebar_position': 152
'slug': '/sql-reference/aggregate-functions/reference/groupbitor'
'title': 'groupBitOr'
'doc_type': 'reference'
---


# groupBitOr

一連の数値にビット単位の `OR` を適用します。

```sql
groupBitOr(expr)
```

**引数**

`expr` – `UInt*` または `Int*` 型の結果を返す式です。

**返される値**

`UInt*` または `Int*` 型の値です。

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
SELECT groupBitOr(num) FROM t
```

ここで、`num` はテストデータを含むカラムです。

結果:

```text
binary     decimal
01111101 = 125
```
