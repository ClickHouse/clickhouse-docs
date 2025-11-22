---
description: '一連の数値に対してビット単位の排他的論理和（`XOR`）を適用します。'
sidebar_position: 153
slug: /sql-reference/aggregate-functions/reference/groupbitxor
title: 'groupBitXor'
doc_type: 'reference'
---

# groupBitXor

数値の系列に対してビット単位の排他的論理和（`XOR`）演算を適用します。

```sql
groupBitXor(expr)
```

**引数**

`expr` – 結果が `UInt*` 型または `Int*` 型となる式。

**戻り値**

`UInt*` 型または `Int*` 型の値。

**例**

テストデータ:

```text
2進数      10進数
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

クエリ:

```sql
SELECT groupBitXor(num) FROM t
```

ここで、`num` はテストデータを格納している列です。

結果：

```text
2進数      10進数
01101000 = 104
```
