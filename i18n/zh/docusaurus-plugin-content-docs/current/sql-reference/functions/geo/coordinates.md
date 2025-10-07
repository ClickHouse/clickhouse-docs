---
'description': 'Coordinates 的文档'
'sidebar_label': '地理坐标'
'slug': '/sql-reference/functions/geo/coordinates'
'title': '处理地理坐标的函数'
'doc_type': 'reference'
---

## greatCircleDistance {#greatcircledistance}

计算地球表面两个点之间的距离，使用 [大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance)。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（单位：度）。范围： `[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度（单位：度）。范围： `[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度（单位：度）。范围： `[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度（单位：度）。范围： `[-90°, 90°]`。

正值对应北纬和东经，负值对应南纬和西经。

**返回值**

地球表面两个点之间的距离，单位：米。

当输入参数的值超出范围时，将生成异常。

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

与 `greatCircleDistance` 类似，但计算 WGS-84 椭球体上的距离，而不是球体。这个方法对地球地球体的近似更加精确。
性能与 `greatCircleDistance` 相同（没有性能缺陷）。建议使用 `geoDistance` 来计算地球上的距离。

技术说明：对于足够接近的点，我们使用在坐标中点的切平面上的度量来计算距离。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（单位：度）。范围： `[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度（单位：度）。范围： `[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度（单位：度）。范围： `[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度（单位：度）。范围： `[-90°, 90°]`。

正值对应北纬和东经，负值对应南纬和西经。

**返回值**

地球表面两个点之间的距离，单位：米。

当输入参数的值超出范围时，将生成异常。

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

计算地球表面两个点之间的中心角，使用 [大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance)。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（单位：度）。
- `lat1Deg` — 第一个点的纬度（单位：度）。
- `lon2Deg` — 第二个点的经度（单位：度）。
- `lat2Deg` — 第二个点的纬度（单位：度）。

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

## pointInEllipses {#pointinellipses}

检查一个点是否属于至少一个椭圆。
坐标为笛卡尔坐标系统中的几何坐标。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**输入参数**

- `x, y` — 平面上点的坐标。
- `xᵢ, yᵢ` — 第 `i` 个椭圆的中心坐标。
- `aᵢ, bᵢ` — 第 `i` 个椭圆的轴长，以 x, y 坐标单位表示。

输入参数的数量必须为 `2+4⋅n`，其中 `n` 是椭圆的数量。

**返回值**

如果点在至少一个椭圆内，则返回 `1`；如果不在，则返回 `0`。

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

检查一个点是否属于平面上的多边形。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**输入值**

- `(x, y)` — 点的坐标。数据类型 — [Tuple](../../data-types/tuple.md) — 一对数字的元组。
- `[(a, b), (c, d) ...]` — 多边形的顶点。数据类型 — [Array](../../data-types/array.md)。每个顶点由坐标对 `(a, b)` 表示。顶点应按顺时针或逆时针顺序指定。顶点的最少数量为 3。多边形必须是常量。
- 该函数支持具有孔（切割部分）的多边形。数据类型 — [Polygon](../../data-types/geo.md/#polygon)。可以将整个 `Polygon` 作为第二个参数传递，或者先传递外环，然后将每个孔作为单独的额外参数传递。
- 该函数还支持多重多边形。数据类型 — [MultiPolygon](../../data-types/geo.md/#multipolygon)。可以将整个 `MultiPolygon` 作为第二个参数传递，或者将每个组成多边形列为它自己的参数。

**返回值**

如果点在多边形内，则返回 `1`；如果不在，则返回 `0`。
如果点在多边形边界上，函数可能返回 0 或 1。

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
> • 您可以设置 `validate_polygons = 0` 来绕过几何验证。  
> • `pointInPolygon` 假定每个多边形格式良好。如果输入为自交、多环顺序错误或边重叠，则结果可能不可靠，尤其是对于恰好位于边上、顶点上或位于自交处的点，“内部”与“外部”的概念未定义。
