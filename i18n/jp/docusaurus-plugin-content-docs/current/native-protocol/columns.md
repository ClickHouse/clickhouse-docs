---
'slug': '/native-protocol/columns'
'sidebar_position': 4
'title': 'カラム タイプ'
'description': 'ネイティブプロトコルのカラム タイプ'
'doc_type': 'reference'
---


# カラムタイプ

一般的なリファレンスについては [データタイプ](/sql-reference/data-types/) を参照してください。

## 数値タイプ {#numeric-types}

:::tip

数値タイプのエンコーディングは、AMD64 や ARM64 などのリトルエンディアン CPU のメモリレイアウトと一致します。

これにより、非常に効率的なエンコーディングとデコーディングを実装することができます。

:::

### 整数 {#integers}

8, 16, 32, 64, 128 または 256 ビットの Int および UInt の文字列で、リトルエンディアン形式です。

### 浮動小数点数 {#floats}

IEEE 754 のバイナリ表現での Float32 と Float64 です。

## 文字列 {#string}

単に String の配列、つまり (len, value) です。

## FixedString(N) {#fixedstringn}

N バイトのシーケンスの配列です。

## IP {#ip}

IPv4 は `UInt32` 数値タイプのエイリアスで、UInt32 として表現されます。

IPv6 は `FixedString(16)` のエイリアスで、バイナリとして直接表現されます。

## タプル {#tuple}

タプルは単にカラムの配列です。例えば、Tuple(String, UInt8) は連続してエンコードされた 2 つのカラムです。

## マップ {#map}

`Map(K, V)` は 3 つのカラムで構成されます: `Offsets ColUInt64, Keys K, Values V`。

`Keys` と `Values` カラムの行数は `Offsets` の最後の値です。

## 配列 {#array}

`Array(T)` は 2 つのカラムで構成されます: `Offsets ColUInt64, Data T`。

`Data` の行数は `Offsets` の最後の値です。

## Nullable {#nullable}

`Nullable(T)` は、同じ行数を持つ `Nulls ColUInt8, Values T` で構成されます。

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)` のエイリアスで、UUID 値はバイナリとして表現されます。

## 列挙型 {#enum}

`Int8` または `Int16` のエイリアスですが、各整数は特定の `String` 値にマッピングされます。

## `LowCardinality` タイプ {#low-cardinality}

`LowCardinality(T)` は `Index T, Keys K` で構成され、`K` は `Index` のサイズに応じて (UInt8, UInt16, UInt32, UInt64) のいずれかです。

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

## ブール {#bool}

`UInt8` のエイリアスで、`0` は偽、`1` は真です。
