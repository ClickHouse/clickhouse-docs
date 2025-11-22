---
description: 'Geohash のドキュメント'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: 'Geohash を扱う関数'
doc_type: 'reference'
---



## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash)は、地球の表面をグリッド状の領域に分割し、各セルを英数字の短い文字列にエンコードするジオコードシステムです。階層的なデータ構造であるため、geohash文字列が長いほど、地理的位置の精度が高くなります。

地理座標をgeohash文字列に手動で変換する必要がある場合は、[geohash.org](http://geohash.co/)を使用できます。


## geohashEncode {#geohashencode}

緯度と経度を[geohash](#geohash)文字列としてエンコードします。

**構文**

```sql
geohashEncode(longitude, latitude, [precision])
```

**入力値**

- `longitude` — エンコードする座標の経度部分。範囲`[-180°, 180°]`の浮動小数点数。[Float](../../data-types/float.md)。
- `latitude` — エンコードする座標の緯度部分。範囲`[-90°, 90°]`の浮動小数点数。[Float](../../data-types/float.md)。
- `precision` (オプション) — エンコード結果の文字列長。デフォルトは`12`。範囲`[1, 12]`の整数。[Int8](../../data-types/int-uint.md)。

:::note

- すべての座標パラメータは同じ型である必要があります：`Float32`または`Float64`のいずれか。
- `precision`パラメータについては、`1`未満または`12`より大きい値は暗黙的に`12`に変換されます。
  :::

**戻り値**

- エンコードされた座標の英数字文字列(base32エンコーディングアルファベットの修正版を使用)。[String](../../data-types/string.md)。

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

[geohash](#geohash)でエンコードされた任意の文字列を経度と緯度にデコードします。

**構文**

```sql
geohashDecode(hash_str)
```

**入力値**

- `hash_str` — Geohashでエンコードされた文字列。

**戻り値**

- 経度と緯度の`Float64`値で構成されるタプル`(longitude, latitude)`。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

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

指定された精度の[geohash](#geohash)エンコード文字列の配列を返します。これらは指定されたボックスの内部に含まれ、その境界と交差するもので、基本的には2次元グリッドを配列に平坦化したものです。

**構文**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**引数**

- `longitude_min` — 最小経度。範囲:`[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude_min` — 最小緯度。範囲:`[-90°, 90°]`。[Float](../../data-types/float.md)。
- `longitude_max` — 最大経度。範囲:`[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude_max` — 最大緯度。範囲:`[-90°, 90°]`。[Float](../../data-types/float.md)。
- `precision` — Geohash精度。範囲:`[1, 12]`。[UInt8](../../data-types/int-uint.md)。

:::note  
すべての座標パラメータは同じ型である必要があります:`Float32`または`Float64`のいずれか。
:::

**戻り値**

- 指定された領域をカバーする、精度の長さを持つgeohashボックスの文字列の配列。項目の順序には依存しないでください。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
- `[]` - 最小緯度および経度の値が対応する最大値より小さくない場合は空の配列。

:::note  
結果の配列が10,000,000項目を超える場合、関数は例外をスローします。
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
