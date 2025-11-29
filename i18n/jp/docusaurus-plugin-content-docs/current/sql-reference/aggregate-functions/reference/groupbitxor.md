---
description: '一連の数値に対してビット単位の `XOR` を適用します。'
sidebar_position: 153
slug: /sql-reference/aggregate-functions/reference/groupbitxor
title: 'groupBitXor'
doc_type: 'reference'
---

# groupBitXor {#groupbitxor}

一連の数値に対してビット単位の `XOR` 演算を適用します。

```sql
groupBitXor(expr)
```

**引数**

`expr` – 評価結果が `UInt*` または `Int*` 型となる式。

**戻り値**

`UInt*` または `Int*` 型の値。

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

ここで `num` はテストデータが入っている列です。

結果：

```text
2進数      10進数
01101000 = 104
```
