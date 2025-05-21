---
slug: /native-protocol/columns
sidebar_position: 4
title: 'カラムタイプ'
description: 'ネイティブプロトコルのカラムタイプ'
---


# カラムタイプ

一般的な参照については [データタイプ](/sql-reference/data-types/) を参照してください。

## 数値型 {#numeric-types}

:::tip

数値型のエンコーディングは、AMD64 または ARM64 のようなリトルエンディアン CPU のメモリレイアウトと一致します。

これにより、非常に効率的なエンコーディングとデコーディングを実装できます。

:::

### 整数 {#integers}

Int および UInt の 8, 16, 32, 64, 128 または 256 ビットの文字列で、リトルエンディアンで表現されます。

### 浮動小数点数 {#floats}

IEEE 754 バイナリ表現による Float32 および Float64。

## 文字列 {#string}

単に String の配列、すなわち (len, value) です。

## 固定文字列(N) {#fixedstringn}

N バイトのシーケンスの配列です。

## IP {#ip}

IPv4 は `UInt32` 数値型のエイリアスであり、UInt32 として表現されます。

IPv6 は `FixedString(16)` のエイリアスであり、直接バイナリとして表現されます。

## タプル {#tuple}

タプルは単にカラムの配列です。例えば、Tuple(String, UInt8) は連続してエンコードされた 2 つのカラムです。

## マップ {#map}

`Map(K, V)` は 3 つのカラムから構成されます: `Offsets ColUInt64, Keys K, Values V`。

`Keys` と `Values` カラムの行数は `Offsets` の最後の値です。

## 配列 {#array}

`Array(T)` は 2 つのカラムから構成されます: `Offsets ColUInt64, Data T`。

`Data` の行数は `Offsets` の最後の値です。

## Nullable {#nullable}

`Nullable(T)` は `Nulls ColUInt8, Values T` で、行数は同じです。

```go
// Nulls は Values カラムに対する nullable "マスク" です。
// 例えば、[null, "", "hello", null, "world"] をエンコードするには
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)` のエイリアスで、UUID 値はバイナリとして表現されます。

## 列挙型 {#enum}

`Int8` または `Int16` のエイリアスで、各整数はある `String` 値にマッピングされます。

## 低カーディナリティ {#low-cardinality}

`LowCardinality(T)` は `Index T, Keys K` で構成され、
`K` は `Index` のサイズに応じて (UInt8, UInt16, UInt32, UInt64) のいずれかです。

```go
// Index（すなわち辞書）カラムは一意の値を含み、Keys カラムは
// 実際の値を表す Index カラムのインデックスのシーケンスを含みます。
//
// 例えば、["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] は
// 次のようにエンコードできます:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey は Index のサイズに応じて選択されます。すなわち、
// 選択された型の最大値は Index 要素の任意のインデックスを表すことができる必要があります。
```

## Bool {#bool}

`UInt8` のエイリアスで、`0` は false、`1` は true です。
