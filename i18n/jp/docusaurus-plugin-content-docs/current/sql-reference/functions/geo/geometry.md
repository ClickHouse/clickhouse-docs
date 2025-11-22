---
description: 'ジオメトリ関数のドキュメント'
sidebar_label: 'ジオメトリ'
slug: /sql-reference/functions/geo/geometry
title: 'ジオメトリを扱う関数'
doc_type: 'reference'
---



## Geometry {#geometry}

Geometry関数を使用すると、POLYGON、LINESTRING、MULTIPOLYGON、MULTILINESTRING、RING、POINTなどの幾何学型の周長と面積を計算できます。幾何学データはGeometry型で使用します。入力値が`NULL`の場合、以下のすべての関数は0を返します。


## perimeterCartesian {#perimetercartesian}

デカルト座標系(平面座標系)における指定されたGeometryオブジェクトの周長を計算します。

**構文**
perimeterCartesian(geom)

**入力値**

- `geom` — Geometryオブジェクト。[Geometry](../../data-types/geo.md)。

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

デカルト座標系における指定されたGeometryオブジェクトの面積を計算します。

**構文**
areaCartesian(geom)

**入力値**

- `geom` — Geometryオブジェクト。[Geometry](../../data-types/geo.md)。

**戻り値**

- 数値 — 座標系単位でのオブジェクトの面積。[Float64](../../data-types/float.md)。

**例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaCartesian(geom) FROM geo_dst;

結果:
┌─areaCartesian(geom)─┐
│ -1 │
└─────────────────────┘


## perimeterSpherical {#perimeterspherical}

球面上のGeometryオブジェクトの周長を計算します。

**構文**
perimeterSpherical(geom)

**入力値**

- `geom` — Geometryオブジェクト。[Geometry](../../data-types/geo.md)。

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

球面上のGeometryオブジェクトの面積を計算します。

**構文**
areaSpherical(geom)

**入力値**

- `geom` — ジオメトリ。[Geometry](../../data-types/geo.md)。

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
