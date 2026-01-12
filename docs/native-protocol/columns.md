---
slug: /native-protocol/columns
sidebar_position: 4
title: 'Native protocol column types'
description: 'Column types for the native protocol'
keywords: ['native protocol columns', 'column types', 'data types', 'protocol data types', 'binary encoding']
doc_type: 'reference'
---
# Native protocol column types

See [Data Types](/sql-reference/data-types/) for general reference.

:::tip
Numeric types encoding matches memory layout of little endian CPUs like AMD64 or ARM64, allowing very efficient encoding and decoding.
:::

| Type | Encoding |
|------|----------|
| **Integers** ([Int/UInt](/sql-reference/data-types/int-uint)) | 8, 16, 32, 64, 128 or 256 bits in little endian |
| **Floats** ([Float32/Float64](/sql-reference/data-types/float)) | IEEE 754 binary representation |
| [String](/sql-reference/data-types/string) | Array of strings as (len, value) |
| [FixedString(N)](/sql-reference/data-types/fixedstring) | Array of N-byte sequences |
| [IPv4](/sql-reference/data-types/ipv4) | Alias of `UInt32`, represented as UInt32 |
| [IPv6](/sql-reference/data-types/ipv6) | Alias of `FixedString(16)`, represented as binary |
| [Tuple](/sql-reference/data-types/tuple) | Array of columns encoded continuously. Example: `Tuple(String, UInt8)` = two continuous columns |
| [Map](/sql-reference/data-types/map) | `Map(K, V)` = three columns: `Offsets ColUInt64, Keys K, Values V`. Row count in Keys/Values = last Offsets value |
| [Array](/sql-reference/data-types/array) | `Array(T)` = two columns: `Offsets ColUInt64, Data T`. Row count in Data = last Offsets value |
| [Nullable](/sql-reference/data-types/nullable) | `Nullable(T)` = two columns: `Nulls ColUInt8, Values T` with same row count. Nulls is mask: 1=null, 0=value |
| [UUID](/sql-reference/data-types/uuid) | Alias of `FixedString(16)`, represented as binary |
| [Enum](/sql-reference/data-types/enum) | Alias of `Int8` or `Int16`, each integer mapped to a String value |
| [LowCardinality](/sql-reference/data-types/lowcardinality) | `LowCardinality(T)` = two columns: `Index T, Keys K` where K is UInt8/16/32/64. Index contains unique values, Keys contains indexes into Index |
| [Bool](/sql-reference/data-types/boolean) | Alias of `UInt8`: 0=false, 1=true |

**Example: Nullable encoding**
```
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**Example: LowCardinality encoding**
```
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```
