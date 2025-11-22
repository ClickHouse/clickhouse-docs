---
description: '地理的オブジェクトや位置を表現するために使用される ClickHouse の幾何データ型に関するドキュメント'
sidebar_label: 'Geo'
sidebar_position: 54
slug: /sql-reference/data-types/geo
title: '幾何'
doc_type: 'reference'
---

ClickHouse では、位置や領域などの地理的オブジェクトを表現するためのデータ型をサポートしています。

**関連項目**
- [単純な地理情報フィーチャの表現](https://en.wikipedia.org/wiki/GeoJSON)



## Point {#point}

`Point`はX座標とY座標で表され、[Tuple](tuple.md)([Float64](float.md), [Float64](float.md))として格納されます。

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

`Ring`は、点の配列として格納される穴のない単純なポリゴンです：[Array](array.md)([Point](#point))。

**例**

クエリ：

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```

結果：

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```


## LineString {#linestring}

`LineString`は、点の配列として格納される線です：[Array](array.md)([Point](#point))。

**例**

クエリ：

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```

結果：

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```


## MultiLineString {#multilinestring}

`MultiLineString`は、複数の線を`LineString`の配列として格納します：[Array](array.md)([LineString](#linestring))。

**例**

クエリ：

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```

結果：

```text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```


## Polygon {#polygon}

`Polygon`は、穴を持つポリゴンをリングの配列として格納したものです：[Array](array.md)([Ring](#ring))。外側の配列の最初の要素がポリゴンの外形で、それ以降のすべての要素が穴になります。

**例**

以下は1つの穴を持つポリゴンの例です：

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

結果：

```text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```


## MultiPolygon {#multipolygon}

`MultiPolygon`は複数のポリゴンで構成され、ポリゴンの配列として格納されます：[Array](array.md)([Polygon](#polygon))。

**例**

このマルチポリゴンは2つの独立したポリゴンで構成されています — 1つ目は穴なし、2つ目は穴が1つあります：

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```

結果：

```text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```


## Geometry {#geometry}

`Geometry`は上記のすべての型に対する共通型です。これらの型のVariantと同等です。

**例**

```sql
CREATE TABLE IF NOT EXISTS geo (geom Geometry) ENGINE = Memory();
INSERT INTO geo VALUES ((1, 2));
SELECT * FROM geo;
```

結果:

```text
   ┌─geom──┐
1. │ (1,2) │
   └───────┘
```

<!-- -->

```sql
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();

CREATE TABLE IF NOT EXISTS geo (geom String, id Int) ENGINE = Memory();
INSERT INTO geo VALUES ('POLYGON((1 0,10 0,10 10,0 10,1 0),(4 4,5 4,5 5,4 5,4 4))', 1);
INSERT INTO geo VALUES ('POINT(0 0)', 2);
INSERT INTO geo VALUES ('MULTIPOLYGON(((1 0,10 0,10 10,0 10,1 0),(4 4,5 4,5 5,4 5,4 4)),((-10 -10,-10 -9,-9 10,-10 -10)))', 3);
INSERT INTO geo VALUES ('LINESTRING(1 0,10 0,10 10,0 10,1 0)', 4);
INSERT INTO geo VALUES ('MULTILINESTRING((1 0,10 0,10 10,0 10,1 0),(4 4,5 4,5 5,4 5,4 4))', 5);
INSERT INTO geo_dst SELECT readWkt(geom) FROM geo ORDER BY id;

SELECT * FROM geo_dst;
```

結果:

```text
   ┌─geom─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
2. │ (0,0)                                                                                                            │
3. │ [[[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]],[[(-10,-10),(-10,-9),(-9,10),(-10,-10)]]] │
4. │ [(1,0),(10,0),(10,10),(0,10),(1,0)]                                                                              │
5. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 関連コンテンツ {#related-content}

- [大規模な実世界データセットの探索：ClickHouseで扱う100年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
