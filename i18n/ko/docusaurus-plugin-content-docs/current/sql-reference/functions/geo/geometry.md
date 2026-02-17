---
description: 'Geometry 함수 문서'
sidebar_label: 'Geometry'
slug: /sql-reference/functions/geo/geometry
title: 'Geometry 작업을 위한 함수들'
doc_type: 'reference'
---

## Geometry \{#geometry\}

Geometry 함수는 POLYGON, LINESTRING, MULTIPOLYGON, MULTILINESTRING, RING, POINT와 같은 기하 타입의 둘레와 면적을 계산할 수 있도록 합니다. Geometry 타입에서 이러한 기하 객체를 사용합니다. 입력 값이 `NULL`이면 아래의 모든 함수는 0을 반환합니다.

## perimeterCartesian \{#perimetercartesian\}

Cartesian(평면) 좌표계에서 주어진 Geometry 객체의 둘레를 계산합니다.

**구문**

```sql
perimeterCartesian(geom)
```

**인자**

* `geom` — 기하 객체입니다. [Geometry](../../data-types/geo.md).

**반환 값**

* Number — 좌표계 단위로 표현된 객체의 둘레 길이입니다. [Float64](../../data-types/float.md).

**예시**

```sql title="Query"
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWKT('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT perimeterCartesian(geom) FROM geo_dst;
```

```response title="Response"
┌─perimeterCartesian(geom)─┐
│ 4.0                      │
└──────────────────────────┘
```


## areaCartesian \{#areacartesian\}

Cartesian 좌표계에서 주어진 Geometry 객체의 면적을 계산합니다.

**구문**

```sql
areaCartesian(geom)
```

**인수**

* `geom` — Geometry 객체. [Geometry](../../data-types/geo.md).

**반환 값**

* Number — 좌표계 단위로 표현된 객체의 면적. [Float64](../../data-types/float.md).

**예시**

```sql title="Query"
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWKT('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaCartesian(geom) FROM geo_dst;
```

```response title="Response"
┌─areaCartesian(geom)─┐
│ -1                  │
└─────────────────────┘
```


## perimeterSpherical \{#perimeterspherical\}

구 표면상에서 Geometry 객체의 둘레를 계산합니다.

**구문**

```sql
perimeterSpherical(geom)
```

**인수**

* `geom` — 지오메트리 객체. [Geometry](../../data-types/geo.md).

**반환 값**

* 수 — 둘레 길이. [Float64](../../data-types/float.md).

**예제**

```sql title="Query"
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWKT('LINESTRING(0 0,1 0,1 1,0 1,0 0)');
SELECT perimeterSpherical(geom) FROM geo_dst;
```

```response title="Response"
┌─perimeterSpherical(geom)─┐
│ 0                        │
└──────────────────────────┘
```


## areaSpherical \{#areaspherical\}

구의 표면 위에 있는 Geometry 객체의 면적을 계산합니다.

**Syntax**

```sql
areaSpherical(geom)
```

**인수**

* `geom` — Geometry 형식의 기하 데이터. [Geometry](../../data-types/geo.md).

**반환 값**

* 숫자 — 면적 값. [Float64](../../data-types/float.md).

**예제**

```sql title="Query"
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWKT('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaSpherical(geom) FROM geo_dst;
```

```response title="Response"
┌─areaSpherical(geom)────┐
│ -0.0003046096848622019 │
└────────────────────────┘
```
