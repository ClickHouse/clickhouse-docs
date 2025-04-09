---
slug: /native-protocol/columns
sidebar_position: 4
---


# カラムタイプ

一般的な参照については [データタイプ](/sql-reference/data-types/) を参照してください。

## 数値タイプ {#numeric-types}

:::tip

数値タイプのエンコーディングは、AMD64 や ARM64 のリトルエンディアン CPU のメモリ配置に一致します。

これにより、非常に効率的なエンコーディングとデコーディングを実装できます。

:::

### 整数 {#integers}

Int および UInt の 8、16、32、64、128 または 256 ビットのリトルエンディアン形式の文字列。

### 浮動小数点 {#floats}

IEEE 754 バイナリ表現の Float32 および Float64。

## 文字列 {#string}

単に String の配列、すなわち (len, value)。

## FixedString(N) {#fixedstringn}

N バイトのシーケンスの配列。

## IP {#ip}

IPv4 は `UInt32` 数値タイプのエイリアスであり、UInt32 として表現されます。

IPv6 は `FixedString(16)` のエイリアスであり、直接バイナリとして表現されます。

## タプル {#tuple}

タプルは単にカラムの配列です。たとえば、Tuple(String, UInt8) は二つのカラムを
連続してエンコードしたものです。

## マップ {#map}

`Map(K, V)` は三つのカラムから構成されます: `Offsets ColUInt64, Keys K, Values V`。

`Keys` と `Values` カラムの行数は `Offsets` の最後の値です。

## 配列 {#array}

`Array(T)` は二つのカラムから構成されています: `Offsets ColUInt64, Data T`。

`Data` の行数は `Offsets` の最後の値です。

## Nullable {#nullable}

`Nullable(T)` は `Nulls ColUInt8, Values T` で同じ行数を持ちます。

```go
// Nulls は Values カラムに対する "マスク" です。
// たとえば、[null, "", "hello", null, "world"] をエンコードするには、
//	Values: ["", "", "hello", "", "world"] (len: 5)
//	Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)` のエイリアスで、UUID 値はバイナリとして表現されます。

## 列挙型 {#enum}

`Int8` または `Int16` のエイリアスですが、各整数は特定の `String` 値にマッピングされます。

## ローカルディクショナリ {#low-cardinality}

`LowCardinality(T)` は `Index T, Keys K` から構成されます。
ここで、`K` は `Index` のサイズに応じて (UInt8, UInt16, UInt32, UInt64) のいずれかです。

```go
// Index (すなわち辞書) カラムには一意の値が含まれ、Keys カラムには
// 実際の値を表す Index カラムのインデックスのシーケンスが含まれます。
//
// たとえば、["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] は
// 次のようにエンコードできます:
//	Index: ["Eko", "Amadela"] (String)
//	Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey は Index のサイズに応じて選ばれます。すなわち、
// 選ばれた型の最大値は、Index 要素の任意のインデックスを表現できる必要があります。
```

## ブール値 {#bool}

`UInt8` のエイリアスで、`0` は false、`1` は true です。
