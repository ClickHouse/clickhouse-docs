---
slug: /native-protocol/columns
sidebar_position: 4
title: '列型'
description: 'ネイティブプロトコルの列型'
keywords: ['ネイティブプロトコル 列型', '列型', 'データ型', 'プロトコル データ型', 'バイナリ エンコーディング']
doc_type: 'reference'
---



# 列の型

データ型の一般的な説明については、[データ型](/sql-reference/data-types/) を参照してください。



## 数値型 {#numeric-types}

:::tip

数値型のエンコーディングは、AMD64 や ARM64 のようなリトルエンディアン CPU のメモリレイアウトと一致します。

これにより、非常に効率的なエンコードおよびデコードの実装が可能になります。

:::

### 整数 {#integers}

8, 16, 32, 64, 128 または 256 ビットの Int および UInt 型の列で、リトルエンディアンです。

### 浮動小数 {#floats}

IEEE 754 のバイナリ表現による Float32 および Float64 型です。



## String {#string}

単なる `String` の配列であり、各要素は (len, value) です。



## FixedString(N) {#fixedstringn}

長さ N バイトのバイト列の配列。



## IP {#ip}

IPv4 は `UInt32` 数値型のエイリアスであり、`UInt32` として表現されます。

IPv6 は `FixedString(16)` のエイリアスであり、バイナリ形式で直接表現されます。



## Tuple {#tuple}

Tuple は単にカラムの配列です。たとえば、Tuple(String, UInt8) は、連続してエンコードされた 2 つのカラムにすぎません。



## Map {#map}

`Map(K, V)` は 3 つの列で構成されます: `Offsets ColUInt64, Keys K, Values V`。

`Keys` および `Values` 列の行数は、`Offsets` の末尾の値と同じになります。



## Array {#array}

`Array(T)` は、`Offsets ColUInt64` と `Data T` の 2 列から構成されます。

`Data` 内の行数は、`Offsets` の最後の値になります。



## Nullable

`Nullable(T)` は、行数が同じ `Nulls`（型は `ColUInt8`）列と `Values`（型は `T`）列で構成されます。

```go
// Nulls は Values カラムに対する nullable の「マスク」です。
// 例えば、[null, "", "hello", null, "world"] をエンコードする場合:
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## UUID {#uuid}

`FixedString(16)` の別名であり、UUID 値をバイナリ形式で表現します。



## Enum {#enum}

`Int8` または `Int16` の別名ですが、それぞれの整数は特定の `String` 値にマッピングされます。



## `LowCardinality` 型

`LowCardinality(T)` は、`Index T` および `Keys K` から構成されます。
ここで `K` は、`Index` のサイズに応じて (UInt8, UInt16, UInt32, UInt64) のいずれかの型です。

```go
// Index（辞書）カラムには一意の値が格納され、Keysカラムには
// 実際の値を表すIndexカラム内のインデックスのシーケンスが格納されます。
//
// 例えば、["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] は
// 以下のようにエンコードされます：
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKeyはIndexのサイズに応じて選択されます。すなわち、選択された型の最大値は
// Index要素の任意のインデックスを表現可能である必要があります。
```


## Bool {#bool}

`UInt8` の別名で、`0` は `false`、`1` は `true` を表します。
