---
'slug': '/native-protocol/columns'
'sidebar_position': 4
'title': '列の種類'
'description': 'ネイティブプロトコルのための列の種類'
---




# カラムの種類

一般的な参照については[データ型](/sql-reference/data-types/)を参照してください。

## 数値型 {#numeric-types}

:::tip

数値型のエンコーディングは、AMD64やARM64のようなリトルエンディアンCPUのメモリレイアウトと一致します。

これにより、非常に効率的なエンコーディングとデコーディングが実現します。

:::

### 整数 {#integers}

IntおよびUIntの8、16、32、64、128または256ビットの配列で、リトルエンディアンでエンコードされています。

### 浮動小数点数 {#floats}

IEEE 754バイナリ表現のFloat32およびFloat64です。

## 文字列 {#string}

単なるStringの配列、すなわち(len, value)です。

## FixedString(N) {#fixedstringn}

Nバイトシーケンスの配列です。

## IP {#ip}

IPv4は`UInt32`数値型のエイリアスで、UInt32として表現されます。

IPv6は`FixedString(16)`のエイリアスで、バイナリとして直接表現されます。

## タプル {#tuple}

タプルは単なるカラムの配列です。例えば、Tuple(String, UInt8)は連続してエンコードされた2つのカラムです。

## マップ {#map}

`Map(K, V)`は3つのカラムで構成されています: `Offsets ColUInt64, Keys K, Values V`。

`Keys`カラムと`Values`カラムの行数は`Offsets`の最後の値です。

## 配列 {#array}

`Array(T)`は2つのカラムで構成されています: `Offsets ColUInt64, Data T`。

`Data`の行数は`Offsets`の最後の値です。

## Nullable {#nullable}

`Nullable(T)`は`Nulls ColUInt8, Values T`で構成され、同じ行数を持ちます。

```go
// NullsはValuesカラムのnullable "マスク" です。
// 例えば、[null, "", "hello", null, "world"]をエンコードすることを考えます。
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)`のエイリアスで、UUID値はバイナリとして表現されます。

## 列挙型 {#enum}

`Int8`または`Int16`のエイリアスですが、各整数はある`String`値にマッピングされます。

## 低カーディナリティ {#low-cardinality}

`LowCardinality(T)`は`Index T, Keys K`で構成され、
ここで`K`は`Index`のサイズに応じて(UInt8, UInt16, UInt32, UInt64)のいずれかです。

```go
// Index（すなわち辞書）カラムはユニークな値を含み、Keysカラムは
// Indexカラムにある実際の値を表すインデックスの配列を含みます。
//
// 例えば、["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]は
// 次のようにエンコードできます:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKeyはIndexサイズに応じて選択され、すなわち選択された型の最大値は
// Index要素の任意のインデックスを表現できる必要があります。
```

## ブール {#bool}

`UInt8`のエイリアスで、`0`はfalse、`1`はtrueです。
