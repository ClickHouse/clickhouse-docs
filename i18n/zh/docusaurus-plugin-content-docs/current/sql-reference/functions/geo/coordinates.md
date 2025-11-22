---
description: '地理坐标相关文档'
sidebar_label: '地理坐标'
slug: /sql-reference/functions/geo/coordinates
title: '用于处理地理坐标的函数'
doc_type: 'reference'
---



## greatCircleDistance {#greatcircledistance}

使用[大圆距离公式](https://en.wikipedia.org/wiki/Great-circle_distance)计算地球表面两点之间的距离。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度(度)。范围:`[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度(度)。范围:`[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度(度)。范围:`[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度(度)。范围:`[-90°, 90°]`。

正值对应北纬和东经,负值对应南纬和西经。

**返回值**

地球表面两点之间的距离,单位为米。

当输入参数值超出范围时将抛出异常。

**示例**

```sql
SELECT greatCircleDistance(55.755831, 37.617673, -55.755831, -37.617673) AS greatCircleDistance
```

```text
┌─greatCircleDistance─┐
│            14128352 │
└─────────────────────┘
```


## geoDistance {#geodistance}

与 `greatCircleDistance` 类似,但在 WGS-84 椭球体上计算距离,而非球体。这是对地球大地水准面更精确的近似。
性能与 `greatCircleDistance` 相同(无性能损失)。建议使用 `geoDistance` 计算地球上的距离。

技术说明:对于足够接近的点,我们使用平面近似计算距离,采用坐标中点处切平面上的度量。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度,以度为单位。范围:`[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度,以度为单位。范围:`[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度,以度为单位。范围:`[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度,以度为单位。范围:`[-90°, 90°]`。

正值对应北纬和东经,负值对应南纬和西经。

**返回值**

地球表面两点之间的距离,以米为单位。

当输入参数值超出范围时将抛出异常。

**示例**

```sql
SELECT geoDistance(38.8976, -77.0366, 39.9496, -75.1503) AS geoDistance
```

```text
┌─geoDistance─┐
│   212458.73 │
└─────────────┘
```


## greatCircleAngle {#greatcircleangle}

使用[大圆距离公式](https://en.wikipedia.org/wiki/Great-circle_distance)计算地球表面两点之间的圆心角。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度(度)。
- `lat1Deg` — 第一个点的纬度(度)。
- `lon2Deg` — 第二个点的经度(度)。
- `lat2Deg` — 第二个点的纬度(度)。

**返回值**

两点之间的圆心角(度)。

**示例**

```sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

```text
┌─arc─┐
│  45 │
└─────┘
```


## pointInEllipses {#pointinellipses}

检查点是否位于至少一个椭圆内。
坐标为笛卡尔坐标系中的几何坐标。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**输入参数**

- `x, y` — 平面上点的坐标。
- `xᵢ, yᵢ` — 第 `i` 个椭圆的中心坐标。
- `aᵢ, bᵢ` — 第 `i` 个椭圆的轴长,以 x、y 坐标单位表示。

输入参数必须为 `2+4⋅n` 个,其中 `n` 是椭圆的数量。

**返回值**

如果点位于至少一个椭圆内,则返回 `1`;否则返回 `0`。

**示例**

```sql
SELECT pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)
```

```text
┌─pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```


## pointInPolygon {#pointinpolygon}

检查点是否位于平面上的多边形内。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**输入值**

- `(x, y)` — 平面上点的坐标。数据类型 — [Tuple](../../data-types/tuple.md) — 由两个数字组成的元组。
- `[(a, b), (c, d) ...]` — 多边形顶点。数据类型 — [Array](../../data-types/array.md)。每个顶点由一对坐标 `(a, b)` 表示。顶点应按顺时针或逆时针顺序指定。最少顶点数为 3。多边形必须是常量。
- 该函数支持带孔洞(镂空部分)的多边形。数据类型 — [Polygon](../../data-types/geo.md/#polygon)。可以将整个 `Polygon` 作为第二个参数传递,或者先传递外环,然后将每个孔洞作为单独的附加参数传递。
- 该函数还支持多多边形。数据类型 — [MultiPolygon](../../data-types/geo.md/#multipolygon)。可以将整个 `MultiPolygon` 作为第二个参数传递,或者将每个组成多边形作为独立参数列出。

**返回值**

如果点在多边形内则返回 `1`,否则返回 `0`。
如果点位于多边形边界上,函数可能返回 0 或 1。

**示例**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```

> **注意**  
> • 可以设置 `validate_polygons = 0` 来跳过几何验证。  
> • `pointInPolygon` 假定每个多边形都是格式良好的。如果输入存在自相交、环顺序错误或边重叠的情况,结果将变得不可靠——特别是对于恰好位于边上、顶点上或自相交内部的点,此时"内部"与"外部"的概念是未定义的。
