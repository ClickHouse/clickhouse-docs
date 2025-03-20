---
slug: /sql-reference/data-types/geo
sidebar_position: 54
sidebar_label: Geo
title: "幾何学"
---

ClickHouseは、地理的オブジェクト—場所、土地などを表現するためのデータ型をサポートしています。

**関連情報**
- [シンプルな地理的特徴の表現](https://en.wikipedia.org/wiki/GeoJSON)。

## Point {#point}

`Point`は、そのXおよびY座標によって表現され、[Tuple](tuple.md)([Float64](float.md), [Float64](float.md))として保存されます。

**例**

クエリ:

```sql
CREATE TABLE geo_point (p Point) ENGINE = Memory();
INSERT INTO geo_point VALUES((10, 10));
SELECT p, toTypeName(p) FROM geo_point;
```
結果:

``` text
┌─p───────┬─toTypeName(p)─┐
│ (10,10) │ Point         │
└─────────┴───────────────┘
```

## Ring {#ring}

`Ring`は、穴のない単純な多角形で、ポイントの配列として保存されます: [Array](array.md)([Point](#point))。

**例**

クエリ:

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```
結果:

``` text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```

## LineString {#linestring}

`LineString`は、ポイントの配列として保存された線です: [Array](array.md)([Point](#point))。

**例**

クエリ:

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```
結果:

``` text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```

## MultiLineString {#multilinestring}

`MultiLineString`は、`LineString`の配列として保存される複数の線です: [Array](array.md)([LineString](#linestring))。

**例**

クエリ:

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```
結果:

``` text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```

## Polygon {#polygon}

`Polygon`は、リングの配列として保存される穴のある多角形です: [Array](array.md)([Ring](#ring))。外側の配列の最初の要素は多角形の外形で、続くすべての要素は穴です。

**例**

これは1つの穴を持つ多角形です:

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

結果:

``` text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```

## MultiPolygon {#multipolygon}

`MultiPolygon`は、複数の多角形で構成され、配列として保存されます: [Array](array.md)([Polygon](#polygon))。

**例**

このマルチポリゴンは、穴のない最初の多角形と1つの穴を持つ2番目の多角形の2つの独立した多角形で構成されています:

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```
結果:

``` text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```

## 関連コンテンツ {#related-content}

- [ClickHouseにおける大規模な実世界データセットの探索: 100年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
