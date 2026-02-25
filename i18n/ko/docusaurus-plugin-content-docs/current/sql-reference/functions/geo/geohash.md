---
description: 'Geohash 문서'
sidebar_label: 'Geohash'
slug: /sql-reference/functions/geo/geohash
title: 'Geohash 작업을 위한 함수'
doc_type: 'reference'
---



## Geohash \{#geohash\}

[Geohash](https://en.wikipedia.org/wiki/Geohash)는 지구 표면을 격자 모양의 버킷으로 세분화하고, 각 셀을 문자와 숫자로 이루어진 짧은 문자열로 인코딩하는 지오코드 시스템입니다. 계층적 데이터 구조이므로 geohash 문자열이 길어질수록 지리적 위치가 더 정밀해집니다.

지리 좌표를 geohash 문자열로 수동으로 변환해야 하는 경우 [geohash.org](http://geohash.co/)를 사용할 수 있습니다.



## geohashEncode \{#geohashencode\}

위도와 경도를 [geohash](#geohash) 문자열로 인코딩합니다.

**구문**

```sql
geohashEncode(longitude, latitude, [precision])
```

**입력 값**

* `longitude` — 인코딩하려는 좌표의 경도 부분입니다. `[-180°, 180°]` 범위의 부동 소수점 숫자입니다. [Float](../../data-types/float.md).
* `latitude` — 인코딩하려는 좌표의 위도 부분입니다. `[-90°, 90°]` 범위의 부동 소수점 숫자입니다. [Float](../../data-types/float.md).
* `precision` (선택) — 결과로 생성되는 인코딩 문자열의 길이입니다. 기본값은 `12`입니다. `[1, 12]` 범위의 정수입니다. [Int8](../../data-types/int-uint.md).

:::note

* 모든 좌표 매개변수는 동일한 타입(`Float32` 또는 `Float64`)이어야 합니다.
* `precision` 매개변수의 값이 `1`보다 작거나 `12`보다 크면, 별도의 경고 없이 자동으로 `12`로 변환됩니다.
  :::

**반환 값**

* 인코딩된 좌표를 나타내는 영숫자 문자열입니다(수정된 base32 인코딩 알파벳을 사용합니다). [String](../../data-types/string.md).

**예시**

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


## geohashDecode \{#geohashdecode\}

[geohash](#geohash)로 인코딩된 문자열을 경도와 위도로 디코드합니다.

**구문**

```sql
geohashDecode(hash_str)
```

**입력값**

* `hash_str` — Geohash로 인코딩된 문자열.

**반환값**

* 위도와 경도의 `Float64` 값으로 이루어진 튜플 `(longitude, latitude)`. [Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md))

**예제**

```sql
SELECT geohashDecode('ezs42') AS res;
```

```text
┌─res─────────────────────────────┐
│ (-5.60302734375,42.60498046875) │
└─────────────────────────────────┘
```


## geohashesInBox \{#geohashesinbox\}

지정된 박스의 영역에 포함되거나 경계를 가로지르는, 주어진 정밀도의 [geohash](#geohash)로 인코딩된 문자열 배열을 반환합니다. 기본적으로 2차원 그리드를 배열로 평탄화한 것입니다.

**구문**

```sql
geohashesInBox(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```

**인수**

* `longitude_min` — 최소 경도. 범위: `[-180°, 180°]`. [Float](../../data-types/float.md).
* `latitude_min` — 최소 위도. 범위: `[-90°, 90°]`. [Float](../../data-types/float.md).
* `longitude_max` — 최대 경도. 범위: `[-180°, 180°]`. [Float](../../data-types/float.md).
* `latitude_max` — 최대 위도. 범위: `[-90°, 90°]`. [Float](../../data-types/float.md).
* `precision` — geohash 정밀도. 범위: `[1, 12]`. [UInt8](../../data-types/int-uint.md).

:::note
모든 좌표 매개변수는 동일한 타입이어야 합니다. `Float32` 또는 `Float64`만 허용됩니다.
:::

**반환 값**

* 지정된 영역을 덮는 geohash-box의 문자열 배열로, 각 문자열 길이는 precision 값과 동일하며 항목의 순서에 의존해서는 안 합니다. [Array](../../data-types/array.md)([String](../../data-types/string.md)).
* `[]` - 최소 위도 및 경도 값이 해당 최대 값보다 작지 않은 경우의 빈 배열.

:::note
결과 배열의 길이가 10&#39;000&#39;000개를 초과하면 함수는 예외를 발생시킵니다.
:::

**예시**

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
