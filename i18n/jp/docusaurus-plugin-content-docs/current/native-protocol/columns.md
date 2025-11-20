---
slug: /native-protocol/columns
sidebar_position: 4
title: 'カラム型'
description: 'ネイティブプロトコルのカラム型'
keywords: ['ネイティブプロトコル カラム', 'カラム型', 'データ型', 'プロトコルデータ型', 'バイナリエンコーディング']
doc_type: 'reference'
---



# カラム型

一般的なリファレンスについては[データ型](/sql-reference/data-types/)を参照してください。



## 数値型 {#numeric-types}

:::tip

数値型のエンコーディングは、AMD64やARM64などのリトルエンディアンCPUのメモリレイアウトに一致します。

これにより、非常に効率的なエンコードとデコードが可能になります。

:::

### 整数型 {#integers}

8、16、32、64、128、または256ビットのIntおよびUIntをリトルエンディアン形式で表現します。

### 浮動小数点型 {#floats}

IEEE 754バイナリ表現によるFloat32およびFloat64です。


## String {#string}

String の配列、つまり (len, value) の形式です。


## FixedString(N) {#fixedstringn}

N バイト長の固定長文字列です。


## IP {#ip}

IPv4は`UInt32`数値型のエイリアスであり、UInt32として表現されます。

IPv6は`FixedString(16)`のエイリアスであり、バイナリ形式で直接表現されます。


## Tuple {#tuple}

Tupleは、カラムの配列です。例えば、Tuple(String, UInt8)は、連続してエンコードされた2つのカラムを表します。


## Map {#map}

`Map(K, V)` は3つのカラムで構成されます：`Offsets ColUInt64, Keys K, Values V`

`Keys` および `Values` カラムの行数は、`Offsets` の最後の値となります。


## Array {#array}

`Array(T)` は2つのカラムで構成されています: `Offsets ColUInt64, Data T`。

`Data` の行数は `Offsets` の最後の値となります。


## Nullable {#nullable}

`Nullable(T)` は、同じ行数を持つ `Nulls ColUInt8, Values T` で構成されます。

```go
// Nulls は Values カラムに対する nullable の「マスク」です。
// 例えば、[null, "", "hello", null, "world"] をエンコードする場合:
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## UUID {#uuid}

`FixedString(16)`のエイリアスで、UUID値をバイナリ形式で表します。


## Enum {#enum}

`Int8`または`Int16`のエイリアスですが、各整数は文字列値にマッピングされます。


## `LowCardinality` 型 {#low-cardinality}

`LowCardinality(T)` は `Index T, Keys K` で構成され、
`K` は `Index` のサイズに応じて (UInt8, UInt16, UInt32, UInt64) のいずれかとなります。

```go
// Index（辞書）カラムには一意の値が格納され、Keys カラムには
// 実際の値を表す Index カラム内のインデックスのシーケンスが格納されます。
//
// 例えば、["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] は
// 次のようにエンコードされます:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey は Index のサイズに応じて選択されます。つまり、選択された型の最大値で
// Index 要素の任意のインデックスを表現できる必要があります。
```


## Bool {#bool}

`UInt8`のエイリアスで、`0`が偽(false)、`1`が真(true)を表します。
