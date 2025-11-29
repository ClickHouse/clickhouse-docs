---
description: 'Geohash 文档'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: '用于处理 Geohash 的函数'
doc_type: 'reference'
---



## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) 是一种地理编码系统，它将地球表面划分为网格状的多个单元，并将每个单元编码为由字母和数字组成的短字符串。它是一种分层数据结构，因此 geohash 字符串越长，对应的地理位置就越精确。

如果需要手动将地理坐标转换为 geohash 字符串，可以使用 [geohash.org](http://geohash.co/)。



## geohashEncode {#geohashencode}

将纬度和经度编码为 [geohash](#geohash) 字符串。

**语法**

```sql
geohashEncode(经度, 纬度, [精度])
```

**输入参数**

* `longitude` — 要编码的坐标的经度部分。浮点数，取值范围为 `[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude` — 要编码的坐标的纬度部分。浮点数，取值范围为 `[-90°, 90°]`。[Float](../../data-types/float.md)。
* `precision`（可选）— 生成的编码字符串的长度。默认值为 `12`。取值范围为 `[1, 12]` 的整数。[Int8](../../data-types/int-uint.md)。

:::note

* 所有坐标参数的数据类型必须相同：要么为 `Float32`，要么为 `Float64`。
* 对于 `precision` 参数，任何小于 `1` 或大于 `12` 的值都会被自动转换为 `12`。
  :::

**返回值**

* 编码后坐标的字母数字字符串（使用经过修改的 base32 编码字母表）。[String](../../data-types/string.md)。

**示例**

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

将任意 [geohash](#geohash) 编码的字符串解码为经度和纬度。

**语法**

```sql
geohashDecode(hash_str)
```

**输入值**

* `hash_str` — Geohash 编码的字符串。

**返回值**

* 由经度和纬度构成的元组 `(longitude, latitude)`，二者类型均为 `Float64`。 [Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

**示例**

```sql
SELECT geohashDecode('ezs42') AS res;
```

```text
┌─res─────────────────────────────┐
│ (-5.60302734375,42.60498046875) │
└─────────────────────────────────┘
```


## geohashesInBox {#geohashesinbox}

返回一个由指定精度的 [geohash](#geohash) 编码字符串组成的数组，这些字符串对应的网格单元位于给定矩形框内或与其边界相交，本质上是将一个二维网格展平成一维数组。

**语法**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**参数**

* `longitude_min` — 最小经度。范围：`[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude_min` — 最小纬度。范围：`[-90°, 90°]`。[Float](../../data-types/float.md)。
* `longitude_max` — 最大经度。范围：`[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude_max` — 最大纬度。范围：`[-90°, 90°]`。[Float](../../data-types/float.md)。
* `precision` — Geohash 精度。范围：`[1, 12]`。[UInt8](../../data-types/int-uint.md)。

:::note\
所有坐标参数必须为相同类型：要么是 `Float32`，要么是 `Float64`。
:::

**返回值**

* 覆盖给定区域的一组 geohash 区块的字符串数组，每个字符串长度等于精度值，不应依赖数组中元素的顺序。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
* `[]` - 如果最小纬度和经度值不小于对应的最大值，则返回空数组。

:::note\
如果结果数组长度超过 10&#39;000&#39;000 个元素，函数会抛出异常。
:::

**示例**

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
