---
'description': 'Coordinatesに関するDocumentation'
'sidebar_label': '地理座標'
'slug': '/sql-reference/functions/geo/coordinates'
'title': '地理座標を操作するための関数'
'doc_type': 'reference'
---

## greatCircleDistance {#greatcircledistance}

地球の表面にある2点間の距離を [大円公式](https://en.wikipedia.org/wiki/Great-circle_distance) を使用して計算します。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度（度単位）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度（度単位）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球の表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合、例外が生成されます。

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

`greatCircleDistance` に似ていますが、球体の代わりに WGS-84 楕円体上で距離を計算します。これは地球のジオイドのより正確な近似です。
パフォーマンスは `greatCircleDistance` と同じです（パフォーマンスの欠点はありません）。地球上の距離を計算するために `geoDistance` を使用することをお勧めします。

技術的注記: 十分に近い点の場合、座標の中点で接平面上のメトリックを使用して距離を平面近似で計算します。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat1Deg` — 最初の点の緯度（度単位）。範囲: `[-90°, 90°]`。
- `lon2Deg` — 2番目の点の経度（度単位）。範囲: `[-180°, 180°]`。
- `lat2Deg` — 2番目の点の緯度（度単位）。範囲: `[-90°, 90°]`。

正の値は北緯および東経に対応し、負の値は南緯および西経に対応します。

**返される値**

地球の表面上の2点間の距離（メートル単位）。

入力パラメータの値が範囲外の場合、例外が生成されます。

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

地球の表面上の2点間の中心角を [大円公式](https://en.wikipedia.org/wiki/Great-circle_distance) を使用して計算します。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**入力パラメータ**

- `lon1Deg` — 最初の点の経度（度単位）。
- `lat1Deg` — 最初の点の緯度（度単位）。
- `lon2Deg` — 2番目の点の経度（度単位）。
- `lat2Deg` — 2番目の点の緯度（度単位）。

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

点が少なくとも1つの楕円に属しているかどうかを確認します。座標はデカルト座標系における幾何学的なものです。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**入力パラメータ**

- `x, y` — 平面上の点の座標。
- `xᵢ, yᵢ` — `i` 番目の楕円の中心の座標。
- `aᵢ, bᵢ` — 楕円の `i` 番目の軸の x, y 座標の単位。

入力パラメータは `2+4⋅n` である必要があり、ここで `n` は楕円の数です。

**返される値**

点が少なくとも1つの楕円の中にある場合は `1`、そうでない場合は `0`。

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

点が平面上の多角形に属しているかどうかを確認します。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**入力値**

- `(x, y)` — 平面上の点の座標。データ型 — [Tuple](../../data-types/tuple.md) — 2つの数のタプル。
- `[(a, b), (c, d) ...]` — 多角形の頂点。データ型 — [Array](../../data-types/array.md)。各頂点は座標のペア `(a, b)` で表されます。頂点は時計回りまたは反時計回りの順序で指定する必要があります。最小の頂点数は3です。多角形は定数である必要があります。
- この関数は穴のある多角形（切り取られた部分）をサポートします。データ型 — [Polygon](../../data-types/geo.md/#polygon)。全体の `Polygon` を2番目の引数として渡すか、外周を最初に渡し、その後各穴を別の追加引数として渡します。
- この関数はマルチポリゴンもサポートします。データ型 — [MultiPolygon](../../data-types/geo.md/#multipolygon)。全体の `MultiPolygon` を2番目の引数として渡すか、各構成多角形をそれぞれの引数としてリストします。

**返される値**

点が多角形の中にある場合は `1`、そうでない場合は `0`。
点が多角形の境界上にある場合、関数は0または1のいずれかを返すことがあります。

**例**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```

> **注**  
> • `validate_polygons = 0` を設定すると、ジオメトリ検証をスキップできます。  
> • `pointInPolygon` はすべての多角形が正しく形成されていることを前提としています。入力が自己交差している場合やリングの順序が間違っている場合、あるいは辺が重なっている場合、結果は信頼できなくなります—特に点がちょうど辺、頂点、または自己交差の内部にある場合、「内部」と「外部」の概念が定義されていません。
