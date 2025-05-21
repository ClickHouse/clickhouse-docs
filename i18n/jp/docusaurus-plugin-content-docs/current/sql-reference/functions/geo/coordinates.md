---
description: '座標に関するドキュメント'
sidebar_label: '地理的座標'
sidebar_position: 62
slug: /sql-reference/functions/geo/coordinates
title: '地理的座標を扱うための関数'
---

## greatCircleDistance {#greatcircledistance}

[大円の公式](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して、地球表面上の2点間の距離を計算します。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度（度）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度（度）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合は例外が発生します。

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

`greatCircleDistance`と似ていますが、球体の代わりにWGS-84楕円体上で距離を計算します。これは、地球のジオイドのより正確な近似です。
パフォーマンスは`greatCircleDistance`と同じです（パフォーマンスの劣化はありません）。地球上の距離を計算するために`geoDistance`を使用することをお勧めします。

技術的な注意: 近接したポイントの場合、座標の中点で接平面上のメトリックを使用して距離を計算します。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度（度）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度（度）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度（度）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合は例外が発生します。

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

[大円の公式](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して、地球表面上の2点間の中心角を計算します。

```sql
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

```sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

```text
┌─arc─┐
│  45 │
└─────┘
```

## pointInEllipses {#pointinellipses}

点が少なくとも1つの楕円に属するかどうかをチェックします。
座標は直交座標系における幾何学的なものです。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**入力パラメータ**

- `x, y` — 平面上の点の座標。
- `xᵢ, yᵢ` — `i`-番目の楕円の中心の座標。
- `aᵢ, bᵢ` — x、y座標の単位での`i`-番目の楕円の軸。

入力パラメータは`2+4⋅n`でなければならず、`n`は楕円の数です。

**返される値**

点が少なくとも1つの楕円の内側にある場合は`1`、そうでない場合は`0`を返します。

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

点が平面上のポリゴンに属するかどうかをチェックします。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**入力値**

- `(x, y)` — 平面上の点の座標。データ型 — [タプル](../../data-types/tuple.md) — 二つの数のタプル。
- `[(a, b), (c, d) ...]` — ポリゴンの頂点。データ型 — [配列](../../data-types/array.md)。各頂点は座標のペア`(a, b)`によって表されます。頂点は時計回りまたは反時計回りの順序で指定する必要があります。頂点の最小数は3です。ポリゴンは定数である必要があります。
- 関数は穴のあるポリゴン（切り抜かれた部分）もサポートしています。この場合、関数の追加引数を使用して切り抜かれた部分を定義するポリゴンを追加します。関数は単純接続されていないポリゴンに対してはサポートしていません。

**返される値**

点がポリゴンの内側にある場合は`1`、そうでない場合は`0`を返します。
点がポリゴンの境界上にある場合、関数は`0`または`1`のいずれかを返すことがあります。

**例**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```
