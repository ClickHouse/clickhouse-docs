---
'description': 'Coordinates에 대한 문서'
'sidebar_label': '지리적 좌표'
'slug': '/sql-reference/functions/geo/coordinates'
'title': '지리적 좌표로 작업하기 위한 함수'
'doc_type': 'reference'
---

## greatCircleDistance {#greatcircledistance}

지구 표면의 두 점 간의 거리를 [대원 거리 공식](https://en.wikipedia.org/wiki/Great-circle_distance)을 사용하여 계산합니다.

```sql
greatCircleDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**입력 매개변수**

- `lon1Deg` — 첫 번째 점의 경도 (도 기준). 범위: `[-180°, 180°]`.
- `lat1Deg` — 첫 번째 점의 위도 (도 기준). 범위: `[-90°, 90°]`.
- `lon2Deg` — 두 번째 점의 경도 (도 기준). 범위: `[-180°, 180°]`.
- `lat2Deg` — 두 번째 점의 위도 (도 기준). 범위: `[-90°, 90°]`.

양수 값은 북위와 동경에 해당하고, 음수 값은 남위와 서경에 해당합니다.

**반환 값**

지구 표면의 두 점 간의 거리 (미터 단위).

입력 매개변수 값이 범위를 벗어나는 경우 예외를 발생시킵니다.

**예제**

```sql
SELECT greatCircleDistance(55.755831, 37.617673, -55.755831, -37.617673) AS greatCircleDistance
```

```text
┌─greatCircleDistance─┐
│            14128352 │
└─────────────────────┘
```

## geoDistance {#geodistance}

`greatCircleDistance`와 유사하지만, 구 대신 WGS-84 타원체를 사용하여 거리를 계산합니다. 이는 지구 지오이드에 대한 보다 정확한 근사값입니다.
성능은 `greatCircleDistance`와 동일합니다 (성능 저하 없음). 지구상의 거리 계산에는 `geoDistance` 사용을 권장합니다.

기술적 메모: 충분히 가까운 점에 대해서는 좌표의 중간점에서 접선 평면의 메트릭을 사용하여 거리를 계산합니다.

```sql
geoDistance(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**입력 매개변수**

- `lon1Deg` — 첫 번째 점의 경도 (도 기준). 범위: `[-180°, 180°]`.
- `lat1Deg` — 첫 번째 점의 위도 (도 기준). 범위: `[-90°, 90°]`.
- `lon2Deg` — 두 번째 점의 경도 (도 기준). 범위: `[-180°, 180°]`.
- `lat2Deg` — 두 번째 점의 위도 (도 기준). 범위: `[-90°, 90°]`.

양수 값은 북위와 동경에 해당하고, 음수 값은 남위와 서경에 해당합니다.

**반환 값**

지구 표면의 두 점 간의 거리 (미터 단위).

입력 매개변수 값이 범위를 벗어나는 경우 예외를 발생시킵니다.

**예제**

```sql
SELECT geoDistance(38.8976, -77.0366, 39.9496, -75.1503) AS geoDistance
```

```text
┌─geoDistance─┐
│   212458.73 │
└─────────────┘
```

## greatCircleAngle {#greatcircleangle}

지구 표면의 두 점 간의 중심 각도를 [대원 거리 공식](https://en.wikipedia.org/wiki/Great-circle_distance)을 사용하여 계산합니다.

```sql
greatCircleAngle(lon1Deg, lat1Deg, lon2Deg, lat2Deg)
```

**입력 매개변수**

- `lon1Deg` — 첫 번째 점의 경도 (도 기준).
- `lat1Deg` — 첫 번째 점의 위도 (도 기준).
- `lon2Deg` — 두 번째 점의 경도 (도 기준).
- `lat2Deg` — 두 번째 점의 위도 (도 기준).

**반환 값**

두 점 간의 중심 각도 (도 단위).

**예제**

```sql
SELECT greatCircleAngle(0, 0, 45, 0) AS arc
```

```text
┌─arc─┐
│  45 │
└─────┘
```

## pointInEllipses {#pointinellipses}

점이 적어도 하나의 타원에 속하는지 확인합니다.
좌표는 카르테시안 좌표계에서 기하학적입니다.

```sql
pointInEllipses(x, y, x₀, y₀, a₀, b₀,...,xₙ, yₙ, aₙ, bₙ)
```

**입력 매개변수**

- `x, y` — 평면상의 점의 좌표.
- `xᵢ, yᵢ` — `i`번째 타원의 중심 좌표.
- `aᵢ, bᵢ` — x, y 좌표 단위의 `i`번째 타원의 축.

입력 매개변수는 `2+4⋅n`이어야 하며, 여기서 `n`은 타원의 수입니다.

**반환 값**

점이 적어도 하나의 타원 안에 존재하면 `1`, 그렇지 않으면 `0`을 반환합니다.

**예제**

```sql
SELECT pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)
```

```text
┌─pointInEllipses(10., 10., 10., 9.1, 1., 0.9999)─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```

## pointInPolygon {#pointinpolygon}

점이 평면상의 다각형에 속하는지 확인합니다.

```sql
pointInPolygon((x, y), [(a, b), (c, d) ...], ...)
```

**입력 값**

- `(x, y)` — 평면상의 점의 좌표. 데이터 타입 — [Tuple](../../data-types/tuple.md) — 두 개의 숫자로 이루어진 튜플.
- `[(a, b), (c, d) ...]` — 다각형의 정점. 데이터 타입 — [Array](../../data-types/array.md). 각 정점은 좌표 쌍 `(a, b)`로 나타냄. 정점은 시계 방향 또는 반시계 방향으로 지정해야 하며, 최소 정점 수는 3입니다. 다각형은 일정해야 합니다.
- 이 함수는 구멍이 있는 다각형을 지원합니다 (잘려진 부분). 데이터 타입 — [Polygon](../../data-types/geo.md/#polygon). 전체 `Polygon`을 두 번째 인수로 전달하거나 외부 링을 먼저 전달한 다음 각 구멍을 별도의 추가 인수로 전달합니다.
- 이 함수는 다중 다각형도 지원합니다. 데이터 타입 — [MultiPolygon](../../data-types/geo.md/#multipolygon). 전체 `MultiPolygon`을 두 번째 인수로 전달하거나 각 구성 다각형을 개별 인수로 나열합니다.

**반환 값**

점이 다각형 안에 있으면 `1`, 없으면 `0`을 반환합니다.
점이 다각형 경계에 있으면 함수는 0이나 1을 반환할 수 있습니다.

**예제**

```sql
SELECT pointInPolygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res
```

```text
┌─res─┐
│   1 │
└─────┘
```

> **노트**  
> • `validate_polygons = 0`을 설정하여 기하학적 검증을 우회할 수 있습니다.  
> • `pointInPolygon`은 모든 다각형이 잘 형성되어 있다고 가정합니다. 입력이 자기 교차, 잘못된 순서의 링, 또는 겹치는 경계가 있는 경우, 결과가 신뢰할 수 없게 되며—특히 정확히 경계, 정점, 또는 자기 교차 내에 있는 점에 대해 "안쪽"과 "바깥쪽"의 개념이 정의되지 않습니다.
