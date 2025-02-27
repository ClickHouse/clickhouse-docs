---
slug: /sql-reference/aggregate-functions/reference/groupbitmap
sidebar_position: 148
---

# groupBitmap

ビットマップまたは未符号整数カラムからの集計計算を行います。タイプは `UInt64` のカーディナリティを返します。サフィックス `-State` を追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)が返されます。

``` sql
groupBitmap(expr)
```

**引数**

`expr` – `UInt*` タイプの結果を生成する式。

**返り値**

`UInt64` タイプの値。

**例**

テストデータ:

``` text
UserID
1
1
2
3
```

クエリ:

``` sql
SELECT groupBitmap(UserID) as num FROM t
```

結果:

``` text
num
3
```
