---
slug: /native-protocol/columns
sidebar_position: 4
title: '原生协议列类型'
description: '原生协议中的列类型'
keywords: ['原生协议列类型', '列类型', '数据类型', '协议数据类型', '二进制编码']
doc_type: 'reference'
---

# 原生协议列类型 \{#native-protocol-column-types\}

通用参考请参见 [Data Types](/sql-reference/data-types/)。

:::tip
数值类型的编码与 AMD64 或 ARM64 等小端 CPU 的内存布局一致，从而实现非常高效的编码和解码。
:::

| Type                                                            | Encoding                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Integers** ([Int/UInt](/sql-reference/data-types/int-uint))   | 8、16、32、64、128 或 256 位小端编码                                                                         |
| **Floats** ([Float32/Float64](/sql-reference/data-types/float)) | IEEE 754 二进制表示                                                                                     |
| [String](/sql-reference/data-types/string)                      | 字符串数组，以 (len, value) 形式存储                                                                          |
| [FixedString(N)](/sql-reference/data-types/fixedstring)         | N 字节序列数组                                                                                           |
| [IPv4](/sql-reference/data-types/ipv4)                          | `UInt32` 的别名，以 UInt32 存储                                                                           |
| [IPv6](/sql-reference/data-types/ipv6)                          | `FixedString(16)` 的别名，以二进制存储                                                                       |
| [Tuple](/sql-reference/data-types/tuple)                        | 连续编码的列数组。例如：`Tuple(String, UInt8)` = 两个连续的列                                                        |
| [Map](/sql-reference/data-types/map)                            | `Map(K, V)` = 三列：`Offsets ColUInt64, Keys K, Values V`。Keys/Values 中的行数 = Offsets 的最后一个值           |
| [Array](/sql-reference/data-types/array)                        | `Array(T)` = 两列：`Offsets ColUInt64, Data T`。Data 中的行数 = Offsets 的最后一个值                             |
| [Nullable](/sql-reference/data-types/nullable)                  | `Nullable(T)` = 两列：`Nulls ColUInt8, Values T`，行数相同。Nulls 是掩码：1 表示 null，0 表示 value                  |
| [UUID](/sql-reference/data-types/uuid)                          | `FixedString(16)` 的别名，以二进制存储                                                                       |
| [Enum](/sql-reference/data-types/enum)                          | `Int8` 或 `Int16` 的别名，每个整数映射到一个 String 值                                                            |
| [LowCardinality](/sql-reference/data-types/lowcardinality)      | `LowCardinality(T)` = 两列：`Index T, Keys K`，其中 K 为 UInt8/16/32/64。Index 列存储唯一值，Keys 列存储指向 Index 的索引 |
| [Bool](/sql-reference/data-types/boolean)                       | `UInt8` 的别名：0=false，1=true                                                                         |

**示例：Nullable 编码**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**示例：LowCardinality 编码**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```
