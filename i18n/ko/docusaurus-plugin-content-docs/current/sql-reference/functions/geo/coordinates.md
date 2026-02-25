---
description: '좌표 관련 문서'
sidebar_label: '지리 좌표'
slug: /sql-reference/functions/geo/coordinates
title: '지리 좌표를 처리하기 위한 함수'
doc_type: 'reference'
---

## greatCircleDistance \{#greatcircledistance\}

[대권 거리 공식](https://en.wikipedia.org/wiki/Great-circle_distance)을 사용하여 지구 표면상의 두 지점 사이의 거리를 계산합니다.

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**입력 매개변수**

* `lon1Deg` — 첫 번째 지점의 경도(도 단위). 범위: `[-180°, 180°]`.
* `lat1Deg` — 첫 번째 지점의 위도(도 단위). 범위: `[-90°, 90°]`.
* `lon2Deg` — 두 번째 지점의 경도(도 단위). 범위: `[-180°, 180°]`.
* `lat2Deg` — 두 번째 지점의 위도(도 단위). 범위: `[-90°, 90°]`.

양수는 북위와 동경을, 음수는 남위와 서경을 나타냅니다.

**반환 값**

지구 표면 위의 두 지점 사이 거리(미터 단위)입니다.

입력 매개변수 값이 범위를 벗어나면 예외가 발생합니다.

**예시**

```sql
SELECT greatCircleDistance(55.755831, 37.617673, -55.755831, -37.617673) AS greatCircleDistance
```

```text
┌─greatCircleDistance─┐
│            14128352 │
└─────────────────────┘
```

## geoDistance \{#geodistance\}

`greatCircleDistance`와 유사하지만, 구체(sphere)가 아니라 WGS-84 타원체(ellipsoid)에서의 거리를 계산합니다. 이는 지구의 지오이드(Geoid)를 보다 정밀하게 근사한 것입니다.
성능은 `greatCircleDistance`와 동일하며(성능 저하 없음), 지구 상의 거리를 계산할 때는 `geoDistance` 사용을 권장합니다.

기술 메모: 충분히 가까운 두 점에 대해서는, 좌표의 중점에서의 접평면(tangent plane) 위에 정의된 계량(metric)을 사용하는 평면 근사법으로 거리를 계산합니다.

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**입력 매개변수**

* `lon1Deg` — 첫 번째 지점의 경도(도 단위). 범위: `[-180°, 180°]`.
* `lat1Deg` — 첫 번째 지점의 위도(도 단위). 범위: `[-90°, 90°]`.
* `lon2Deg` — 두 번째 지점의 경도(도 단위). 범위: `[-180°, 180°]`.
* `lat2Deg` — 두 번째 지점의 위도(도 단위). 범위: `[-90°, 90°]`.

양수 값은 북위와 동경을 나타내고, 음수 값은 남위와 서경을 나타냅니다.

**반환 값**

지구 표면상의 두 지점 사이 거리입니다(미터 단위).

입력 매개변수 값이 범위를 벗어나면 예외가 발생합니다.

**예시**

```sql
SELECT geoDistance(38.8976, -77.0366, 39.9496, -75.1503) AS geoDistance
```

```text
┌─geoDistance─┐
│   212458.73 │
└─────────────┘
```

## greatCircleAngle \{#greatcircleangle\}

[대권 거리 공식](https://en.wikipedia.org/wiki/Great-circle_distance)을 사용하여 지구 표면상의 두 지점 사이의 중심각을 계산합니다.

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**입력 매개변수**

* `lon1Deg` — 첫 번째 지점의 경도(도 단위).
* `lat1Deg` — 첫 번째 지점의 위도(도 단위).
* `lon2Deg` — 두 번째 지점의 경도(도 단위).
* `lat2Deg` — 두 번째 지점의 위도(도 단위).

**반환값**

두 지점 사이의 중심각(도 단위).

**예제**

```sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

```text
┌─arc─┐
│  45 │
└─────┘
```

## pointInEllipses \{#pointinellipses\}

점이 하나 이상의 타원에 포함되는지 확인합니다.
좌표는 데카르트 좌표계의 기하학적 좌표입니다.

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**입력 매개변수**

* `x, y` — 평면 위 점의 좌표.
* `xᵢ, yᵢ` — `i`번째 타원의 중심 좌표.
* `aᵢ, bᵢ` — x, y 좌표 단위의 `i`번째 타원의 축 길이.

입력 매개변수의 개수는 `2+4⋅n`이어야 하며, 여기서 `n`은 타원의 개수입니다.

**반환 값**

점이 하나 이상의 타원 내부에 있으면 `1`, 그렇지 않으면 `0`입니다.

**예시**

```sql
SELECT pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)
```

```text
┌─pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```

## pointInPolygon \{#pointinpolygon\}

평면에서 어떤 점이 다각형에 포함되는지 확인합니다.

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**입력값**

* `(x, y)` — 평면 위의 한 점 좌표입니다. 데이터 타입 — [Tuple](../../data-types/tuple.md) — 두 숫자로 이루어진 튜플입니다.
* `[(a, b), (c, d) ...]` — 다각형 꼭짓점입니다. 데이터 타입 — [Array](../../data-types/array.md). 각 꼭짓점은 좌표 쌍 `(a, b)`로 표현됩니다. 꼭짓점은 시계 방향 또는 반시계 방향 순서로 지정해야 합니다. 최소 꼭짓점 개수는 3개입니다. 다각형 정의는 상수여야 합니다.
* 함수는 구멍(잘려 나간 영역)이 있는 다각형도 지원합니다. 데이터 타입 — [Polygon](../../data-types/geo.md/#polygon). 전체 `Polygon`을 두 번째 인수로 전달하거나, 외곽 링(outer ring)을 먼저 전달한 다음 각 구멍을 별도의 추가 인수로 전달하십시오.
* 함수는 멀티폴리곤(MultiPolygon)도 지원합니다. 데이터 타입 — [MultiPolygon](../../data-types/geo.md/#multipolygon). 전체 `MultiPolygon`을 두 번째 인수로 전달하거나, 구성하는 각 다각형을 각각 별도의 인수로 나열하십시오.

**반환 값**

점이 다각형 내부에 있으면 `1`, 그렇지 않으면 `0`을 반환합니다.
점이 다각형의 경계 위에 있는 경우, 함수는 0 또는 1을 반환할 수 있습니다.

**예제**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```

> **참고**
> • `validate_polygons = 0`을 설정하면 도형 검증을 건너뛸 수 있습니다.
> • `pointInPolygon`은 모든 폴리곤이 올바르게 구성되어 있다고 가정합니다. 입력이 자기 교차를 하거나, 링의 순서가 잘못되었거나, 변이 서로 겹치는 경우 결과는 신뢰할 수 없게 되며, 특히 변이나 꼭짓점 위에 정확히 위치한 점, 또는 「안쪽」과 「바깥쪽」의 개념이 정의되지 않는 자기 교차 영역 안에 위치한 점에 대해 그렇습니다.
