---
description: '지리적 객체와 위치를 표현하는 데 사용되는 ClickHouse의 기하학적 데이터 타입에 대한 문서입니다.'
sidebar_label: '지리(Geo)'
sidebar_position: 54
slug: /sql-reference/data-types/geo
title: '기하(Geometric)'
doc_type: 'reference'
---

ClickHouse는 위치, 지형 등 지리적 객체를 표현하기 위한 데이터 타입을 지원합니다.

**관련 자료**

- [단순 지리 공간 객체 표현](https://en.wikipedia.org/wiki/GeoJSON).

## Point \{#point\}

`Point`는 X와 Y 좌표로 구성되며, [Tuple](tuple.md)([Float64](float.md), [Float64](float.md))로 저장됩니다.

**예시**

쿼리:

```sql
CREATE TABLE geo_point (p Point) ENGINE = Memory();
INSERT INTO geo_point VALUES((10, 10));
SELECT p, toTypeName(p) FROM geo_point;
```

결과:

```text
┌─p───────┬─toTypeName(p)─┐
│ (10,10) │ Point         │
└─────────┴───────────────┘
```


## Ring \{#ring\}

`Ring`은 구멍이 없는 단순 폴리곤으로, 점(Point)들의 배열인 [Array](array.md)([Point](#point)) 형태로 저장됩니다.

**예시**

쿼리:

```sql
CREATE TABLE geo_ring (r Ring) ENGINE = Memory();
INSERT INTO geo_ring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT r, toTypeName(r) FROM geo_ring;
```

결과:

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ Ring          │
└───────────────────────────────┴───────────────┘
```


## LineString \{#linestring\}

`LineString`은 점들의 배열로 표현되는 선형 객체입니다: [Array](array.md)([Point](#point)).

**예시**

쿼리:

```sql
CREATE TABLE geo_linestring (l LineString) ENGINE = Memory();
INSERT INTO geo_linestring VALUES([(0, 0), (10, 0), (10, 10), (0, 10)]);
SELECT l, toTypeName(l) FROM geo_linestring;
```

결과:

```text
┌─r─────────────────────────────┬─toTypeName(r)─┐
│ [(0,0),(10,0),(10,10),(0,10)] │ LineString    │
└───────────────────────────────┴───────────────┘
```


## MultiLineString \{#multilinestring\}

`MultiLineString`은 여러 개의 선을 `LineString`의 배열로 저장하는 자료형입니다: [Array](array.md)([LineString](#linestring)).

**예시**

쿼리:

```sql
CREATE TABLE geo_multilinestring (l MultiLineString) ENGINE = Memory();
INSERT INTO geo_multilinestring VALUES([[(0, 0), (10, 0), (10, 10), (0, 10)], [(1, 1), (2, 2), (3, 3)]]);
SELECT l, toTypeName(l) FROM geo_multilinestring;
```

결과:

```text
┌─l───────────────────────────────────────────────────┬─toTypeName(l)───┐
│ [[(0,0),(10,0),(10,10),(0,10)],[(1,1),(2,2),(3,3)]] │ MultiLineString │
└─────────────────────────────────────────────────────┴─────────────────┘
```


## Polygon \{#polygon\}

`Polygon`은 [Ring](#ring)의 [Array](array.md)로 저장되는, 구멍을 가진 다각형입니다. 바깥 배열의 첫 번째 요소는 다각형의 외곽 경계이고, 그 뒤의 모든 요소는 내부의 구멍입니다.

**예시**

다음은 하나의 구멍을 가진 다각형입니다:

```sql
CREATE TABLE geo_polygon (pg Polygon) ENGINE = Memory();
INSERT INTO geo_polygon VALUES([[(20, 20), (50, 20), (50, 50), (20, 50)], [(30, 30), (50, 50), (50, 30)]]);
SELECT pg, toTypeName(pg) FROM geo_polygon;
```

결과:

```text
┌─pg────────────────────────────────────────────────────────────┬─toTypeName(pg)─┐
│ [[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]] │ Polygon        │
└───────────────────────────────────────────────────────────────┴────────────────┘
```


## MultiPolygon \{#multipolygon\}

`MultiPolygon`은 여러 개의 다각형으로 이루어져 있으며, 다각형 배열로 저장됩니다: [Array](array.md)([Polygon](#polygon)).

**예시**

이 `MultiPolygon`은 서로 분리된 두 개의 다각형으로 구성되어 있으며, 첫 번째 다각형은 구멍이 없고 두 번째 다각형은 하나의 구멍을 포함합니다:

```sql
CREATE TABLE geo_multipolygon (mpg MultiPolygon) ENGINE = Memory();
INSERT INTO geo_multipolygon VALUES([[[(0, 0), (10, 0), (10, 10), (0, 10)]], [[(20, 20), (50, 20), (50, 50), (20, 50)],[(30, 30), (50, 50), (50, 30)]]]);
SELECT mpg, toTypeName(mpg) FROM geo_multipolygon;
```

결과:

```text
┌─mpg─────────────────────────────────────────────────────────────────────────────────────────────┬─toTypeName(mpg)─┐
│ [[[(0,0),(10,0),(10,10),(0,10)]],[[(20,20),(50,20),(50,50),(20,50)],[(30,30),(50,50),(50,30)]]] │ MultiPolygon    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────┘
```


## Geometry \{#geometry\}

`Geometry`는 위의 모든 타입에 공통적으로 사용되는 타입입니다. 이들 타입의 Variant와 동일합니다.

**예시**

```sql
CREATE TABLE IF NOT EXISTS geo (geom Geometry) ENGINE = Memory();
INSERT INTO geo VALUES ((1, 2));
SELECT * FROM geo;
```

결과:

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

결과:

```text
   ┌─geom─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
2. │ (0,0)                                                                                                            │
3. │ [[[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]],[[(-10,-10),(-10,-9),(-9,10),(-10,-10)]]] │
4. │ [(1,0),(10,0),(10,10),(0,10),(1,0)]                                                                              │
5. │ [[(1,0),(10,0),(10,10),(0,10),(1,0)],[(4,4),(5,4),(5,5),(4,5),(4,4)]]                                            │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 관련 콘텐츠 \{#related-content\}

- [방대한 실세계 데이터 세트 탐색: ClickHouse로 살펴보는 100년이 넘는 기상 기록](https://clickhouse.com/blog/real-world-data-noaa-climate-data)