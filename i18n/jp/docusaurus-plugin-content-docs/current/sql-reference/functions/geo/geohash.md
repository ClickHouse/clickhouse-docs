---
description: 'Geohash のドキュメント'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: 'Geohash 関連関数'
doc_type: 'reference'
---



## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) は、地球の表面をグリッド状の区画に細分化し、それぞれのセルを文字と数字からなる短い文字列にエンコードするジオコードシステムです。階層的なデータ構造になっているため、geohash 文字列が長くなるほど、地理的位置をより高い精度で表現できます。

地理座標を手動で geohash 文字列に変換する必要がある場合は、[geohash.org](http://geohash.co/) を利用できます。



## geohashEncode

緯度と経度を [geohash](#geohash) 文字列にエンコードします。

**構文**

```sql
geohashEncode(longitude, latitude, [precision])
```

**入力値**

* `longitude` — エンコードしたい座標の経度部分。範囲 `[-180°, 180°]` の浮動小数点数。[Float](../../data-types/float.md)。
* `latitude` — エンコードしたい座標の緯度部分。範囲 `[-90°, 90°]` の浮動小数点数。[Float](../../data-types/float.md)。
* `precision` (任意) — 生成されるエンコード済み文字列の長さ。既定値は `12`。範囲 `[1, 12]` の整数。[Int8](../../data-types/int-uint.md)。

:::note

* すべての座標パラメータは、`Float32` または `Float64` のいずれか同一の型でなければなりません。
* `precision` パラメータについては、`1` 未満または `12` を超える任意の値は、自動的に `12` に変換されます。
  :::

**戻り値**

* エンコードされた座標を表す英数字の文字列（修正版の base32 エンコードアルファベットを使用）。[String](../../data-types/string.md)。

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


## geohashDecode

任意の [geohash](#geohash) でエンコードされた文字列を経度・緯度にデコードします。

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


## geohashesInBox

指定されたボックスの内部に含まれる、またはその境界と交わる、指定された精度の [geohash](#geohash) でエンコードされた文字列の配列を返します。基本的には、2D グリッドを配列にフラット化したものです。

**構文**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**引数**

* `longitude_min` — 経度の最小値。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude_min` — 緯度の最小値。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md)。
* `longitude_max` — 経度の最大値。範囲: `[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude_max` — 緯度の最大値。範囲: `[-90°, 90°]`。[Float](../../data-types/float.md)。
* `precision` — Geohash の精度。範囲: `[1, 12]`。[UInt8](../../data-types/int-uint.md)。

:::note\
すべての座標パラメータは同じ型である必要があります。`Float32` または `Float64` のいずれかです。
:::

**返される値**

* 指定した領域をカバーする、指定した精度の geohash ボックスを表す文字列の配列。要素の順序には依存しないでください。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
* `[]` - 緯度および経度の最小値が、それぞれ対応する最大値より小さくない場合は空配列が返されます。

:::note\
結果の配列の要素数が 10&#39;000&#39;000 を超える場合、関数は例外をスローします。
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
