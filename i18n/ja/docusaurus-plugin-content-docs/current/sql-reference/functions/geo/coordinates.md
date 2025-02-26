---
slug: /sql-reference/functions/geo/coordinates
sidebar_label: 地理座標
sidebar_position: 62
title: "地理座標に関する関数"
---

## greatCircleDistance {#greatcircledistance}

[大円距離の公式](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して、地球表面上の2点間の距離を計算します。

``` sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度単位）。範囲: `[-180°, 180°]`.
- `lat1Deg` — 最初の点の緯度（度単位）。範囲: `[-90°, 90°]`.
- `lon2Deg` — 2 番目の点の経度（度単位）。範囲: `[-180°, 180°]`.
- `lat2Deg` — 2 番目の点の緯度（度単位）。範囲: `[-90°, 90°]`.

正の値は北緯と東経に対応し、負の値は南緯と西経に対応します。

**返される値**

地球表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合、例外が生成されます。

**例**

``` sql
SELECT greatCircleDistance(55.755831, 37.617673, -55.755831, -37.617673) AS greatCircleDistance
```

``` text
┌─greatCircleDistance─┐
│            14128352 │
└─────────────────────┘
```

## geoDistance {#geodistance}

`greatCircleDistance` と似ていますが、球の代わりに WGS-84 楕円体上で距離を計算します。これは、地球のジオイドのより正確な近似です。
パフォーマンスは `greatCircleDistance` と同じです（パフォーマンスの低下はありません）。地球上の距離を計算するには `geoDistance` を使用することをお勧めします。

技術的注意: 近い点に対しては、座標の中点での接平面上のメトリックを使用して距離を計算します。

``` sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度単位）。範囲: `[-180°, 180°]`.
- `lat1Deg` — 最初の点の緯度（度単位）。範囲: `[-90°, 90°]`.
- `lon2Deg` — 2 番目の点の経度（度単位）。範囲: `[-180°, 180°]`.
- `lat2Deg` — 2 番目の点の緯度（度単位）。範囲: `[-90°, 90°]`.

正の値は北緯と東経に対応し、負の値は南緯と西経に対応します。

**返される値**

地球表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合、例外が生成されます。

**例**

``` sql
SELECT geoDistance(38.8976, -77.0366, 39.9496, -75.1503) AS geoDistance
```

``` text
┌─geoDistance─┐
│   212458.73 │
└─────────────┘
```

## greatCircleAngle {#greatcircleangle}

[大円距離の公式](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して、地球表面上の2点間の中心角を計算します。

``` sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度単位）。
- `lat1Deg` — 最初の点の緯度（度単位）。
- `lon2Deg` — 2 番目の点の経度（度単位）。
- `lat2Deg` — 2 番目の点の緯度（度単位）。

**返される値**

2点間の中心角（度単位）。

**例**

``` sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

``` text
┌─arc─┐
│  45 │
└─────┘
```

## pointInEllipses {#pointinellipses}

点が少なくとも1つの楕円に属しているかどうかを確認します。
座標は直交座標系における幾何学的なものです。

``` sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**入力パラメータ**

- `x, y` — 平面上の点の座標。
- `xᵢ, yᵢ` — `i` 番目の楕円の中心の座標。
- `aᵢ, bᵢ` — `i` 番目の楕円の軸（x、y 座標の単位）。

入力パラメータは `2+4⋅n` でなければなりません。ここで、`n` は楕円の数です。

**返される値**

点が少なくとも1つの楕円の内側にある場合は `1`、そうでない場合は `0`。

**例**

``` sql
SELECT pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)
```

``` text
┌─pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```

## pointInPolygon {#pointinpolygon}

点が平面上の多角形に属しているかどうかを確認します。

``` sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**入力値**

- `(x, y)` — 平面上の点の座標。データ型 — [タプル](../../data-types/tuple.md) — 2つの数のタプル。
- `[(a, b), (c, d) ...]` — 多角形の頂点。データ型 — [配列](../../data-types/array.md)。各頂点は座標のペア `(a, b)` で表されます。頂点は時計回りまたは反時計回りの順序で指定する必要があります。最小の頂点数は3です。多角形は定常でなければなりません。
- この関数は、穴のある多角形（切り取られた部分）もサポートしています。この場合、追加引数を使用して切り取られた部分を定義する多角形を追加します。この関数は複雑な多角形（単純連結でない多角形）をサポートしていません。

**返される値**

点が多角形の内側にある場合は `1`、そうでない場合は `0`。
点が多角形の境界上にある場合、関数は `0` または `1` のいずれかを返す可能性があります。

**例**

``` sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

``` text
┌─res─┐
│   1 │
└─────┘
```
