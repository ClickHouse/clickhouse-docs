---
description: 'Документация для геометрических типов данных в ClickHouse, используемых для представления
  географических объектов и локаций'
sidebar_label: 'Гео'
sidebar_position: 54
slug: /sql-reference/data-types/geo
title: 'Геометрические'
---

ClickHouse поддерживает типы данных для представления географических объектов — локаций, земель и т.д.

**См. также**
- [Представление простых географических объектов](https://en.wikipedia.org/wiki/GeoJSON).

## Point {#point}

`Point` представляется своими координатами X и Y, которые хранятся как [Tuple](tuple.md)([Float64](float.md), [Float64](float.md)).

**Пример**

Запрос:

```sql
CREATE TABLE geo_point (p Point) ENGINE = Memory();
INSERT INTO geo_point VALUES((10, 10));
SELECT p, toTypeName(p) FROM geo_point;
```
Результат:

```text
┌─p───────┬─toTypeName(p)─┐
│ (10,10) │ Point         │
└─────────┴───────────────┘
```

## Ring {#ring}

`Ring` — это простой многоугольник без отверстий, хранящийся как массив точек: [Array](array.md)([Point](#point)).

**Пример**

Запрос:

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```
Результат:

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```

## LineString {#linestring}

`LineString` — это линия, хранящаяся как массив точек: [Array](array.md)([Point](#point)).

**Пример**

Запрос:

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```
Результат:

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```

## MultiLineString {#multilinestring}

`MultiLineString` — это несколько линий, хранящихся как массив `LineString`: [Array](array.md)([LineString](#linestring)).

**Пример**

Запрос:

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```
Результат:

```text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```

## Polygon {#polygon}

`Polygon` — это многоугольник с отверстиями, хранящийся как массив колец: [Array](array.md)([Ring](#ring)). Первый элемент внешнего массива представляет собой внешнюю форму многоугольника, а все последующие элементы — это отверстия.

**Пример**

Это многоугольник с одним отверстием:

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

Результат:

```text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```

## MultiPolygon {#multipolygon}

`MultiPolygon` состоит из нескольких многоугольников и хранится как массив многоугольников: [Array](array.md)([Polygon](#polygon)).

**Пример**

Этот мультиполиго́н состоит из двух отдельных многоугольников — первый без отверстий, а второй с одним отверстием:

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```
Результат:

```text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```

## Related Content {#related-content}

- [Изучение масштабных реальных наборов данных: более 100 лет метеорологических записей в ClickHouse](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
