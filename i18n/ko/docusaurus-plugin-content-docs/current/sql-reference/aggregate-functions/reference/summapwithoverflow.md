---
'description': '주어진 `key` 배열에 지정된 키에 따라 `value` 배열의 총합을 구합니다. 정렬된 순서의 키와 해당 키에 대해
  합산된 값의 두 배열로 이루어진 튜플을 반환합니다. sumMap 함수와의 차이점은 오버플로우와 함께 합산을 수행한다는 점입니다.'
'sidebar_position': 199
'slug': '/sql-reference/aggregate-functions/reference/summapwithoverflow'
'title': 'sumMapWithOverflow'
'doc_type': 'reference'
---


# sumMapWithOverflow

`key` 배열에 지정된 키에 따라 `value` 배열의 총계를 계산합니다. 정렬된 순서의 키 배열과 해당 키에 대한 합산된 값 배열의 튜플을 반환합니다. 이는 [sumMap](../reference/summap.md) 함수와 다르게 오버플로우가 있는 합계를 수행하며, 즉 합산의 데이터 타입이 인수 데이터 타입과 동일하게 반환됩니다.

**구문**

- `sumMapWithOverflow(key <Array>, value <Array>)` [배열 타입](../../data-types/array.md).
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [튜플 타입](../../data-types/tuple.md).

**인수** 

- `key`: 키의 [배열](../../data-types/array.md).
- `value`: 값의 [배열](../../data-types/array.md).

키와 값 배열의 튜플을 전달하는 것은 키 배열과 값 배열을 따로 전달하는 것의 동의어입니다.

:::note 
각 행에 대해 총계가 계산될 때 `key`와 `value`의 요소 수는 동일해야 합니다.
:::

**반환 값** 

- 정렬된 순서의 키 배열과 해당 키에 대해 합산된 값 배열의 튜플을 반환합니다.

**예제**

먼저 `sum_map`이라는 테이블을 만들고, 여기에 몇 가지 데이터를 삽입합니다. 키 배열과 값 배열은 [Nested](../../data-types/nested-data-structures/index.md) 타입의 `statusMap`이라는 컬럼에 각각 저장되며, 위에서 설명한 두 가지 다른 구문을 사용하기 위해 [튜플](../../data-types/tuple.md) 타입의 `statusMapTuple`이라는 컬럼에 함께 저장됩니다.

쿼리:

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt8,
        requests UInt8
    ),
    statusMapTuple Tuple(Array(Int8), Array(Int8))
) ENGINE = Log;
```
```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

`sumMap` 및 `array` 타입 구문과 `sumMapWithOverflow`, `toTypeName` 함수를 사용하여 테이블을 쿼리하면, `sumMapWithOverflow` 함수의 합산된 값 배열의 데이터 타입이 인수 타입과 동일한 `UInt8`이라는 것을 확인할 수 있습니다 (즉, 오버플로우가 발생했습니다). 반면, `sumMap`의 합산된 값 배열의 데이터 타입은 `UInt8`에서 `UInt64`로 변경되어 오버플로우가 발생하지 않도록 합니다.

쿼리:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

동일한 결과를 위해 튜플 구문을 사용할 수도 있습니다.

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

결과:

```text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**참고**

- [sumMap](../reference/summap.md)
