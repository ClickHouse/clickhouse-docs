---
'description': 'Geohash에 대한 문서'
'sidebar_label': 'Geohash'
'slug': '/sql-reference/functions/geo/geohash'
'title': '지오해시 작업을 위한 함수'
'doc_type': 'reference'
---

## Geohash {#geohash}

[Geohash](https://en.wikipedia.org/wiki/Geohash)는 지구의 표면을 그리드 형태의 버킷으로 세분화하고 각 셀을 짧은 문자열(문자와 숫자 조합)로 인코딩하는 지리 코드 시스템입니다. 이것은 계층적 데이터 구조로, geohash 문자열이 길어질수록 지리적 위치의 정밀도가 높아집니다.

지리적 좌표를 수동으로 geohash 문자열로 변환해야 하는 경우, [geohash.org](http://geohash.co/)를 사용할 수 있습니다.

## geohashEncode {#geohashencode}

위도와 경도를 [geohash](#geohash) 문자열로 인코딩합니다.

**구문**

```sql
geohashEncode(longitude, latitude, [precision])
```

**입력 값**

- `longitude` — 인코딩하려는 좌표의 경도 부분. 범위는 `[-180°, 180°]`입니다. [Float](../../data-types/float.md). 
- `latitude` — 인코딩하려는 좌표의 위도 부분. 범위는 `[-90°, 90°]`입니다. [Float](../../data-types/float.md).
- `precision` (선택 사항) — 결과로 생성되는 인코딩 문자열의 길이. 기본값은 `12`입니다. 범위는 `[1, 12]`의 정수입니다. [Int8](../../data-types/int-uint.md).

:::note
- 모든 좌표 매개변수는 동일한 유형이어야 합니다: `Float32` 또는 `Float64`.
- `precision` 매개변수의 경우, `1`보다 작거나 `12`보다 큰 값은 조용히 `12`로 변환됩니다.
:::

**반환 값**

- 인코딩된 좌표의 영문자 숫자 문자열 (수정된 base32 인코딩 알파벳 사용). [String](../../data-types/string.md).

**예제**

쿼리:

```sql
SELECT geohashEncode(-5.60302734375, 42.593994140625, 0) AS res;
```

결과:

```text
┌─res──────────┐
│ ezs42d000000 │
└──────────────┘
```

## geohashDecode {#geohashdecode}

어떤 [geohash](#geohash) 인코딩 문자열을 위도와 경도로 디코딩합니다.

**구문**

```sql
geohashDecode(hash_str)
```

**입력 값**

- `hash_str` — Geohash 인코딩 문자열.

**반환 값**

- 위도와 경도의 `Float64` 값의 튜플 `(longitude, latitude)`. [Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

**예제**

```sql
SELECT geohashDecode('ezs42') AS res;
```

```text
┌─res─────────────────────────────┐
│ (-5.60302734375,42.60498046875) │
└─────────────────────────────────┘
```

## geohashesInBox {#geohashesinbox}

주어진 박스의 경계 내에 포함되거나 교차되는 주어진 정밀도의 [geohash](#geohash) 인코딩 문자열 배열을 반환합니다. 기본적으로 평면화된 2D 그리드입니다.

**구문**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**인자**

- `longitude_min` — 최소 경도. 범위: `[-180°, 180°]`. [Float](../../data-types/float.md).
- `latitude_min` — 최소 위도. 범위: `[-90°, 90°]`. [Float](../../data-types/float.md).
- `longitude_max` — 최대 경도. 범위: `[-180°, 180°]`. [Float](../../data-types/float.md).
- `latitude_max` — 최대 위도. 범위: `[-90°, 90°]`. [Float](../../data-types/float.md).
- `precision` — Geohash 정밀도. 범위: `[1, 12]`. [UInt8](../../data-types/int-uint.md).

:::note    
모든 좌표 매개변수는 동일한 유형이어야 합니다: `Float32` 또는 `Float64`.
:::

**반환 값**

- 제공된 영역을 커버하는 정밀도 긴 geohash 박스 문자열 배열, 항목의 순서에 의존하지 않아야 합니다. [Array](../../data-types/array.md)([String](../../data-types/string.md)).
- `[]` - 최소 위도와 경도 값이 해당 최대 값보다 작지 않으면 빈 배열.

:::note    
결과 배열이 10,000,000 개 항목을 초과하면 예외가 발생합니다.
:::

**예제**

쿼리:

```sql
SELECT geohashesInBox(24.48, 40.56, 24.785, 40.81, 4) AS thasos;
```

결과:

```text
┌─thasos──────────────────────────────────────┐
│ ['sx1q','sx1r','sx32','sx1w','sx1x','sx38'] │
└─────────────────────────────────────────────┘
```
