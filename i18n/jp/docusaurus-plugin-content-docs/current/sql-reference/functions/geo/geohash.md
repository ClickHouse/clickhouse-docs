---
description: 'Geohashに関するドキュメント'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: 'Geohashでの操作に関する関数'
---

## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) は、地球の表面をグリッド状のバケツに区分し、各セルを短い文字列にエンコードするジオコードシステムです。これは階層的なデータ構造であり、geohash文字列が長くなるほど、地理的な位置の精度が向上します。

地理座標を手動でgeohash文字列に変換する必要がある場合は、[geohash.org](http://geohash.org/) を使用できます。

## geohashEncode {#geohashencode}

緯度と経度を [geohash](#geohash) 文字列としてエンコードします。

**構文**

```sql
geohashEncode(longitude, latitude, [precision])
```

**入力値**

- `longitude` — エンコードしたい座標の経度部分。範囲`[-180°, 180°]`の浮動小数点数。[Float](../../data-types/float.md). 
- `latitude` — エンコードしたい座標の緯度部分。範囲`[-90°, 90°]`の浮動小数点数。[Float](../../data-types/float.md).
- `precision` (オプション) — 結果として得られるエンコード文字列の長さ。デフォルトは`12`。範囲`[1, 12]`の整数。[Int8](../../data-types/int-uint.md).

:::note
- すべての座標パラメータは同じタイプでなければなりません: `Float32`または`Float64`のいずれかです。
- `precision`パラメータに対して、`1`未満または`12`を超える値は silently `12` に変換されます。
:::

**返される値**

- エンコードされた座標の英数字文字列（base32エンコーディングアルファベットの修正版が使用されます）。[String](../../data-types/string.md)。

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

任意の [geohash](#geohash) エンコードされた文字列を経度と緯度にデコードします。

**構文**

```sql
geohashDecode(hash_str)
```

**入力値**

- `hash_str` — Geohashエンコードされた文字列。

**返される値**

- 経度と緯度の `Float64` 値のタプル `(longitude, latitude)`。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

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

指定された精度の [geohash](#geohash) エンコードされた文字列の配列を返し、指定されたボックスの境界内にあり、交差するものを返します。基本的には、2Dグリッドが配列にフラット化されます。

**構文**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**引数**

- `longitude_min` — 最小経度。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md).
- `latitude_min` — 最小緯度。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md).
- `longitude_max` — 最大経度。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md).
- `latitude_max` — 最大緯度。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md).
- `precision` — Geohashの精度。範囲: `[1, 12]`。[UInt8](../../data-types/int-uint.md).

:::note    
すべての座標パラメータは同じタイプでなければなりません: `Float32` または `Float64` のいずれかです。
:::

**返される値**

- 提供された領域をカバーする精度長のgeohashボックスの文字列の配列。アイテムの順序に依存しないでください。[Array](../../data-types/array.md)([String](../../data-types/string.md)).
- 最小緯度と経度の値がそれぞれの最大値よりも小さくない場合、`[]` - 空の配列。

:::note    
結果の配列が10'000'000項目を超えると、関数は例外をスローします。
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
