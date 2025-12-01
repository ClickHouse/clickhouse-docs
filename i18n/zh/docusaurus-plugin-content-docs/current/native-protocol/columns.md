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

### 整数 {#integers}

8、16、32、64、128 或 256 位的小端序 Int 和 UInt 类型表示。

### 浮点数 {#floats}

IEEE 754 二进制表示的 Float32 和 Float64。



## String {#string}

本质上就是一个由 String 构成的数组，即 (len, value)。



## FixedString(N) {#fixedstringn}

由 N 字节长序列构成的数组。



## IP {#ip}

IPv4 是 `UInt32` 数值类型的别名，并以 `UInt32` 形式表示。

IPv6 是 `FixedString(16)` 的别名，并直接以二进制形式表示。



## Tuple {#tuple}

Tuple 只是一个由列组成的数组。比如，Tuple(String, UInt8) 就是两个按顺序连续编码的列。



## Map {#map}

`Map(K, V)` 由三列组成：`Offsets ColUInt64、Keys K、Values V`。

`Keys` 和 `Values` 列中的行数等于 `Offsets` 列中的最后一个值。



## Array {#array}

`Array(T)` 由两列组成：`Offsets ColUInt64, Data T`。

`Data` 中的行数等于 `Offsets` 中的最后一个值。



## Nullable {#nullable}

`Nullable(T)` 由 `Nulls ColUInt8` 和 `Values T` 构成，且二者的行数相同。

```go
// Nulls 是 Values 列的可空性"掩码"。
// 例如,编码 [null, "", "hello", null, "world"] 时:
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## UUID {#uuid}

`FixedString(16)` 的别名，UUID 值以二进制形式表示。



## Enum {#enum}

`Int8` 或 `Int16` 的别名，但每个整数都会映射到某个 `String` 类型的值。



## `LowCardinality` 类型 {#low-cardinality}

`LowCardinality(T)` 由 `Index T` 和 `Keys K` 组成，
其中 `K` 是 (UInt8, UInt16, UInt32, UInt64) 之一，具体取决于 `Index` 的大小。

```go
// Index(即字典)列包含唯一值,Keys 列包含
// Index 列中的索引序列,这些索引代表实际值。
//
// 例如,["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] 可以
// 编码为:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey 根据 Index 大小选择,即所选类型的最大值
// 应能够表示 Index 元素的任意索引。
```


## Bool {#bool}

是 `UInt8` 的别名，其中 `0` 表示 `false`，`1` 表示 `true`。
