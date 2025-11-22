---
description: '一連の数値に対してビット単位の OR 演算を適用します。'
sidebar_position: 152
slug: /sql-reference/aggregate-functions/reference/groupbitor
title: 'groupBitOr'
doc_type: 'reference'
---

# groupBitOr

一連の数値にビット単位の `OR` 演算を適用します。

```sql
groupBitOr(expr)
```

**引数**

`expr` – 結果として `UInt*` または `Int*` 型となる式。

**戻り値**

`UInt*` または `Int*` 型の値。

**例**

テストデータ：

```text
2進数      10進数
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

クエリ：

```sql
SELECT groupBitOr(num) FROM t
```

ここで、`num` はテストデータが入っている列です。

結果:

```text
2進数      10進数
01111101 = 125
```
