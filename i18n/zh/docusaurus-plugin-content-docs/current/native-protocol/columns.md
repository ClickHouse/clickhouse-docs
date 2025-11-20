---
slug: /native-protocol/columns
sidebar_position: 4
title: '列类型'
description: '原生协议中的列类型'
keywords: ['native protocol columns', 'column types', 'data types', 'protocol data types', 'binary encoding']
doc_type: 'reference'
---



# 列类型

有关通用参考，请参阅 [数据类型](/sql-reference/data-types/)。



## 数值类型 {#numeric-types}

:::tip

数值类型的编码与小端序 CPU(如 AMD64 或 ARM64)的内存布局一致。

这使得编码和解码能够非常高效地实现。

:::

### 整数 {#integers}

8、16、32、64、128 或 256 位的 Int 和 UInt,采用小端序。

### 浮点数 {#floats}

Float32 和 Float64 采用 IEEE 754 二进制表示形式。


## String {#string}

即字符串数组,格式为 (len, value)。


## FixedString(N) {#fixedstringn}

由 N 字节序列组成的数组。


## IP {#ip}

IPv4 是 `UInt32` 数值类型的别名,以 UInt32 形式表示。

IPv6 是 `FixedString(16)` 的别名,直接以二进制形式表示。


## Tuple {#tuple}

Tuple 本质上是列的数组。例如,Tuple(String, UInt8) 就是两个连续编码的列。


## Map {#map}

`Map(K, V)` 由三列组成:`Offsets ColUInt64, Keys K, Values V`。

`Keys` 和 `Values` 列的行数为 `Offsets` 中的最后一个值。


## Array {#array}

`Array(T)` 由两列组成:`Offsets ColUInt64, Data T`。

`Data` 中的行数为 `Offsets` 的最后一个值。


## Nullable {#nullable}

`Nullable(T)` 由 `Nulls ColUInt8, Values T` 组成,两者行数相同。

```go
// Nulls 是 Values 列的可空性"掩码"。
// 例如,要编码 [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## UUID {#uuid}

`FixedString(16)` 的别名，UUID 值以二进制形式表示。


## Enum {#enum}

`Int8` 或 `Int16` 的别名,但每个整数会映射到一个 `String` 值。


## `LowCardinality` 类型 {#low-cardinality}

`LowCardinality(T)` 由 `Index T, Keys K` 组成,
其中 `K` 根据 `Index` 的大小可以是 (UInt8, UInt16, UInt32, UInt64) 之一。

```go
// Index(即字典)列包含唯一值,Keys 列包含
// Index 列中的索引序列,这些索引代表实际值。
//
// 例如,["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] 可以
// 编码为:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey 根据 Index 的大小选择,即所选类型的最大值
// 应能够表示 Index 元素的任意索引。
```


## Bool {#bool}

`UInt8` 的别名,其中 `0` 表示假(false),`1` 表示真(true)。
