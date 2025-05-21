---
'slug': '/native-protocol/columns'
'sidebar_position': 4
'title': '列类型'
'description': '原生协议的列类型'
---




# 列类型

请参见 [数据类型](/sql-reference/data-types/) 以获取一般参考。

## 数值类型 {#numeric-types}

:::tip

数值类型编码与 AMD64 或 ARM64 等小端 CPU 的内存布局相匹配。

这使得实现非常高效的编码和解码成为可能。

:::

### 整数 {#integers}

8、16、32、64、128 或 256 位的 Int 和 UInt 的字符串，以小端格式表示。

### 浮点数 {#floats}

Float32 和 Float64 采用 IEEE 754 二进制表示。

## 字符串 {#string}

仅仅是一个字符串数组，即（长度，值）。

## FixedString(N) {#fixedstringn}

N 字节序列的数组。

## IP {#ip}

IPv4 是 `UInt32` 数值类型的别名，以 UInt32 表示。

IPv6 是 `FixedString(16)` 的别名，直接以二进制表示。

## 元组 {#tuple}

元组只是一个列的数组。例如，Tuple(String, UInt8) 是连续编码的两个列。

## 映射 {#map}

`Map(K, V)` 包含三列：`Offsets ColUInt64, Keys K, Values V`。

`Keys` 和 `Values` 列中的行数是 `Offsets` 的最后一个值。

## 数组 {#array}

`Array(T)` 包含两列：`Offsets ColUInt64, Data T`。

`Data` 中的行数是 `Offsets` 的最后一个值。

## 可空类型 {#nullable}

`Nullable(T)` 由 `Nulls ColUInt8, Values T` 组成，具有相同的行数。

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)` 的别名，UUID 值以二进制表示。

## 枚举 {#enum}

`Int8` 或 `Int16` 的别名，但每个整数映射到某个 `String` 值。

## 低基数 {#low-cardinality}

`LowCardinality(T)` 由 `Index T, Keys K` 组成，
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

## 布尔值 {#bool}

`UInt8` 的别名，其中 `0` 表示假，`1` 表示真。
