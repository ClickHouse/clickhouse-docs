---
description: 'Документация по геометрическим типам данных в ClickHouse, используемым для представления географических объектов и местоположений'
sidebar_label: 'Гео'
sidebar_position: 54
slug: /sql-reference/data-types/geo
title: 'Геометрические'
doc_type: 'reference'
---

ClickHouse поддерживает геометрические типы данных для представления географических объектов — местоположений, территорий и т. д.

**См. также**

- [Представление простых географических объектов](https://en.wikipedia.org/wiki/GeoJSON).

## Point \{#point\}

`Point` задаётся своими координатами X и Y, которые хранятся как [Tuple](tuple.md)([Float64](float.md), [Float64](float.md)).

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


## Кольцо \{#ring\}

`Ring` — это простой многоугольник без отверстий, хранящийся в виде массива точек: [Array](array.md)([Point](#point)).

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


## LineString \{#linestring\}

`LineString` — это линия, представленная в виде массива точек: [Array](array.md)([Point](#point)).

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


## MultiLineString \{#multilinestring\}

`MultiLineString` — это несколько линий, хранящихся в виде массива `LineString`: [Array](array.md)([LineString](#linestring)).

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


## Многоугольник \{#polygon\}

`Polygon` — многоугольник с отверстиями, представленный в виде массива колец: [Array](array.md)([Ring](#ring)). Первый элемент внешнего массива задаёт внешний контур многоугольника, а все последующие элементы — его отверстия.

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


## MultiPolygon \{#multipolygon\}

`MultiPolygon` состоит из нескольких полигонов и хранится как массив полигонов: [Array](array.md)([Polygon](#polygon)).

**Пример**

Этот мультиполигон состоит из двух отдельных полигонов — первый без отверстий, второй — с одним отверстием:

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


## Геометрия \{#geometry\}

`Geometry` — это общий тип для всех перечисленных выше типов. Он эквивалентен типу Variant, объединяющему эти типы.

**Пример**

```sql
CREATE TABLE IF NOT EXISTS geo (geom Geometry) ENGINE = Memory();
INSERT INTO geo VALUES ((1, 2));
SELECT * FROM geo;
```

Результат:

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
INSERT INTO geo_dst SELECT readWKT(geom) FROM geo ORDER BY id;

SELECT * FROM geo_dst;
```

Результат:

```text
   ┌─geom─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
2. │ (0,0)                                                                                                            │
3. │ [[[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]],[[(-10,-10),(-10,-9),(-9,10),(-10,-10)]]] │
4. │ [(1,0),(10,0),(10,10),(0,10),(1,0)]                                                                              │
5. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## Связанные материалы \\{#related-content\\}

- [Исследование масштабных реальных наборов данных: более чем 100 лет метеорологических наблюдений в ClickHouse](https://clickhouse.com/blog/real-world-data-noaa-climate-data)