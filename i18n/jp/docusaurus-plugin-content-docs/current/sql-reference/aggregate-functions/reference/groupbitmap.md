---
description: '符号なし整数型カラムを対象にビットマップまたは集約計算を行い、型 UInt64 の基数（cardinality）を返します。末尾に -State サフィックスを付けた場合は、ビットマップオブジェクトを返します。'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
doc_type: 'reference'
---

# groupBitmap

符号なし整数型のカラムに対してビットマップまたは集約の計算を行い、`UInt64` 型の要素数を返します。サフィックスとして `-State` を付けた場合は、[ビットマップオブジェクト](../../../sql-reference/functions/bitmap-functions.md) を返します。

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
