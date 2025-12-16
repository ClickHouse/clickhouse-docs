---
description: 'Geohash のドキュメント'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: 'Geohash を扱うための関数'
doc_type: 'reference'
---

## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) はジオコードシステムで、地球の表面を格子状のグリッドセル（バケット）に分割し、それぞれのセルを英数字からなる短い文字列としてエンコードします。これは階層的なデータ構造であり、Geohash 文字列が長くなるほど、地理的位置をより高い精度で表現できます。

地理座標を Geohash 文字列に手動で変換する必要がある場合は、[geohash.org](http://geohash.co/) を利用できます。

## geohashEncode {#geohashencode}

緯度と経度を [geohash](#geohash) 形式の文字列にエンコードします。

**構文**

```sql
geohashEncode(longitude, latitude, [precision])
```

**入力値**

* `longitude` — エンコードする座標の経度部分。`[-180°, 180°]` の範囲の浮動小数点数。[Float](../../data-types/float.md)。
* `latitude` — エンコードする座標の緯度部分。`[-90°, 90°]` の範囲の浮動小数点数。[Float](../../data-types/float.md)。
* `precision` (任意) — エンコード結果の文字列長。デフォルトは `12`。`[1, 12]` の範囲の整数。[Int8](../../data-types/int-uint.md)。

:::note

* すべての座標パラメータは、`Float32` または `Float64` のいずれか、同じ型でなければなりません。
* `precision` パラメータについて、`1` 未満または `12` より大きい値は、自動的に `12` に変換されます。
  :::

**返される値**

* エンコードされた座標を表す英数字の文字列（改変版の base32 エンコード用アルファベットを使用）。[String](../../data-types/string.md)。

**例**

クエリ:

```sql
SELECT geohashEncode(-5.60302734375, 42.593994140625, 0) AS res;
```

結果：

```text
┌─res──────────┐
│ ezs42d000000 │
└──────────────┘
```

## geohashDecode {#geohashdecode}

[geohash](#geohash) でエンコードされた任意の文字列を緯度・経度にデコードします。

**構文**

```sql
geohashDecode(hash_str)
```

**入力値**

* `hash_str` — Geohash でエンコードされた文字列。

**戻り値**

* 経度と緯度の `Float64` 値からなるタプル `(longitude, latitude)`。 [Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

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

指定されたボックスの内部および境界と交差する位置にある、指定した精度の [geohash](#geohash) でエンコードされた文字列の配列を返します。基本的には、2 次元グリッドを 1 次元の配列に平坦化したものです。

**構文**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**引数**

* `longitude_min` — 最小経度。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude_min` — 最小緯度。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md)。
* `longitude_max` — 最大経度。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude_max` — 最大緯度。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md)。
* `precision` — Geohash の精度。範囲: `[1, 12]`。[UInt8](../../data-types/int-uint.md)。

:::note
すべての座標パラメータは同じ型でなければなりません。`Float32` または `Float64` のいずれかです。
:::

**戻り値**

* 指定された領域をカバーする、指定した精度の長さを持つ geohash ボックス文字列の配列です。要素の順序には依存しないでください。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
* `[]` - 最小緯度および最小経度の値が、それぞれ対応する最大値より小さくない場合は空配列を返します。

:::note
結果の配列が 10&#39;000&#39;000 要素を超える場合、この関数は例外をスローします。
:::

**例**

クエリ:

```sql
SELECT geohashesInBox(24.48, 40.56, 24.785, 40.81, 4) AS thasos;
```

結果：

```text
┌─thasos──────────────────────────────────────┐
│ ['sx1q','sx1r','sx32','sx1w','sx1x','sx38'] │
└─────────────────────────────────────────────┘
```
