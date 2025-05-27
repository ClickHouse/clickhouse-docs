---
'description': 'Documentation for Geohash'
'sidebar_label': 'Geohash'
'slug': '/sql-reference/functions/geo/geohash'
'title': 'Functions for Working with Geohash'
---



## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) は、地球の表面をグリッド状のバケットに細分化し、各セルを短い文字列の組み合わせにエンコードするジオコードシステムです。これは階層的データ構造であり、geohash文字列が長くなるほど、地理的な位置の精度が高くなります。

手動で地理座標をgeohash文字列に変換する必要がある場合は、[geohash.org](http://geohash.org/) を使用できます。

## geohashEncode {#geohashencode}

緯度と経度を [geohash](#geohash) 文字列としてエンコードします。

**構文**

```sql
geohashEncode(longitude, latitude, [precision])
```

**入力値**

- `longitude` — エンコードしたい座標の経度部分。範囲は`[-180°, 180°]`の浮動小数点数です。[Float](../../data-types/float.md)。
- `latitude` — エンコードしたい座標の緯度部分。範囲は`[-90°, 90°]`の浮動小数点数です。[Float](../../data-types/float.md)。
- `precision` (オプション) — 結果のエンコードされた文字列の長さ。初期値は`12`です。範囲は`[1, 12]`の整数です。[Int8](../../data-types/int-uint.md)。

:::note
- すべての座標パラメータは同じタイプでなければなりません：`Float32`または`Float64`。
- `precision`パラメータには、`1`未満または`12`を超える値は静かに`12`に変換されます。
:::

**返される値**

- エンコードされた座標の英数字文字列（修正されたbase32エンコーディングアルファベットが使用されます）。[String](../../data-types/string.md)。

**例**

クエリ:

```sql
SELECT geohashEncode(-5.60302734375, 42.593994140625, 0) AS res;
```

結果:

```text
┌─res──────────┐
│ ezs42d000000 │
└──────────────┘
```

## geohashDecode {#geohashdecode}

任意の [geohash](#geohash) エンコードされた文字列を解読し、経度と緯度を返します。

**構文**

```sql
geohashDecode(hash_str)
```

**入力値**

- `hash_str` — Geohashエンコードされた文字列。

**返される値**

- 経度と緯度の `Float64` 値のタプル `(longitude, latitude)` 。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

**例**

```sql
SELECT geohashDecode('ezs42') AS res;
```

```text
┌─res─────────────────────────────┐
│ (-5.60302734375,42.60498046875) │
└─────────────────────────────────┘
```

## geohashesInBox {#geohashesinbox}

指定された精度で、与えられたボックスの境界内にあるおよび交差する [geohash](#geohash) エンコードされた文字列の配列を返します。基本的には2Dグリッドを配列にフラット化したものです。

**構文**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**引数**

- `longitude_min` — 最小経度。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude_min` — 最小緯度。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md)。
- `longitude_max` — 最大経度。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude_max` — 最大緯度。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md)。
- `precision` — Geohashの精度。範囲: `[1, 12]`。[UInt8](../../data-types/int-uint.md)。

:::note    
すべての座標パラメータは同じタイプでなければなりません：`Float32`または`Float64`。
:::

**返される値**

- 提供されたエリアをカバーする精度の長い文字列の配列で、アイテムの順序に依存しないことをお勧めします。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
- 最小の緯度と経度の値が対応する最大値より小さくない場合、`[]` - 空の配列。

:::note    
結果の配列の項目数が10'000'000を超える場合、関数は例外をスローします。
:::

**例**

クエリ:

```sql
SELECT geohashesInBox(24.48, 40.56, 24.785, 40.81, 4) AS thasos;
```

結果:

```text
┌─thasos──────────────────────────────────────┐
│ ['sx1q','sx1r','sx32','sx1w','sx1x','sx38'] │
└─────────────────────────────────────────────┘
```
