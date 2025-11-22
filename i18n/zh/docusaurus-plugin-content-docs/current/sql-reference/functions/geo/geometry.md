---
description: '几何函数文档'
sidebar_label: '几何'
slug: /sql-reference/functions/geo/geometry
title: '用于处理几何数据的函数'
doc_type: 'reference'
---



## 几何函数 {#geometry}

几何函数用于计算几何类型的周长和面积,支持的类型包括 POLYGON、LINESTRING、MULTIPOLYGON、MULTILINESTRING、RING 和 POINT。这些几何对象使用 Geometry 类型表示。如果输入值为 `NULL`,所有函数均返回 0。


## perimeterCartesian {#perimetercartesian}

计算给定几何对象在笛卡尔(平面)坐标系中的周长。

**语法**
perimeterCartesian(geom)

**输入值**

- `geom` — 几何对象。[Geometry](../../data-types/geo.md)。

**返回值**

- 数值 — 对象在坐标系单位下的周长。[Float64](../../data-types/float.md)。

**示例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT perimeterCartesian(geom) FROM geo_dst;

结果:
┌─perimeterCartesian(geom)─┐
│ 4.0 │
└──────────────────────────┘


## areaCartesian {#areacartesian}

计算给定几何对象在笛卡尔坐标系中的面积。

**语法**
areaCartesian(geom)

**输入参数**

- `geom` — 几何对象。[Geometry](../../data-types/geo.md)。

**返回值**

- 数值 — 对象在坐标系单位下的面积。[Float64](../../data-types/float.md)。

**示例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaCartesian(geom) FROM geo_dst;

结果:
┌─areaCartesian(geom)─┐
│ -1 │
└─────────────────────┘


## perimeterSpherical {#perimeterspherical}

计算球面上几何对象的周长。

**语法**
perimeterSpherical(geom)

**输入参数**

- `geom` — 几何对象。[Geometry](../../data-types/geo.md)。

**返回值**

- 数值 — 周长。[Float64](../../data-types/float.md)。

**示例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('LINESTRING(0 0,1 0,1 1,0 1,0 0)');
SELECT perimeterSpherical(geom) FROM geo_dst;

结果:
┌─perimeterSpherical(geom)─┐
│ 0 │
└──────────────────────────┘


## areaSpherical {#areaspherical}

计算几何对象在球面上的面积。

**语法**
areaSpherical(geom)

**输入参数**

- `geom` — 几何对象。[Geometry](../../data-types/geo.md)。

**返回值**

- 数值 — 面积。[Float64](../../data-types/float.md)。

**示例**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaSpherical(geom) FROM geo_dst;

结果:
┌─areaSpherical(geom)─┐
│ -0.0003046096848622019 │
└──────────────────────┘
