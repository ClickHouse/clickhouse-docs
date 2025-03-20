---
slug: /sql-reference/data-types/geo
sidebar_position: 54
sidebar_label: 地理
title: "几何"
---

ClickHouse 支持用于表示地理对象的数据类型——位置、土地等。

**另见**
- [表示简单地理特征](https://en.wikipedia.org/wiki/GeoJSON)。

## 点 {#point}

`Point` 由其 X 和 Y 坐标表示，存储为一个 [Tuple](tuple.md)([Float64](float.md), [Float64](float.md))。

**示例**

查询：

```sql
CREATE TABLE geo_point (p Point) ENGINE = Memory();
INSERT INTO geo_point VALUES((10, 10));
SELECT p, toTypeName(p) FROM geo_point;
```
结果：

``` text
┌─p───────┬─toTypeName(p)─┐
│ (10,10) │ Point         │
└─────────┴───────────────┘
```

## 环 {#ring}

`Ring` 是一个简单的多边形，没有孔，存储为一个点的数组：[Array](array.md)([Point](#point))。

**示例**

查询：

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```
结果：

``` text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```

## 线串 {#linestring}

`LineString` 是一条线，存储为一个点的数组：[Array](array.md)([Point](#point))。

**示例**

查询：

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```
结果：

``` text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```

## 多线串 {#multilinestring}

`MultiLineString` 是多条线，存储为一个 `LineString` 的数组：[Array](array.md)([LineString](#linestring))。

**示例**

查询：

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```
结果：

``` text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```

## 多边形 {#polygon}

`Polygon` 是一个有孔的多边形，存储为一个环的数组：[Array](array.md)([Ring](#ring))。外部数组的第一个元素是多边形的外形，后面所有元素是孔。

**示例**

这是一个有一个孔的多边形：

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

结果：

``` text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```

## 多边形集合 {#multipolygon}

`MultiPolygon` 由多个多边形组成，存储为一个多边形的数组：[Array](array.md)([Polygon](#polygon))。

**示例**

这个多边形集合由两个独立的多边形组成——第一个没有孔，第二个有一个孔：

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```
结果：

``` text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```

## 相关内容 {#related-content}

- [探索庞大的真实世界数据集：ClickHouse 中的 100 多年的气象记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
