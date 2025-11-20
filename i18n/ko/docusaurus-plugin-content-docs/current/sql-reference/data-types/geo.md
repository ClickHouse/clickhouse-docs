---
'description': 'ClickHouse에서 지리적 객체 및 위치를 나타내기 위해 사용되는 기하학적 데이터 유형에 대한 문서'
'sidebar_label': 'Geo'
'sidebar_position': 54
'slug': '/sql-reference/data-types/geo'
'title': '기하학적'
'doc_type': 'reference'
---

ClickHouse는 지리적 객체—위치, 땅 등을 표현하기 위한 데이터 유형을 지원합니다.

**참고**  
- [간단한 지리적 특징 표현하기](https://en.wikipedia.org/wiki/GeoJSON).

## Point {#point}

`Point`는 X 및 Y 좌표로 표현되며, [튜플](tuple.md)([Float64](float.md), [Float64](float.md))로 저장됩니다.

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

## Ring {#ring}

`Ring`는 구멍 없는 단순 다각형으로, 점 배열로 저장됩니다: [Array](array.md)([Point](#point)).

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

## LineString {#linestring}

`LineString`는 점 배열로 저장된 선입니다: [Array](array.md)([Point](#point)).

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

## MultiLineString {#multilinestring}

`MultiLineString`는 여러 선으로, [LineString](#linestring) 배열로 저장됩니다: [Array](array.md)([LineString](#linestring)).

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

## Polygon {#polygon}

`Polygon`은 구멍이 있는 다각형으로, [Ring](#ring)의 배열로 저장됩니다: [Array](array.md)([Ring](#ring)). 외부 배열의 첫 번째 요소는 폴리곤의 외곽 형태이며, 모든 후속 요소는 구멍입니다.

**예시**

이는 하나의 구멍을 가진 다각형입니다:

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

## MultiPolygon {#multipolygon}

`MultiPolygon`은 여러 다각형으로 구성되며, 다각형 배열로 저장됩니다: [Array](array.md)([Polygon](#polygon)).

**예시**

이 멀티폴리곤은 두 개의 별도 다각형으로 구성됩니다 — 첫 번째는 구멍이 없고, 두 번째는 하나의 구멍이 있습니다:

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

## Geometry {#geometry}

`Geometry`는 위의 모든 유형에 대한 공통 유형입니다. 이 유형들의 변형에 해당합니다.

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

## 관련 콘텐츠 {#related-content}

- [대규모 실제 데이터 세트 탐색하기: ClickHouse의 100년 이상의 기상 기록](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
