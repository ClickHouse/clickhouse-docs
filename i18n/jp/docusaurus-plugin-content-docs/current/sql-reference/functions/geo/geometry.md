---
description: 'ジオメトリ関数に関するドキュメント'
sidebar_label: 'ジオメトリ'
slug: /sql-reference/functions/geo/geometry
title: 'ジオメトリを扱う関数'
doc_type: 'reference'
---



## ジオメトリ {#geometry}

ジオメトリ関数を使用すると、POLYGON、LINESTRING、MULTIPOLYGON、MULTILINESTRING、RING、POINT などのジオメトリ型に対して周長および面積を計算できます。ジオメトリは Geometry 型で扱います。入力値が `NULL` の場合、以下のすべての関数は 0 を返します。



## perimeterCartesian {#perimetercartesian}

与えられた Geometry オブジェクトの周長を、デカルト（平面）座標系で計算します。

**構文**
perimeterCartesian(geom)

**入力値**
- `geom` — Geometry オブジェクト。[Geometry](../../data-types/geo.md)。

**戻り値**
- 数値 — 座標系の単位で表されるオブジェクトの周長。[Float64](../../data-types/float.md)。

**例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT perimeterCartesian(geom) FROM geo_dst;

結果:
┌─perimeterCartesian(geom)─┐
│ 4.0 │
└──────────────────────────┘



## areaCartesian {#areacartesian}

与えられた Geometry オブジェクトの面積をデカルト座標系で計算します。

**構文**
areaCartesian(geom)

**入力値**
- `geom` — Geometry オブジェクト。[Geometry](../../data-types/geo.md) 型。

**返される値**
- 数値 — 座標系の単位で表されるオブジェクトの面積。[Float64](../../data-types/float.md) 型。

**例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaCartesian(geom) FROM geo_dst;

結果:
┌─areaCartesian(geom)─┐
│ -1 │
└─────────────────────┘



## perimeterSpherical {#perimeterspherical}

球面上の Geometry オブジェクトの周長を計算します。

**構文**
perimeterSpherical(geom)

**入力値**
- `geom` — Geometry オブジェクト。[Geometry](../../data-types/geo.md)。

**戻り値**
- 数値 — 周長。[Float64](../../data-types/float.md)。

**例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('LINESTRING(0 0,1 0,1 1,0 1,0 0)');
SELECT perimeterSpherical(geom) FROM geo_dst;

結果:
┌─perimeterSpherical(geom)─┐
│ 0 │
└──────────────────────────┘



## areaSpherical {#areaspherical}

球面上にある Geometry オブジェクトの面積を計算します。

**構文**
areaSpherical(geom)

**入力値**
- `geom` — Geometry 型。[Geometry](../../data-types/geo.md)。

**戻り値**
- 数値 — 面積。[Float64](../../data-types/float.md)。

**例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaSpherical(geom) FROM geo_dst;

結果:
┌─areaSpherical(geom)─┐
│ -0.0003046096848622019 │
└──────────────────────┘
