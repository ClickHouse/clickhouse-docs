---
description: '座標に関するドキュメント'
sidebar_label: '地理座標'
slug: /sql-reference/functions/geo/coordinates
title: '地理座標を扱う関数'
doc_type: 'reference'
---



## greatCircleDistance {#greatcircledistance}

[大圏距離の公式](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して、地球表面上の2点間の距離を計算します。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 第1点の経度(度単位)。範囲:`[-180°, 180°]`
- `lat1Deg` — 第1点の緯度(度単位)。範囲:`[-90°, 90°]`
- `lon2Deg` — 第2点の経度(度単位)。範囲:`[-180°, 180°]`
- `lat2Deg` — 第2点の緯度(度単位)。範囲:`[-90°, 90°]`

正の値は北緯と東経に対応し、負の値は南緯と西経に対応します。

**戻り値**

地球表面上の2点間の距離(メートル単位)。

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

`greatCircleDistance`と同様ですが、球面ではなくWGS-84楕円体上の距離を計算します。これは地球ジオイドのより正確な近似です。
パフォーマンスは`greatCircleDistance`と同じです(パフォーマンスの低下はありません)。地球上の距離を計算する場合は`geoDistance`の使用を推奨します。

技術的な注記: 十分に近い点については、座標の中点における接平面上の計量を用いた平面近似により距離を計算します。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度(度単位)。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度(度単位)。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度(度単位)。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度(度単位)。範囲: `[-90°, 90°]`。

正の値は北緯と東経に対応し、負の値は南緯と西経に対応します。

**戻り値**

地球表面上の2点間の距離(メートル単位)。

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

[大圏距離の公式](https://en.wikipedia.org/wiki/Great-circle_distance)を使用して、地球表面上の2点間の中心角を計算します。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 1点目の経度(度単位)。
- `lat1Deg` — 1点目の緯度(度単位)。
- `lon2Deg` — 2点目の経度(度単位)。
- `lat2Deg` — 2点目の緯度(度単位)。

**戻り値**

2点間の中心角(度単位)。

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

点が少なくとも1つの楕円に含まれるかどうかを判定します。
座標はデカルト座標系における幾何学的座標です。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**入力パラメータ**

- `x, y` — 平面上の点の座標。
- `xᵢ, yᵢ` — `i`番目の楕円の中心座標。
- `aᵢ, bᵢ` — `i`番目の楕円の軸の長さ(x, y座標の単位)。

入力パラメータは`2+4⋅n`個である必要があります。ここで`n`は楕円の数です。

**戻り値**

点が少なくとも1つの楕円の内部にある場合は`1`、そうでない場合は`0`。

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

平面上の点がポリゴン内に含まれるかどうかを判定します。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**入力値**

- `(x, y)` — 平面上の点の座標。データ型 — [Tuple](../../data-types/tuple.md) — 2つの数値のタプル。
- `[(a, b), (c, d) ...]` — ポリゴンの頂点。データ型 — [Array](../../data-types/array.md)。各頂点は座標のペア `(a, b)` で表されます。頂点は時計回りまたは反時計回りの順序で指定する必要があります。頂点の最小数は3です。ポリゴンは定数である必要があります。
- この関数は穴(切り抜き部分)を持つポリゴンをサポートします。データ型 — [Polygon](../../data-types/geo.md/#polygon)。`Polygon` 全体を第2引数として渡すか、外側のリングを最初に渡してから各穴を個別の追加引数として渡します。
- この関数はマルチポリゴンもサポートします。データ型 — [MultiPolygon](../../data-types/geo.md/#multipolygon)。`MultiPolygon` 全体を第2引数として渡すか、各構成ポリゴンを個別の引数として列挙します。

**戻り値**

点がポリゴン内にある場合は `1`、そうでない場合は `0` を返します。
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

> **注意**  
> • `validate_polygons = 0` を設定することで、ジオメトリ検証をバイパスできます。  
> • `pointInPolygon` は、すべてのポリゴンが適切に形成されていることを前提としています。入力が自己交差している場合、リングの順序が誤っている場合、またはエッジが重複している場合、結果は信頼できなくなります。特に、エッジ上、頂点上、または「内側」と「外側」の概念が未定義である自己交差内に正確に位置する点については顕著です。
