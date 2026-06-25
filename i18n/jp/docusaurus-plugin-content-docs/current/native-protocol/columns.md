---
slug: /native-protocol/columns
sidebar_position: 4
title: 'ネイティブプロトコルのカラム型'
description: 'ネイティブプロトコルのカラム型'
keywords: ['ネイティブプロトコルのカラム', 'カラム型', 'データ型', 'プロトコルのデータ型', 'バイナリエンコーディング']
doc_type: 'reference'
---

一般的なリファレンスについては、[Data Types](/sql-reference/data-types/)を参照してください。

:::tip
数値型のエンコーディングは、AMD64 や ARM64 などのリトルエンディアン CPU のメモリレイアウトに一致しているため、非常に効率よくエンコードおよびデコードできます。
:::

| Type                                                            | Encoding                                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **整数** ([Int/UInt](/sql-reference/data-types/int-uint))         | リトルエンディアンの 8、16、32、64、128、または 256 ビット                                                                                |
| **浮動小数点数** ([Float32/Float64](/sql-reference/data-types/float)) | IEEE 754 のバイナリ表現                                                                                                     |
| [String](/sql-reference/data-types/string)                      | 文字列の配列。各要素は `(len, value)`                                                                                           |
| [FixedString(N)](/sql-reference/data-types/fixedstring)         | N バイトのシーケンスの配列                                                                                                       |
| [IPv4](/sql-reference/data-types/ipv4)                          | `UInt32` の別名で、UInt32 として表現されます                                                                                       |
| [IPv6](/sql-reference/data-types/ipv6)                          | `FixedString(16)` の別名で、バイナリとして表現されます                                                                                 |
| [Tuple](/sql-reference/data-types/tuple)                        | 連続してエンコードされたカラムの配列。例: `Tuple(String, UInt8)` = 連続する 2 つのカラム                                                          |
| [Map](/sql-reference/data-types/map)                            | `Map(K, V)` = 3 つのカラム: `Offsets ColUInt64, Keys K, Values V`。Keys/Values の行数 = 最後の Offsets 値                         |
| [Array](/sql-reference/data-types/array)                        | `Array(T)` = 2 つのカラム: `Offsets ColUInt64, Data T`。Data の行数 = 最後の Offsets 値                                           |
| [Nullable](/sql-reference/data-types/nullable)                  | `Nullable(T)` = 2 つのカラム: `Nulls ColUInt8, Values T`。行数は同じです。Nulls はマスクです: 1=null、0=value                             |
| [UUID](/sql-reference/data-types/uuid)                          | `FixedString(16)` の別名で、バイナリとして表現されます                                                                                 |
| [Enum](/sql-reference/data-types/enum)                          | `Int8` または `Int16` の別名で、各整数が String 値に対応付けられます                                                                       |
| [LowCardinality](/sql-reference/data-types/lowcardinality)      | `LowCardinality(T)` = 2 つのカラム: `Index T, Keys K`。K は UInt8/16/32/64 です。Index には一意の値が含まれ、Keys には Index 内のインデックスが含まれます |
| [Bool](/sql-reference/data-types/boolean)                       | `UInt8` の別名: 0=false、1=true                                                                                          |

**例: Nullable のエンコーディング**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**例: LowCardinality のエンコーディング**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```