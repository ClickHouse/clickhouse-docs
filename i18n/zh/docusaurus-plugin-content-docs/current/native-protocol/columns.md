---
slug: /native-protocol/columns
sidebar_position: 4
title: '列类型'
description: '原生协议中的列类型'
keywords: ['原生协议列类型', '列类型', '数据类型', '协议数据类型', '二进制编码']
doc_type: 'reference'
---

# 列类型 {#column-types}

有关通用说明，请参阅 [数据类型](/sql-reference/data-types/)。

## 数值类型 {#numeric-types}

:::tip

数值类型的编码与 AMD64 或 ARM64 等小端 CPU 的内存布局相同。

这使得可以实现非常高效的编码和解码。

:::

### [整数](/sql-reference/data-types/int-uint) {#integers}

8、16、32、64、128 或 256 位的小端序 Int 和 UInt 类型表示。

### [浮点数](/sql-reference/data-types/float) {#floats}

IEEE 754 二进制表示的 Float32 和 Float64。

## [String](/sql-reference/data-types/string) {#string}

本质上就是一个由 String 构成的数组，即 (len, value)。

## [FixedString(N)](/sql-reference/data-types/fixedstring) {#fixedstringn}

由 N 字节长序列构成的数组。

## IP {#ip}

### [IPv4](/sql-reference/data-types/ipv4) {#ipv4}

是 `UInt32` 数值类型的别名，并以 `UInt32` 形式表示。

### [IPv6](/sql-reference/data-types/ipv6) {#ipv6}

是 `FixedString(16)` 的别名，并直接以二进制形式表示。

## [Tuple](/sql-reference/data-types/tuple) {#tuple}

Tuple 只是一个由列组成的数组。比如，Tuple(String, UInt8) 就是两个按顺序连续编码的列。

## [Map](/sql-reference/data-types/map) {#map}

`Map(K, V)` 由三列组成：`Offsets ColUInt64、Keys K、Values V`。

`Keys` 和 `Values` 列中的行数等于 `Offsets` 列中的最后一个值。

## [Array](/sql-reference/data-types/array) {#array}

`Array(T)` 由两列组成：`Offsets ColUInt64, Data T`。

`Data` 中的行数等于 `Offsets` 中的最后一个值。

## [Nullable](/sql-reference/data-types/nullable) {#nullable}

`Nullable(T)` 由 `Nulls ColUInt8` 和 `Values T` 构成，且二者的行数相同。

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## [UUID](/sql-reference/data-types/uuid) {#uuid}

`FixedString(16)` 的别名，UUID 值以二进制形式表示。

## [Enum](/sql-reference/data-types/enum) {#enum}

`Int8` 或 `Int16` 的别名，但每个整数都会映射到某个 `String` 类型的值。

## [`LowCardinality` 类型](/sql-reference/data-types/lowcardinality) {#low-cardinality}

`LowCardinality(T)` 由 `Index T` 和 `Keys K` 组成，
其中 `K` 是 (UInt8, UInt16, UInt32, UInt64) 之一，具体取决于 `Index` 的大小。

```go
// Index (i.e. dictionary) column contains unique values, Keys column contains
// sequence of indexes in Index column that represent actual values.
//
// For example, ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] can
// be encoded as:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// The CardinalityKey is chosen depending on Index size, i.e. maximum value
// of chosen type should be able to represent any index of Index element.
```


## [Bool](/sql-reference/data-types/boolean) {#bool}

是 `UInt8` 的别名，其中 `0` 表示 `false`，`1` 表示 `true`。