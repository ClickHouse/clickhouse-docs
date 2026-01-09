---
slug: /native-protocol/columns
sidebar_position: 4
title: 'Column types'
description: 'Column types for the native protocol'
keywords: ['native protocol columns', 'column types', 'data types', 'protocol data types', 'binary encoding']
doc_type: 'reference'
---

# Column types

See [Data Types](/sql-reference/data-types/) for general reference.

## Numeric types {#numeric-types}

:::tip

Numeric types encoding matches memory layout of little endian CPUs like AMD64 or ARM64.

This allows to implement very efficient encoding and decoding.

:::

### [Integers](/sql-reference/data-types/int-uint) {#integers}

String of Int and UInt of 8, 16, 32, 64, 128 or 256 bits, in little endian.

### [Floats](/sql-reference/data-types/float) {#floats}

Float32 and Float64 in IEEE 754 binary representation.

## [String](/sql-reference/data-types/string) {#string}

Just an array of String, i.e. (len, value).

## [FixedString(N)](/sql-reference/data-types/fixedstring) {#fixedstringn}

An array of N-byte sequences.

## IP {#ip}

### [IPv4](/sql-reference/data-types/ipv4) {#ipv4}

Alias of `UInt32` numeric type and represented as UInt32.

### [IPv6](/sql-reference/data-types/ipv6) {#ipv6}
Alias of `FixedString(16)` and represented as binary directly.

## [Tuple](/sql-reference/data-types/tuple) {#tuple}

Tuple is just an array of columns. For example, Tuple(String, UInt8) is just two columns
encoded continuously.

## [Map](/sql-reference/data-types/map) {#map}

`Map(K, V)` consists of three columns: `Offsets ColUInt64, Keys K, Values V`.

Rows count in `Keys` and `Values` column is last value from `Offsets`.

## [Array](/sql-reference/data-types/array) {#array}

`Array(T)` consists of two columns: `Offsets ColUInt64, Data T`.

Rows count in `Data` is last value from `Offsets`.

## [Nullable](/sql-reference/data-types/nullable) {#nullable}

`Nullable(T)` consists of `Nulls ColUInt8, Values T` with same rows count.

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## [UUID](/sql-reference/data-types/uuid) {#uuid}

Alias of `FixedString(16)`, UUID value represented as binary.

## [Enum](/sql-reference/data-types/enum) {#enum}

Alias of `Int8` or `Int16`, but each integer is mapped to some `String` value.

## [`LowCardinality` type](/sql-reference/data-types/lowcardinality) {#low-cardinality}

`LowCardinality(T)` consists of `Index T, Keys K`,
where `K` is one of (UInt8, UInt16, UInt32, UInt64) depending on size of `Index`.

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

Alias of `UInt8`, where `0` is false and `1` is true.
