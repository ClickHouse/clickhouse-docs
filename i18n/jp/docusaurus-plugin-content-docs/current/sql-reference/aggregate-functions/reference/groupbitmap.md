---
description: '符号なし整数列に対するビットマップまたは集約計算を行い、UInt64 型の基数（要素数）を返します。サフィックスに -State を付けた場合は、ビットマップオブジェクトを返します。'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
doc_type: 'reference'
---

# groupBitmap {#groupbitmap}

符号なし整数列に対してビットマップまたは集計計算を実行し、`UInt64` 型のカーディナリティ値を返します。サフィックスとして `-State` を付けた場合は、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md) を返します。

```sql
groupBitmap(expr)
```

**引数**

`expr` – 評価結果が `UInt*` 型となる式。

**戻り値**

`UInt64` 型の値。

**例**

テストデータ：

```text
UserID
1
1
2
3
```

クエリ：

```sql
SELECT groupBitmap(UserID) AS num FROM t
```

結果:

```text
num
3
```
