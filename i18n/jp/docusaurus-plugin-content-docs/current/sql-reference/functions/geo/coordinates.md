---
description: 'Documentation for Coordinates'
sidebar_label: 'Geographical Coordinates'
sidebar_position: 62
slug: '/sql-reference/functions/geo/coordinates'
title: 'Functions for Working with Geographical Coordinates'
---



## greatCircleDistance {#greatcircledistance}

地球の表面上の2点間の距離を、[大円法](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して計算します。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 1点目の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 1点目の緯度（度単位）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2点目の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2点目の緯度（度単位）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球の表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合、例外が発生します。

**例**

```sql
SELECT greatCircleDistance(55.755831, 37.617673, -55.755831, -37.617673) AS greatCircleDistance
```

```text
┌─greatCircleDistance─┐
│            14128352 │
└─────────────────────┘
```

## geoDistance {#geodistance}

`greatCircleDistance`に似ていますが、球体の代わりにWGS-84楕円体上で距離を計算します。これは地球の重力場のより正確な近似です。
パフォーマンスは`greatCircleDistance`と同じです（パフォーマンスの低下はありません）。地球上の距離を計算するには`geoDistance`の使用が推奨されます。

技術的な注記: 近接した点については、座標の中点における接平面上におけるメトリックを使用して距離を計算します。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 1点目の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 1点目の緯度（度単位）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2点目の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2点目の緯度（度単位）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球の表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合、例外が発生します。

**例**

```sql
SELECT geoDistance(38.8976, -77.0366, 39.9496, -75.1503) AS geoDistance
```

```text
┌─geoDistance─┐
│   212458.73 │
└─────────────┘
```

## greatCircleAngle {#greatcircleangle}

地球の表面上の2点間の中心角を、[大円法](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して計算します。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 1点目の経度（度単位）。
- `lat1Deg` — 1点目の緯度（度単位）。
- `lon2Deg` — 2点目の経度（度単位）。
- `lat2Deg` — 2点目の緯度（度単位）。

**返される値**

2点間の中心角（度単位）。

**例**

```sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

```text
┌─arc─┐
│  45 │
└─────┘
```

## pointInEllipses {#pointinellipses}

与えられた点が少なくとも1つの楕円に含まれているかどうかをチェックします。
座標はデカルト座標系での幾何学的なものです。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**入力パラメータ**

- `x, y` — 平面上の点の座標。
- `xᵢ, yᵢ` — `i`番目の楕円の中心の座標。
- `aᵢ, bᵢ` — x,y座標単位での`i`番目の楕円の軸。

入力パラメータは`2+4⋅n`でなければならず、ここで`n`は楕円の数です。

**返される値**

点が少なくとも1つの楕円の中にあれば`1`を、そうでなければ`0`を返します。

**例**

```sql
SELECT pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)
```

```text
┌─pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```

## pointInPolygon {#pointinpolygon}

与えられた点が平面上のポリゴンに含まれているかどうかをチェックします。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**入力値**

- `(x, y)` — 平面上の点の座標。データ型 — [タプル](../../data-types/tuple.md) — 2つの数値のタプル。
- `[(a, b), (c, d) ...]` — ポリゴンの頂点。データ型 — [配列](../../data-types/array.md)。各頂点は座標のペア`(a, b)`で表されます。頂点は時計回りまたは反時計回りの順序で指定する必要があります。最低数の頂点は3です。ポリゴンは定数でなければなりません。
- この関数は、穴のあるポリゴン（切り抜かれた部分）もサポートします。この場合、関数の追加引数を使用して切り抜かれた部分を定義するポリゴンを追加してください。この関数は非単連結ポリゴンをサポートしていません。

**返される値**

点がポリゴン内にあれば`1`を、そうでなければ`0`を返します。
点がポリゴンの境界上にある場合、関数は0または1のいずれかを返す可能性があります。

**例**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```
