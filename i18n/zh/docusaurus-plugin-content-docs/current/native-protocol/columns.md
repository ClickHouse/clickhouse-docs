
# 列类型

请参阅 [数据类型](/sql-reference/data-types/) 以获取一般参考。

## 数值类型 {#numeric-types}

:::tip

数值类型的编码与小端 CPU（如 AMD64 或 ARM64）的内存布局相匹配。

这使得实现非常高效的编码和解码成为可能。

:::

### 整数 {#integers}

Int 和 UInt 的字符串，支持 8、16、32、64、128 或 256 位，采用小端格式。

### 浮点数 {#floats}

Float32 和 Float64 采用 IEEE 754 二进制表示。

## 字符串 {#string}

仅仅是一个字符串数组，即 (len, value)。

## FixedString(N) {#fixedstringn}

一个 N 字节序列的数组。

## IP {#ip}

IPv4 是 `UInt32` 数值类型的别名，并表示为 UInt32。

IPv6 是 `FixedString(16)` 的别名，并直接表示为二进制。

## 元组 {#tuple}

元组只是列的数组。例如，Tuple(String, UInt8) 只是两个列连续编码。

## 映射 {#map}

`Map(K, V)` 由三列组成：`Offsets ColUInt64, Keys K, Values V`。

`Keys` 和 `Values` 列中的行数等于 `Offsets` 的最后一个值。

## 数组 {#array}

`Array(T)` 由两列组成：`Offsets ColUInt64, Data T`。

`Data` 中的行数等于 `Offsets` 的最后一个值。

## 可空 {#nullable}

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

`LowCardinality(T)` 由 `Index T, Keys K` 组成，其中 `K` 是 (UInt8, UInt16, UInt32, UInt64) 之一，具体取决于 `Index` 的大小。

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

`UInt8` 的别名，其中 `0` 表示 false，`1` 表示 true。
