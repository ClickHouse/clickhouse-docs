---
description: 'flipCoordinates 函数文档'
sidebar_label: '翻转坐标'
sidebar_position: 63
slug: /sql-reference/functions/geo/flipCoordinates
title: '翻转坐标'
doc_type: 'reference'
---

## flipCoordinates {#flipcoordinates}

`flipCoordinates` 函数会交换点、环、多边形或多重多边形的坐标。例如，在不同坐标系之间转换且经纬度顺序不同时，这个函数非常有用。

```sql
flipCoordinates(coordinates)
```

### 输入参数 {#input-parameters}

* `coordinates` — 表示点 `(x, y)` 的元组，或由此类元组组成的数组，用于表示环、多边形或多多边形。支持的输入类型包括：
  * [**Point**](../../data-types/geo.md#point)：一个元组 `(x, y)`，其中 `x` 和 `y` 为 [Float64](../../data-types/float.md) 值。
  * [**Ring**](../../data-types/geo.md#ring)：点的数组 `[(x1, y1), (x2, y2), ...]`。
  * [**Polygon**](../../data-types/geo.md#polygon)：环的数组 `[ring1, ring2, ...]`，其中每个环都是点的数组。
  * [**Multipolygon**](../../data-types/geo.md#multipolygon)：多边形的数组 `[polygon1, polygon2, ...]`。

### 返回值 {#returned-value}

该函数返回将坐标翻转后的输入数据。例如：

* 点 `(x, y)` 变为 `(y, x)`。
* 环 `[(x1, y1), (x2, y2)]` 变为 `[(y1, x1), (y2, x2)]`。
* 多边形和多多边形等嵌套结构将被递归处理。

### 示例 {#examples}

#### 示例 1：翻转单个点 {#example-1}

```sql
SELECT flipCoordinates((10, 20)) AS flipped_point
```

```text
┌─flipped_point─┐
│ (20,10)       │
└───────────────┘
```

#### 示例 2：翻转一个点数组（环） {#example-2}

```sql
SELECT flipCoordinates([(10, 20), (30, 40)]) AS flipped_ring
```

```text
┌─flipped_ring──────────────┐
│ [(20,10),(40,30)]         │
└───────────────────────────┘
```

#### 示例 3：翻转多边形 {#example-3}

```sql
SELECT flipCoordinates([[(10, 20), (30, 40)], [(50, 60), (70, 80)]]) AS flipped_polygon
```

```text
┌─flipped_polygon──────────────────────────────┐
│ [[(20,10),(40,30)],[(60,50),(80,70)]]        │
└──────────────────────────────────────────────┘
```

#### 示例 4：翻转 MultiPolygon {#example-4}

```sql
SELECT flipCoordinates([[[10, 20], [30, 40]], [[50, 60], [70, 80]]]) AS flipped_multipolygon
```

```text
┌─flipped_multipolygon──────────────────────────────┐
│ [[[20,10],[40,30]],[[60,50],[80,70]]]             │
└───────────────────────────────────────────────────┘
```
