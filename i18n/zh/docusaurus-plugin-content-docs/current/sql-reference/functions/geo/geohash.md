---
'description': 'Documentation for Geohash'
'sidebar_label': 'Geohash'
'slug': '/sql-reference/functions/geo/geohash'
'title': 'Functions for Working with Geohash'
---



## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) 是一种地理编码系统，将地球表面划分为网格形状的桶，并将每个单元编码为一串简短的字母和数字。它是一种层次数据结构，因此 geohash 字符串越长，地理位置的精确度就越高。

如果您需要手动将地理坐标转换为 geohash 字符串，可以使用 [geohash.org](http://geohash.org/)。

## geohashEncode {#geohashencode}

将纬度和经度编码为 [geohash](#geohash)-字符串。

**语法**

```sql
geohashEncode(longitude, latitude, [precision])
```

**输入值**

- `longitude` — 要编码的坐标的经度部分。浮点数范围为 `[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude` — 要编码的坐标的纬度部分。浮点数范围为 `[-90°, 90°]`。[Float](../../data-types/float.md)。
- `precision`（可选）— 结果编码字符串的长度。默认为 `12`。整数范围为 `[1, 12]`。[Int8](../../data-types/int-uint.md)。

:::note
- 所有坐标参数必须为相同类型：`Float32` 或 `Float64`。
- 对于 `precision` 参数，小于 `1` 或大于 `12` 的任何值将默默转换为 `12`。
:::

**返回值**

- 编码坐标的字母数字字符串（使用修改版的 base32 编码字母表）。[String](../../data-types/string.md)。

**例子**

查询：

```sql
SELECT geohashEncode(-5.60302734375, 42.593994140625, 0) AS res;
```

结果：

```text
┌─res──────────┐
│ ezs42d000000 │
└──────────────┘
```

## geohashDecode {#geohashdecode}

将任何 [geohash](#geohash)-编码字符串解码为经度和纬度。

**语法**

```sql
geohashDecode(hash_str)
```

**输入值**

- `hash_str` — Geohash 编码字符串。

**返回值**

- 元组 `(longitude, latitude)`，表示经度和纬度的 `Float64` 值。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

**例子**

```sql
SELECT geohashDecode('ezs42') AS res;
```

```text
┌─res─────────────────────────────┐
│ (-5.60302734375,42.60498046875) │
└─────────────────────────────────┘
```

## geohashesInBox {#geohashesinbox}

返回给定精度的 [geohash](#geohash)-编码字符串数组，这些字符串落在给定框的边界内并相交，基本上是一个平面二维网格展开成数组。

**语法**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**参数**

- `longitude_min` — 最小经度。范围：`[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude_min` — 最小纬度。范围：`[-90°, 90°]`。[Float](../../data-types/float.md)。
- `longitude_max` — 最大经度。范围：`[-180°, 180°]`。[Float](../../data-types/float.md)。
- `latitude_max` — 最大纬度。范围：`[-90°, 90°]`。[Float](../../data-types/float.md)。
- `precision` — Geohash 精度。范围：`[1, 12]`。[UInt8](../../data-types/int-uint.md)。

:::note    
所有坐标参数必须为相同类型：`Float32` 或 `Float64`。
:::

**返回值**

- 覆盖提供区域的精度长字符串的 geohash-boxes 数组，您不应依赖于项目的顺序。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
- `[]` - 如果最小纬度和经度值不小于相应的最大值，返回空数组。

:::note    
如果结果数组超过 10'000'000 项，将引发异常。
:::

**例子**

查询：

```sql
SELECT geohashesInBox(24.48, 40.56, 24.785, 40.81, 4) AS thasos;
```

结果：

```text
┌─thasos──────────────────────────────────────┐
│ ['sx1q','sx1r','sx32','sx1w','sx1x','sx38'] │
└─────────────────────────────────────────────┘
```
