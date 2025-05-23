---
'description': 'Documentation for Coordinates'
'sidebar_label': '地理坐标'
'sidebar_position': 62
'slug': '/sql-reference/functions/geo/coordinates'
'title': '处理地理坐标的函数'
---

## greatCircleDistance {#greatcircledistance}

计算地球表面两个点之间的距离，使用[大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance)。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（单位：度），范围：`[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度（单位：度），范围：`[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度（单位：度），范围：`[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度（单位：度），范围：`[-90°, 90°]`。

正值对应于北纬和东经，负值对应于南纬和西经。

**返回值**

地球表面两个点之间的距离，单位为米。

当输入参数值超出范围时，会生成异常。

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

类似于 `greatCircleDistance`，但计算 WGS-84 椭球体上的距离，而不是球面。这是对地球大地体的更精确的近似。
性能与 `greatCircleDistance` 相同（没有性能缺陷）。建议使用 `geoDistance` 来计算地球上的距离。

技术说明：对于足够接近的点，我们使用切平面上的度量，通过坐标中点的平面近似计算距离。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（单位：度），范围：`[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度（单位：度），范围：`[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度（单位：度），范围：`[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度（单位：度），范围：`[-90°, 90°]`。

正值对应于北纬和东经，负值对应于南纬和西经。

**返回值**

地球表面两个点之间的距离，单位为米。

当输入参数值超出范围时，会生成异常。

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

计算地球表面两个点之间的中心角，使用[大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance)。

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

检查点是否属于至少一个椭圆。
坐标在笛卡尔坐标系中是几何的。

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**输入参数**

- `x, y` — 平面上点的坐标。
- `xᵢ, yᵢ` — 第 `i` 个椭圆的中心坐标。
- `aᵢ, bᵢ` — 第 `i` 个椭圆的长短轴（单位：x, y 坐标）。

输入参数的数量必须为 `2+4⋅n`，其中 `n` 是椭圆的数量。

**返回值**

如果点在至少一个椭圆内，返回 `1`；如果不在，返回 `0`。

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

检查点是否属于平面上的多边形。

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**输入值**

- `(x, y)` — 平面上点的坐标。数据类型 — [Tuple](../../data-types/tuple.md) — 包含两个数字的元组。
- `[(a, b), (c, d) ...]` — 多边形的顶点。数据类型 — [Array](../../data-types/array.md)。每个顶点由一对坐标 `(a, b)` 表示。顶点应按顺时针或逆时针顺序指定。顶点的最小数量为 3。多边形必须是常数。
- 此函数还支持带有孔（切割出的部分）的多边形。在这种情况下，使用函数的附加参数添加定义切割部分的多边形。此函数不支持非简单连通的多边形。

**返回值**

如果点在多边形内，返回 `1`；如果不在，返回 `0`。
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
