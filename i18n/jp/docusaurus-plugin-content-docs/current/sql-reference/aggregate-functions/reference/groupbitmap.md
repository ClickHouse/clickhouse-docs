---
'description': 'Bitmapまたは符号なし整数カラムからの集計計算は、UInt64型の濃度を返します。-State接尾辞を追加すると、ビットマップオブジェクトが返されます。'
'sidebar_position': 148
'slug': '/sql-reference/aggregate-functions/reference/groupbitmap'
'title': 'groupBitmap'
---




# groupBitmap

ビットマップまたは未符号整数カラムからの集約計算で、UInt64型の基数を返します。-Stateサフィックスを追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)を返します。

```sql
groupBitmap(expr)
```

**引数**

`expr` – `UInt*`型の結果となる式。

**戻り値**

`UInt64`型の値。

**例**

テストデータ:

```text
UserID
1
1
2
3
```

クエリ:

```sql
SELECT groupBitmap(UserID) as num FROM t
```

結果:

```text
num
3
```
