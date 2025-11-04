---
'description': 'ビットマップまたは非符号整数カラムからの集計計算。UInt64型のカーディナリティを返します。サフィックス-Stateを追加すると、ビットマップオブジェクトを返します。'
'sidebar_position': 148
'slug': '/sql-reference/aggregate-functions/reference/groupbitmap'
'title': 'groupBitmap'
'doc_type': 'reference'
---


# groupBitmap

符号なし整数カラムからのビットマップまたは集約計算で、UInt64型の基数を返します。サフィックス-Stateを追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)を返します。

```sql
groupBitmap(expr)
```

**引数**

`expr` – `UInt*` 型の結果を生成する式。

**戻り値**

`UInt64` 型の値。

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
SELECT groupBitmap(UserID) AS num FROM t
```

結果:

```text
num
3
```
