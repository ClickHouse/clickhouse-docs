---
description: '地理坐标文档'
sidebar_label: '地理坐标'
slug: /sql-reference/functions/geo/coordinates
title: '用于处理地理坐标的函数'
doc_type: 'reference'
---



## greatCircleDistance

使用[大圆距离公式](https://en.wikipedia.org/wiki/Great-circle_distance)计算地球表面上两点之间的距离。

```sql
大圆距离(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

* `lon1Deg` — 第一个点的经度（单位：度）。取值范围：`[-180°, 180°]`。
* `lat1Deg` — 第一个点的纬度（单位：度）。取值范围：`[-90°, 90°]`。
* `lon2Deg` — 第二个点的经度（单位：度）。取值范围：`[-180°, 180°]`。
* `lat2Deg` — 第二个点的纬度（单位：度）。取值范围：`[-90°, 90°]`。

正值表示北纬和东经，负值表示南纬和西经。

**返回值**

地球表面上两个点之间的距离（单位：米）。

当输入参数值超出取值范围时会抛出异常。

**示例**

```sql
SELECT greatCircleDistance(55.755831, 37.617673, -55.755831, -37.617673) AS greatCircleDistance
```

```text
┌─greatCircleDistance─┐
│            14128352 │
└─────────────────────┘
```


## geoDistance

类似于 `greatCircleDistance`，但在 WGS-84 椭球体上而非理想球面上计算距离，对地球大地水准面的近似更为精确。
其性能与 `greatCircleDistance` 相同（没有性能开销）。建议在计算地球上的距离时使用 `geoDistance`。

技术说明：对于足够接近的点，我们使用在坐标中点处切平面上的距离度量进行平面近似来计算距离。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

* `lon1Deg` — 第一个点的经度（单位：度）。范围：`[-180°, 180°]`。
* `lat1Deg` — 第一个点的纬度（单位：度）。范围：`[-90°, 90°]`。
* `lon2Deg` — 第二个点的经度（单位：度）。范围：`[-180°, 180°]`。
* `lat2Deg` — 第二个点的纬度（单位：度）。范围：`[-90°, 90°]`。

正值表示北纬和东经，负值表示南纬和西经。

**返回值**

地球表面上两点之间的距离，单位为米。

当输入参数的值超出上述范围时，将抛出异常。

**示例**

```sql
SELECT geoDistance(38.8976, -77.0366, 39.9496, -75.1503) AS geoDistance
```

```text
┌─geoDistance─┐
│   212458.73 │
└─────────────┘
```


## greatCircleAngle

使用[大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance)计算地球表面上两点之间的球心角。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

* `lon1Deg` — 第一个点的经度（单位：度）。
* `lat1Deg` — 第一个点的纬度（单位：度）。
* `lon2Deg` — 第二个点的经度（单位：度）。
* `lat2Deg` — 第二个点的纬度（单位：度）。

**返回值**

两个点之间的中心角（单位：度）。

**示例**

```sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

```text
┌─arc─┐
│  45 │
└─────┘
```


## pointInEllipses

检查该点是否落在至少一个椭圆内。
坐标采用笛卡尔坐标系的几何坐标。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**输入参数**

* `x, y` — 平面上某一点的坐标。
* `xᵢ, yᵢ` — 第 `i` 个椭圆中心的坐标。
* `aᵢ, bᵢ` — 第 `i` 个椭圆在 x、y 坐标轴方向上的轴长。

输入参数的个数必须是 `2+4⋅n`，其中 `n` 为椭圆的数量。

**返回值**

如果该点位于至少一个椭圆内部，则返回 `1`；否则返回 `0`。

**示例**

```sql
SELECT pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)
```

```text
┌─pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```


## pointInPolygon

判断该点是否位于平面上的多边形内。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**输入值**

* `(x, y)` — 平面上某点的坐标。数据类型 — [Tuple](../../data-types/tuple.md) — 一个包含两个数字的元组。
* `[(a, b), (c, d) ...]` — 多边形顶点。数据类型 — [Array](../../data-types/array.md)。每个顶点由一对坐标 `(a, b)` 表示。顶点应按顺时针或逆时针顺序给出。顶点数量至少为 3 个。多边形必须是常量。
* 该函数支持带有孔（挖空区域）的多边形。数据类型 — [Polygon](../../data-types/geo.md/#polygon)。可以将整个 `Polygon` 作为第二个参数传入，或者先传入外环，再将每个孔作为单独的附加参数传入。
* 该函数也支持多面多边形。数据类型 — [MultiPolygon](../../data-types/geo.md/#multipolygon)。可以将整个 `MultiPolygon` 作为第二个参数传入，或者将每个组成多边形分别作为独立参数传入。

**返回值**

如果点在多边形内，则返回 `1`，否则返回 `0`。
如果点在多边形边界上，函数可能返回 `0` 或 `1`。

**示例**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```

> **注意**\
> • 你可以将 `validate_polygons` 设为 `0` 以跳过几何验证。\
> • `pointInPolygon` 假定每个多边形都是规范的。如果输入多边形存在自相交、环顺序错误或边界重叠，结果会变得不可靠——尤其是对于那些恰好位于边上、顶点上，或位于自相交区域内部、此时 “inside” 和 “outside” 的概念未定义的点。
