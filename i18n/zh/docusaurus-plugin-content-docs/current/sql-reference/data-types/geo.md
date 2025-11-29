---
description: 'ClickHouse 中用于表示地理对象和位置的几何数据类型'
sidebar_label: '地理'
sidebar_position: 54
slug: /sql-reference/data-types/geo
title: '几何数据类型'
doc_type: 'reference'
---

ClickHouse 支持用于表示地理对象（例如位置、区域等）的数据类型。

**另请参阅**
- [简单地理要素的表示](https://en.wikipedia.org/wiki/GeoJSON)。



## Point {#point}

`Point` 由其 X 和 Y 坐标表示，存储为 [Tuple](tuple.md)([Float64](float.md), [Float64](float.md))。

**示例**

查询：

```sql
CREATE TABLE geo_point (p Point) ENGINE = Memory();
INSERT INTO geo_point VALUES((10, 10));
SELECT p, toTypeName(p) FROM geo_point;
```

结果：

```text
┌─p───────┬─toTypeName(p)─┐
│ (10,10) │ Point         │
└─────────┴───────────────┘
```


## 环 {#ring}

`Ring` 是一种没有孔洞的简单多边形，表示为点的数组：[Array](array.md)([Point](#point))。

**示例**

查询：

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```

结果：

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```


## LineString {#linestring}

`LineString` 是以点数组形式存储的一条线：[Array](array.md)([Point](#point))。

**示例**

查询：

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```

结果：

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```


## MultiLineString {#multilinestring}

`MultiLineString` 是由多条线构成的 `LineString` 数组：[Array](array.md)([LineString](#linestring))。

**示例**

查询：

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```

结果：

```text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```


## Polygon {#polygon}

`Polygon` 是一种带孔多边形，存储为由环组成的数组：[Array](array.md)([Ring](#ring))。外层数组的第一个元素是多边形的外边界，其后的所有元素表示孔。

**示例**

这是一个带有一个孔的多边形：

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

Result：

```text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```


## MultiPolygon {#multipolygon}

`MultiPolygon` 由多个多边形组成，并以多边形数组的形式存储：[Array](array.md)([Polygon](#polygon))。

**示例**

此 MultiPolygon 由两个独立的多边形组成——第一个没有空洞，第二个有一个空洞：

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```

结果：

```text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```


## Geometry {#geometry}

`Geometry` 是上述所有类型的通用类型。它等价于这些类型的 `Variant`。

**示例**

```sql
CREATE TABLE IF NOT EXISTS geo (geom Geometry) ENGINE = Memory();
INSERT INTO geo VALUES ((1, 2));
SELECT * FROM geo;
```

结果：

```text
   ┌─geom──┐
1. │ (1,2) │
   └───────┘
```

{/* */ }

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

结果：

```text
   ┌─geom─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
2. │ (0,0)                                                                                                            │
3. │ [[[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]],[[(-10,-10),(-10,-9),(-9,10),(-10,-10)]]] │
4. │ [(1,0),(10,0),(10,10),(0,10),(1,0)]                                                                              │
5. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 相关内容 {#related-content}

- [探索海量真实世界数据集：ClickHouse 中逾 100 年的气象记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
