---
slug: /sql-reference/functions/geo/coordinates
sidebar_label: 地理座標
sidebar_position: 62
title: "地理座標を扱うための関数"
---

## greatCircleDistance {#greatcircledistance}

[大円測定法](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して地球の表面上の2点間の距離を計算します。

``` sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度（度）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度（度）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球の表面上の2点間の距離（メートル）。

入力パラメータの値が範囲外の場合、例外が発生します。

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

`greatCircleDistance`に似ていますが、球体ではなくWGS-84楕円体上で距離を計算します。これは地球のジオイドのより正確な近似です。
性能は`greatCircleDistance`と同じです（性能の低下はありません）。地球上の距離を計算するためには`geoDistance`の使用が推奨されます。

技術ノート: 十分に近い点については、座標の中点での接平面におけるメトリックを使用して距離を計算します。

``` sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度（度）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度（度）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球の表面上の2点間の距離（メートル）。

入力パラメータの値が範囲外の場合、例外が発生します。

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

[大円測定法](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して地球の表面上の2点間の中心角を計算します。

``` sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度）。
- `lat1Deg` — 最初の点の緯度（度）。
- `lon2Deg` — 2番目の点の経度（度）。
- `lat2Deg` — 2番目の点の緯度（度）。

**返される値**

2点間の中心角（度）。

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

ポイントが少なくとも1つの楕円に属するかどうかを確認します。座標はデカルト座標系の幾何学的なものである必要があります。

``` sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**入力パラメータ**

- `x, y` — 平面上の点の座標。
- `xᵢ, yᵢ` — `i`番目の楕円の中心の座標。
- `aᵢ, bᵢ` — `i`番目の楕円のx,y座標の単位での軸。

入力パラメータは `2+4⋅n` でなければならず、ここで `n` は楕円の数です。

**返される値**

ポイントが少なくとも1つの楕円の内部にある場合は`1`、そうでない場合は`0`。

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

ポイントが平面上のポリゴンに属するかどうかを確認します。

``` sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**入力値**

- `(x, y)` — 平面上の点の座標。データ型 — [Tuple](../../data-types/tuple.md) — 2つの数のタプル。
- `[(a, b), (c, d) ...]` — ポリゴンの頂点。データ型 — [Array](../../data-types/array.md)。各頂点は座標のペア `(a, b)` で表されます。頂点は時計回りまたは反時計回りの順序で指定する必要があります。最小頂点数は3です。ポリゴンは一定でなければなりません。
- この関数は穴のあるポリゴン（切り取られた部分）もサポートします。この場合、追加引数を使用して切り取られた部分を定義するポリゴンを追加します。この関数は単純連結でないポリゴンをサポートしていません。

**返される値**

ポイントがポリゴンの内部にある場合は`1`、そうでない場合は`0`。
ポイントがポリゴンの境界上にある場合、関数は0または1のいずれかを返すことがあります。

**例**

``` sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

``` text
┌─res─┐
│   1 │
└─────┘
```
