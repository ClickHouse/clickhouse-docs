---
slug: /sql-reference/aggregate-functions/reference/groupbitmap
sidebar_position: 148
title: "groupBitmap"
description: "無符号整数カラムからのビットマップまたは集約計算。UInt64タイプの基数を返し、-Stateサフィックスを追加するとビットマップオブジェクトを返す。"
---


# groupBitmap

無符号整数カラムからのビットマップまたは集約計算。UInt64タイプの基数を返し、-Stateサフィックスを追加すると [ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md) を返す。

``` sql
groupBitmap(expr)
```

**引数**

`expr` – `UInt*`タイプを生成する式。

**戻り値**

`UInt64`タイプの値。

**例**

テストデータ：

``` text
UserID
1
1
2
3
```

クエリ：

``` sql
SELECT groupBitmap(UserID) as num FROM t
```

結果：

``` text
num
3
```
