---
slug: /native-protocol/columns
sidebar_position: 4
title: 'ネイティブプロトコルの列型'
description: 'ネイティブプロトコルの列型'
keywords: ['ネイティブプロトコル 列型', '列型', 'データ型', 'プロトコル データ型', 'バイナリ エンコーディング']
doc_type: 'reference'
---

# ネイティブプロトコルのカラム型 \{#native-protocol-column-types\}

一般的な事項については [Data Types](/sql-reference/data-types/) を参照してください。

:::tip
数値型のエンコーディングは、AMD64 や ARM64 のようなリトルエンディアン CPU のメモリレイアウトと一致しており、非常に効率的にエンコードおよびデコードできます。
:::

| Type                                                            | Encoding                                                                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Integers** ([Int/UInt](/sql-reference/data-types/int-uint))   | リトルエンディアンで表現される 8、16、32、64、128 または 256 ビット                                                                     |
| **Floats** ([Float32/Float64](/sql-reference/data-types/float)) | IEEE 754 のバイナリ表現                                                                                               |
| [String](/sql-reference/data-types/string)                      | (len, value) 形式の文字列配列                                                                                          |
| [FixedString(N)](/sql-reference/data-types/fixedstring)         | N バイトシーケンスの配列                                                                                                  |
| [IPv4](/sql-reference/data-types/ipv4)                          | `UInt32` のエイリアスで、UInt32 として表現される                                                                               |
| [IPv6](/sql-reference/data-types/ipv6)                          | `FixedString(16)` のエイリアスで、バイナリとして表現される                                                                         |
| [Tuple](/sql-reference/data-types/tuple)                        | 連続してエンコードされたカラム配列。例: `Tuple(String, UInt8)` = 連続した 2 つのカラム                                                     |
| [Map](/sql-reference/data-types/map)                            | `Map(K, V)` = 3 つのカラム: `Offsets ColUInt64, Keys K, Values V`。Keys/Values の行数 = Offsets の最後の値                   |
| [Array](/sql-reference/data-types/array)                        | `Array(T)` = 2 つのカラム: `Offsets ColUInt64, Data T`。Data の行数 = Offsets の最後の値                                     |
| [Nullable](/sql-reference/data-types/nullable)                  | `Nullable(T)` = 2 つのカラム: 同じ行数を持つ `Nulls ColUInt8, Values T`。Nulls はマスクで、1=null、0=value を表す                     |
| [UUID](/sql-reference/data-types/uuid)                          | `FixedString(16)` のエイリアスで、バイナリとして表現される                                                                         |
| [Enum](/sql-reference/data-types/enum)                          | `Int8` または `Int16` のエイリアスで、各整数は String 値にマッピングされる                                                              |
| [LowCardinality](/sql-reference/data-types/lowcardinality)      | `LowCardinality(T)` = 2 つのカラム: `Index T, Keys K`（K は UInt8/16/32/64）。Index はユニーク値を保持し、Keys は Index へのインデックスを保持 |
| [Bool](/sql-reference/data-types/boolean)                       | `UInt8` のエイリアス: 0=false、1=true                                                                                 |

**例: Nullable のエンコーディング**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**例: LowCardinality エンコード**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```
