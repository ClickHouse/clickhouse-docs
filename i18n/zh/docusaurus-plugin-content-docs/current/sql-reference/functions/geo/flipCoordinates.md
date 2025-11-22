---
description: 'flipCoordinates 函数文档'
sidebar_label: '翻转坐标'
sidebar_position: 63
slug: /sql-reference/functions/geo/flipCoordinates
title: '翻转坐标'
doc_type: 'reference'
---



## flipCoordinates {#flipcoordinates}

`flipCoordinates` 函数用于交换点、环、多边形或多多边形的坐标。例如,在不同坐标系统之间转换时,如果纬度和经度的顺序不同,此函数非常有用。

```sql
flipCoordinates(coordinates)
```

### 输入参数 {#input-parameters}

- `coordinates` — 表示点 `(x, y)` 的元组,或表示环、多边形或多多边形的此类元组数组。支持的输入类型包括:
  - [**Point**](../../data-types/geo.md#point): 元组 `(x, y)`,其中 `x` 和 `y` 为 [Float64](../../data-types/float.md) 类型值。
  - [**Ring**](../../data-types/geo.md#ring): 点数组 `[(x1, y1), (x2, y2), ...]`。
  - [**Polygon**](../../data-types/geo.md#polygon): 环数组 `[ring1, ring2, ...]`,其中每个环为点数组。
  - [**Multipolygon**](../../data-types/geo.md#multipolygon): 多边形数组 `[polygon1, polygon2, ...]`。

### 返回值 {#returned-value}

该函数返回坐标已交换的输入。例如:

- 点 `(x, y)` 变为 `(y, x)`。
- 环 `[(x1, y1), (x2, y2)]` 变为 `[(y1, x1), (y2, x2)]`。
- 多边形和多多边形等嵌套结构会递归处理。

### 示例 {#examples}

#### 示例 1: 交换单个点的坐标 {#example-1}

```sql
SELECT flipCoordinates((10, 20)) AS flipped_point
```

```text
┌─flipped_point─┐
│ (20,10)       │
└───────────────┘
```

#### 示例 2: 交换点数组(环)的坐标 {#example-2}

```sql
SELECT flipCoordinates([(10, 20), (30, 40)]) AS flipped_ring
```

```text
┌─flipped_ring──────────────┐
│ [(20,10),(40,30)]         │
└───────────────────────────┘
```

#### 示例 3: 交换多边形的坐标 {#example-3}

```sql
SELECT flipCoordinates([[(10, 20), (30, 40)], [(50, 60), (70, 80)]]) AS flipped_polygon
```

```text
┌─flipped_polygon──────────────────────────────┐
│ [[(20,10),(40,30)],[(60,50),(80,70)]]        │
└──────────────────────────────────────────────┘
```

#### 示例 4: 交换多多边形的坐标 {#example-4}

```sql
SELECT flipCoordinates([[[10, 20], [30, 40]], [[50, 60], [70, 80]]]) AS flipped_multipolygon
```

```text
┌─flipped_multipolygon──────────────────────────────┐
│ [[[20,10],[40,30]],[[60,50],[80,70]]]             │
└───────────────────────────────────────────────────┘
```
