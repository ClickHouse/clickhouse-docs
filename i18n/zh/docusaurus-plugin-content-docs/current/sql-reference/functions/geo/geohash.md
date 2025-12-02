---
description: 'Geohash 文档'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: '用于处理 Geohash 的函数'
doc_type: 'reference'
---



## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash) 是一种地理编码系统，它将地球表面划分为网格状的区域（bucket），并将每个单元编码为由字母和数字组成的短字符串。它是一种分层数据结构，因此 geohash 字符串越长，表示的地理位置就越精确。

如果需要手动将地理坐标转换为 geohash 字符串，可以使用 [geohash.org](http://geohash.co/)。



## geohashEncode {#geohashencode}

将纬度和经度编码为 [geohash](#geohash) 字符串。

**语法**

```sql
geohashEncode(longitude, latitude, [precision])
```

**输入值**

* `longitude` — 要编码的坐标中的经度部分。浮点数，取值范围为 `[-180°, 180°]`。[Float](../../data-types/float.md)。
* `latitude` — 要编码的坐标中的纬度部分。浮点数，取值范围为 `[-90°, 90°]`。[Float](../../data-types/float.md)。
* `precision`（可选）— 生成的编码字符串的长度。默认值为 `12`。取值范围为 `[1, 12]` 的整数。[Int8](../../data-types/int-uint.md)。

:::note

* 所有坐标参数必须是相同的类型：要么全部为 `Float32`，要么全部为 `Float64`。
* 对于 `precision` 参数，任何小于 `1` 或大于 `12` 的值都会被自动转换为 `12`，且不会报错。
  :::

**返回值**

* 编码后的坐标所对应的字母数字字符串（使用经过修改的 base32 编码字母表）。[String](../../data-types/string.md)。

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

将任意 [geohash](#geohash) 编码字符串解码为经度和纬度。

**语法**

```sql
geohashDecode(hash_str)
```

**输入值**

* `hash_str` — Geohash 编码的字符串。

**返回值**

* 由经度和纬度的 `Float64` 值组成的元组 `(longitude, latitude)`。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

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

返回一个由指定精度的 [geohash](#geohash) 编码字符串组成的数组，这些字符串对应的区域位于给定矩形区域内或与其边界相交，本质上是将一个二维网格扁平化为数组。

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

:::note
所有坐标参数的类型必须相同：要么都是 `Float32`，要么都是 `Float64`。
:::

**返回值**

* 一个字符串数组，数组元素为长度为 `precision` 的 geohash 网格框字符串，覆盖给定区域，且不应依赖元素的顺序。[Array](../../data-types/array.md)([String](../../data-types/string.md))。
* `[]` - 当最小纬度和经度值不小于对应的最大值时返回空数组。

:::note
如果结果数组包含的元素数量超过 10&#39;000&#39;000 个，函数会抛出异常。
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
