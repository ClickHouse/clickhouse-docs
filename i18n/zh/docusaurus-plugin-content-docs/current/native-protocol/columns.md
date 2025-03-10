---
slug: /native-protocol/columns
sidebar_position: 4
---


# 列类型

请参阅 [数据类型](/sql-reference/data-types/) 以获取常规参考。

## 数值类型 {#numeric-types}

:::tip

数值类型的编码与小端 CPU（如 AMD64 或 ARM64）的内存布局相匹配。

这允许实现非常高效的编码和解码。

:::

### 整数 {#integers}

Int 和 UInt 的字符串，支持 8、16、32、64、128 或 256 位，小端存储。

### 浮点数 {#floats}

Float32 和 Float64 采用 IEEE 754 二进制表示。

## 字符串 {#string}

仅仅是字符串数组，即 (len, value)。

## 固定字符串(N) {#fixedstringn}

一个 N 字节序列的数组。

## IP {#ip}

IPv4 是 `UInt32` 数值类型的别名，以 UInt32 表示。

IPv6 是 `FixedString(16)` 的别名，直接以二进制表示。

## 元组 {#tuple}

元组仅仅是列的数组。例如，Tuple(String, UInt8) 只是两个连续编码的列。

## 映射 {#map}

`Map(K, V)` 由三列组成：`Offsets ColUInt64, Keys K, Values V`。

`Keys` 和 `Values` 列中的行数为 `Offsets` 的最后一个值。

## 数组 {#array}

`Array(T)` 由两列组成：`Offsets ColUInt64, Data T`。

`Data` 中的行数为 `Offsets` 的最后一个值。

## 可空类型 {#nullable}

`Nullable(T)` 由 `Nulls ColUInt8, Values T` 组成，具有相同的行数。

```go
// Nulls 是 Values 列上的可空 "掩码"。
// 例如，要编码 [null, "", "hello", null, "world"]
//	Values: ["", "", "hello", "", "world"] (len: 5)
//	Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)` 的别名，UUID 值以二进制表示。

## 枚举 {#enum}

`Int8` 或 `Int16` 的别名，但每个整数映射到某些 `String` 值。

## 低基数 {#low-cardinality}

`LowCardinality(T)` 由 `Index T, Keys K` 组成，
其中 `K` 是（UInt8, UInt16, UInt32, UInt64）中的一种，具体取决于 `Index` 的大小。

```go
// Index（即字典）列包含唯一值，Keys 列包含
// Index 列中表示实际值的索引序列。
//
// 例如，["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] 可以
// 编码为:
//	Index: ["Eko", "Amadela"] (String)
//	Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey 根据 Index 大小选择，即所选类型的最大值
// 应能表示 Index 元素的任何索引。
```

## 布尔值 {#bool}

`UInt8` 的别名，其中 `0` 表示假，`1` 表示真。
