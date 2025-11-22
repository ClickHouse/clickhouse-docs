---
description: 'flipCoordinates 関数のドキュメント'
sidebar_label: '座標の入れ替え'
sidebar_position: 63
slug: /sql-reference/functions/geo/flipCoordinates
title: '座標の入れ替え'
doc_type: 'reference'
---



## flipCoordinates {#flipcoordinates}

`flipCoordinates`関数は、点、リング、ポリゴン、またはマルチポリゴンの座標を入れ替えます。これは、例えば緯度と経度の順序が異なる座標系間で変換する際に便利です。

```sql
flipCoordinates(coordinates)
```

### 入力パラメータ {#input-parameters}

- `coordinates` — 点`(x, y)`を表すタプル、またはリング、ポリゴン、マルチポリゴンを表すそのようなタプルの配列。サポートされる入力型は以下の通りです:
  - [**Point**](../../data-types/geo.md#point): `x`と`y`が[Float64](../../data-types/float.md)値であるタプル`(x, y)`
  - [**Ring**](../../data-types/geo.md#ring): 点の配列`[(x1, y1), (x2, y2), ...]`
  - [**Polygon**](../../data-types/geo.md#polygon): リングの配列`[ring1, ring2, ...]`(各リングは点の配列)
  - [**Multipolygon**](../../data-types/geo.md#multipolygon): ポリゴンの配列`[polygon1, polygon2, ...]`

### 戻り値 {#returned-value}

この関数は、座標が入れ替えられた入力を返します。例:

- 点`(x, y)`は`(y, x)`になります
- リング`[(x1, y1), (x2, y2)]`は`[(y1, x1), (y2, x2)]`になります
- ポリゴンやマルチポリゴンのようなネストされた構造は再帰的に処理されます

### 例 {#examples}

#### 例1: 単一の点の入れ替え {#example-1}

```sql
SELECT flipCoordinates((10, 20)) AS flipped_point
```

```text
┌─flipped_point─┐
│ (20,10)       │
└───────────────┘
```

#### 例2: 点の配列(リング)の入れ替え {#example-2}

```sql
SELECT flipCoordinates([(10, 20), (30, 40)]) AS flipped_ring
```

```text
┌─flipped_ring──────────────┐
│ [(20,10),(40,30)]         │
└───────────────────────────┘
```

#### 例3: ポリゴンの入れ替え {#example-3}

```sql
SELECT flipCoordinates([[(10, 20), (30, 40)], [(50, 60), (70, 80)]]) AS flipped_polygon
```

```text
┌─flipped_polygon──────────────────────────────┐
│ [[(20,10),(40,30)],[(60,50),(80,70)]]        │
└──────────────────────────────────────────────┘
```

#### 例4: マルチポリゴンの入れ替え {#example-4}

```sql
SELECT flipCoordinates([[[10, 20], [30, 40]], [[50, 60], [70, 80]]]) AS flipped_multipolygon
```

```text
┌─flipped_multipolygon──────────────────────────────┐
│ [[[20,10],[40,30]],[[60,50],[80,70]]]             │
└───────────────────────────────────────────────────┘
```
