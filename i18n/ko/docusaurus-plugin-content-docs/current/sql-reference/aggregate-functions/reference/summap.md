---
'description': '하나 이상의 `value` 배열을 `key` 배열에 지정된 키에 따라 합산합니다. 정렬된 순서의 키와 해당 키에 대한
  합산된 값이 포함된 튜플 배열을 반환합니다.'
'sidebar_position': 198
'slug': '/sql-reference/aggregate-functions/reference/summap'
'title': 'sumMap'
'doc_type': 'reference'
---


# sumMap

하나 이상의 `value` 배열을 `key` 배열에서 지정된 키에 따라 합산합니다. 정렬된 순서의 키와 해당 키에 대해 합산된 값을 포함하는 배열의 튜플을 반환합니다.

**문법**

- `sumMap(key <Array>, value1 <Array>[, value2 <Array>, ...])` [배열 유형](../../data-types/array.md).
- `sumMap(Tuple(key <Array>[, value1 <Array>, value2 <Array>, ...]))` [튜플 유형](../../data-types/tuple.md).

별칭: `sumMappedArrays`.

**인수**

- `key`: [배열](../../data-types/array.md) 형식의 키.
- `value1`, `value2`, ...: 각 키에 대해 합산할 [배열](../../data-types/array.md) 형식의 값들.

키와 값 배열의 튜플을 전달하는 것은 키 배열과 값 배열을 별도로 전달하는 것의 동의어입니다.

:::note 
`key`와 모든 `value` 배열의 요소 수는 합산되는 각 행에 대해 동일해야 합니다.
:::

**반환 값**

- 배열의 튜플을 반환합니다: 첫 번째 배열은 정렬된 순서의 키를 포함하고, 그 뒤에는 해당 키에 대해 합산된 값을 포함하는 배열이 이어집니다.

**예시**

먼저 `sum_map`이라는 테이블을 만들고, 데이터를 삽입합니다. 키와 값의 배열은 [Nested](../../data-types/nested-data-structures/index.md) 유형의 `statusMap`이라는 컬럼에 개별적으로 저장되며, 두 가지 다른 문법을 설명하기 위해 [튜플](../../data-types/tuple.md) 유형의 `statusMapTuple`이라는 컬럼에 함께 저장됩니다.

쿼리:

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt16,
        requests UInt64
    ),
    statusMapTuple Tuple(Array(Int32), Array(Int32))
) ENGINE = Log;
```
```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

다음으로 `sumMap` 함수를 사용하여 테이블을 쿼리합니다. 배열 및 튜플 유형 문법을 모두 사용합니다:

쿼리:

```sql
SELECT
    timeslot,
    sumMap(statusMap.status, statusMap.requests),
    sumMap(statusMapTuple)
FROM sum_map
GROUP BY timeslot
```

결과:

```text
┌────────────timeslot─┬─sumMap(statusMap.status, statusMap.requests)─┬─sumMap(statusMapTuple)─────────┐
│ 2000-01-01 00:00:00 │ ([1,2,3,4,5],[10,10,20,10,10])               │ ([1,2,3,4,5],[10,10,20,10,10]) │
│ 2000-01-01 00:01:00 │ ([4,5,6,7,8],[10,10,20,10,10])               │ ([4,5,6,7,8],[10,10,20,10,10]) │
└─────────────────────┴──────────────────────────────────────────────┴────────────────────────────────┘
```

**여러 값 배열을 가진 예시**

`sumMap`은 여러 값 배열을 동시에 집계하는 것도 지원합니다.
이는 동일한 키를 공유하는 관련 메트릭이 있을 때 유용합니다.

```sql title="Query"
CREATE TABLE multi_metrics(
    date Date,
    browser_metrics Nested(
        browser String,
        impressions UInt32,
        clicks UInt32
    )
)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO multi_metrics VALUES
    ('2000-01-01', ['Firefox', 'Chrome'], [100, 200], [10, 25]),
    ('2000-01-01', ['Chrome', 'Safari'], [150, 50], [20, 5]),
    ('2000-01-01', ['Firefox', 'Edge'], [80, 40], [8, 4]);

SELECT 
    sumMap(browser_metrics.browser, browser_metrics.impressions, browser_metrics.clicks) AS result
FROM multi_metrics;
```

```text title="Response"
┌─result────────────────────────────────────────────────────────────────────────┐
│ (['Chrome', 'Edge', 'Firefox', 'Safari'], [350, 40, 180, 50], [45, 4, 18, 5]) │
└───────────────────────────────────────────────────────────────────────────────┘
```

이 예시에서:
- 결과 튜플은 세 개의 배열을 포함합니다.
- 첫 번째 배열: 정렬된 순서의 키(브라우저 이름)
- 두 번째 배열: 각 브라우저에 대한 총 노출 수
- 세 번째 배열: 각 브라우저에 대한 총 클릭 수

**참고**

- [Map 데이터 유형을 위한 맵 조합기](../combinators.md#-map)
- [sumMapWithOverflow](../reference/summapwithoverflow.md)
