---
description: '符号なし整数カラムからのビットマップまたは集計計算、UInt64型のカーディナリティを返し、サフィックス-Stateを追加すると、ビットマップオブジェクトを返します。'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
---


# groupBitmap

符号なし整数カラムからのビットマップまたは集計計算、UInt64型のカーディナリティを返し、サフィックス-Stateを追加すると、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md)を返します。

```sql
groupBitmap(expr)
```

**引数**

`expr` – `UInt*` 型の結果を生成する式です。

**戻り値**

`UInt64`型の値です。

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
