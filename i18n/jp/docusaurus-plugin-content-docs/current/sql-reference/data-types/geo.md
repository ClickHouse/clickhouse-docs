---
'description': 'ClickHouse の地理的オブジェクトと位置を表現するために使用される幾何データ型の Documentation'
'sidebar_label': 'Geo'
'sidebar_position': 54
'slug': '/sql-reference/data-types/geo'
'title': '幾何学的'
'doc_type': 'reference'
---

ClickHouseは地理オブジェクトを表すためのデータ型をサポートしています — 位置、土地など。

**関連情報**
- [シンプルな地理的特徴の表現](https://en.wikipedia.org/wiki/GeoJSON)。

## Point {#point}

`Point` は、その X および Y 座標によって表され、[Tuple](tuple.md)([Float64](float.md), [Float64](float.md)) として格納されます。

**例**

クエリ:

```sql
CREATE TABLE geo_point (p Point) ENGINE = Memory();
INSERT INTO geo_point VALUES((10, 10));
SELECT p, toTypeName(p) FROM geo_point;
```
結果:

```text
┌─p───────┬─toTypeName(p)─┐
│ (10,10) │ Point         │
└─────────┴───────────────┘
```

## Ring {#ring}

`Ring` は、穴のない単純な多角形で、点の配列として保存されます: [Array](array.md)([Point](#point))。

**例**

クエリ:

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```
結果:

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```

## LineString {#linestring}

`LineString` は、点の配列として保存された線です: [Array](array.md)([Point](#point))。

**例**

クエリ:

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```
結果:

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```

## MultiLineString {#multilinestring}

`MultiLineString` は、複数の線が `LineString` の配列として保存されています: [Array](array.md)([LineString](#linestring))。

**例**

クエリ:

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```
結果:

```text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```

## Polygon {#polygon}

`Polygon` は、穴のある多角形で、リングの配列として保存されます: [Array](array.md)([Ring](#ring))。外側の配列の最初の要素は多角形の外形であり、以降のすべての要素は穴を示します。

**例**

これは穴のある多角形です:

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

結果:

```text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```

## MultiPolygon {#multipolygon}

`MultiPolygon` は、複数の多角形で構成されており、多角形の配列として保存されます: [Array](array.md)([Polygon](#polygon))。

**例**

このマルチポリゴンは、穴のない最初の多角形と、1つの穴のある2番目の多角形から構成されています:

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```
結果:

```text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```

## 関連コンテンツ {#related-content}

- [大規模なリアルワールドデータセットの探索: ClickHouseにおける100年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
