## greatCircleDistance {#greatcircledistance}

使用 [大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance) 计算地球表面两个点之间的距离。

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（度为单位）。范围： `[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度（度为单位）。范围： `[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度（度为单位）。范围： `[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度（度为单位）。范围： `[-90°, 90°]`。

正值对应北纬和东经，负值对应南纬和西经。

**返回值**

地球表面两个点之间的距离，以米为单位。

当输入参数值超出范围时会产生异常。

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

与 `greatCircleDistance` 类似，但计算的是 WGS-84 椭球体上的距离而非球体。这是地球大地水准面的更精确近似。
性能与 `greatCircleDistance` 相同（没有性能下降）。建议使用 `geoDistance` 来计算地球上的距离。

技术说明：对于足够接近的点，我们使用平面近似法，在坐标的中点的切平面上的度量来计算距离。

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（度为单位）。范围： `[-180°, 180°]`。
- `lat1Deg` — 第一个点的纬度（度为单位）。范围： `[-90°, 90°]`。
- `lon2Deg` — 第二个点的经度（度为单位）。范围： `[-180°, 180°]`。
- `lat2Deg` — 第二个点的纬度（度为单位）。范围： `[-90°, 90°]`。

正值对应北纬和东经，负值对应南纬和西经。

**返回值**

地球表面两个点之间的距离，以米为单位。

当输入参数值超出范围时会产生异常。

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

使用 [大圆公式](https://en.wikipedia.org/wiki/Great-circle_distance) 计算地球表面两个点之间的中心角。

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**输入参数**

- `lon1Deg` — 第一个点的经度（度为单位）。
- `lat1Deg` — 第一个点的纬度（度为单位）。
- `lon2Deg` — 第二个点的经度（度为单位）。
- `lat2Deg` — 第二个点的纬度（度为单位）。

**返回值**

两个点之间的中心角，以度为单位。

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
- `aᵢ, bᵢ` — 第 `i` 个椭圆的轴，单位为 x、y 坐标。

输入参数必须是 `2+4⋅n`，其中 `n` 是椭圆的数量。

**返回值**

如果点在至少一个椭圆内则返回 `1`；如果不在则返回 `0`。

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

- `(x, y)` — 平面上点的坐标。数据类型 — [Tuple](../../data-types/tuple.md) — 两个数字的元组。
- `[(a, b), (c, d) ...]` — 多边形的顶点。数据类型 — [Array](../../data-types/array.md)。每个顶点用一对坐标 `(a, b)` 表示。顶点应按顺时针或逆时针顺序指定。顶点的最小数量为 3。多边形必须是常数。
- 该函数还支持带孔的多边形（切割出的部分）。在这种情况下，使用函数的额外参数添加定义切割部分的多边形。该函数不支持非单连通的多边形。

**返回值**

如果点在多边形内则返回 `1`，如果不在则返回 `0`。
如果点位于多边形边界，函数可能返回 0 或 1。

**示例**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```
