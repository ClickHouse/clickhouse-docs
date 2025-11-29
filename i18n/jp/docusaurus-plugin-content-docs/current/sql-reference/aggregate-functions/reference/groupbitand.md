---
description: '数値列に対してビットごとの `AND` を適用します。'
sidebar_position: 147
slug: /sql-reference/aggregate-functions/reference/groupbitand
title: 'groupBitAnd'
doc_type: 'reference'
---

# groupBitAnd {#groupbitand}

数値の集合に対してビット単位の `AND` 演算を行います。

```sql
groupBitAnd(expr)
```

**引数**

`expr` – `UInt*` または `Int*` 型を結果とする式。

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

クエリ：

```sql
SELECT groupBitAnd(num) FROM t
```

ここで、`num` はテストデータが入っている列です。

結果：

```text
2進数      10進数
00000100 = 4
```
