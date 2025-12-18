---
description: '几何函数参考文档'
sidebar_label: '几何'
slug: /sql-reference/functions/geo/geometry
title: '几何处理函数'
doc_type: 'reference'
---

## 几何 {#geometry}

几何函数可用于计算 POLYGON、LINESTRING、MULTIPOLYGON、MULTILINESTRING、RING 和 POINT 等几何类型的周长和面积。将这些几何对象表示为 `Geometry` 类型。若输入值为 `NULL`，则以下所有函数均返回 0。

## perimeterCartesian {#perimetercartesian}

在笛卡尔（平面）坐标系下计算给定 Geometry 对象的周长。

**语法**

```sql
perimeterCartesian(geom)
```

**参数**

* `geom` — Geometry 对象。[Geometry](../../data-types/geo.md)。

**返回值**

* 数值 — 对象在该坐标系下的周长，单位与坐标系一致。[Float64](../../data-types/float.md)。

**示例**

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


## areaCartesian {#areacartesian}

在笛卡尔坐标系下计算给定 Geometry 对象的面积。

**语法**

```sql
areaCartesian(geom)
```

**参数**

* `geom` — Geometry 对象。[Geometry](../../data-types/geo.md)。

**返回值**

* 数值 — 对象在坐标系单位中的面积。[Float64](../../data-types/float.md)。

**示例**

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


## perimeterSpherical {#perimeterspherical}

计算球面上 Geometry 对象的周长。

**语法**

```sql
perimeterSpherical(geom)
```

**参数**

* `geom` — Geometry 对象。[Geometry](../../data-types/geo.md)。

**返回值**

* 数值 — 周长。[Float64](../../data-types/float.md)。

**示例**

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


## areaSpherical {#areaspherical}

计算球面上 Geometry 对象的面积。

**语法**

```sql
areaSpherical(geom)
```

**参数**

* `geom` — Geometry 类型的几何对象。参见 [Geometry](../../data-types/geo.md)。

**返回值**

* 数值 — 面积。参见 [Float64](../../data-types/float.md)。

**示例**

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
