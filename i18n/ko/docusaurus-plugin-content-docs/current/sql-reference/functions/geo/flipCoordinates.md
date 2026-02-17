---
description: 'flipCoordinates 함수 문서'
sidebar_label: '좌표 반전'
sidebar_position: 63
slug: /sql-reference/functions/geo/flipCoordinates
title: '좌표 반전'
doc_type: 'reference'
---

## flipCoordinates \{#flipcoordinates\}

`flipCoordinates` 함수는 점, 링, 폴리곤 또는 멀티폴리곤의 좌표를 서로 맞바꿉니다. 예를 들어 위도와 경도의 순서가 다른 좌표계 간에 변환할 때 유용합니다.

```sql
flipCoordinates(coordinates)
```

### 입력 매개변수 \{#input-parameters\}

* `coordinates` — 점 `(x, y)`를 나타내는 튜플이거나, 링, 폴리곤 또는 멀티폴리곤을 나타내는 이러한 튜플의 배열입니다. 지원되는 입력 유형은 다음과 같습니다.
  * [**Point**](../../data-types/geo.md#point): `x`와 `y`가 [Float64](../../data-types/float.md) 값인 튜플 `(x, y)`입니다.
  * [**Ring**](../../data-types/geo.md#ring): 점들의 배열 `[(x1, y1), (x2, y2), ...]`입니다.
  * [**Polygon**](../../data-types/geo.md#polygon): 링들의 배열 `[ring1, ring2, ...]`이며, 각 링은 점들의 배열입니다.
  * [**Multipolygon**](../../data-types/geo.md#multipolygon): 폴리곤들의 배열 `[polygon1, polygon2, ...]`입니다.

### 반환값 \{#returned-value\}

이 함수는 좌표의 순서를 뒤집어 입력 값을 반환합니다. 예를 들어:

* 점 `(x, y)`는 `(y, x)`가 됩니다.
* 링 `[(x1, y1), (x2, y2)]`는 `[(y1, x1), (y2, x2)]`가 됩니다.
* 폴리곤과 멀티폴리곤과 같은 중첩 구조는 재귀적으로 처리됩니다.

### 예시 \{#examples\}

#### 예시 1: 단일 점 뒤집기 \{#example-1\}

```sql
SELECT flipCoordinates((10, 20)) AS flipped_point
```

```text
┌─flipped_point─┐
│ (20,10)       │
└───────────────┘
```

#### 예제 2: 점 배열 뒤집기(링) \{#example-2\}

```sql
SELECT flipCoordinates([(10, 20), (30, 40)]) AS flipped_ring
```

```text
┌─flipped_ring──────────────┐
│ [(20,10),(40,30)]         │
└───────────────────────────┘
```

#### 예시 3: 다각형 뒤집기 \{#example-3\}

```sql
SELECT flipCoordinates([[(10, 20), (30, 40)], [(50, 60), (70, 80)]]) AS flipped_polygon
```

```text
┌─flipped_polygon──────────────────────────────┐
│ [[(20,10),(40,30)],[(60,50),(80,70)]]        │
└──────────────────────────────────────────────┘
```

#### 예시 4: 멀티폴리곤 뒤집기 \{#example-4\}

```sql
SELECT flipCoordinates([[[10, 20], [30, 40]], [[50, 60], [70, 80]]]) AS flipped_multipolygon
```

```text
┌─flipped_multipolygon──────────────────────────────┐
│ [[[20,10],[40,30]],[[60,50],[80,70]]]             │
└───────────────────────────────────────────────────┘
```
