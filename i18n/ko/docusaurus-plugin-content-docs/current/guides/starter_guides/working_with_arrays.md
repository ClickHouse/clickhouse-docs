---
title: 'ClickHouse에서 배열 사용하기'
description: 'ClickHouse에서 배열을 사용하는 방법에 대한 입문 가이드'
keywords: ['Arrays']
sidebar_label: 'ClickHouse에서 배열 사용하기'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> 이 가이드에서는 ClickHouse에서 배열을 사용하는 방법과 가장 자주 사용되는 [배열 함수](/sql-reference/functions/array-functions) 일부를 다룹니다.

## 배열 소개 \{#array-basics\}

배열은 값들을 함께 그룹화하는 인메모리 데이터 구조입니다.
이러한 값들을 배열의 *요소(element)* 라고 하며, 각 요소는 그룹 내에서 해당 요소의 위치를 나타내는 인덱스를 통해 참조할 수 있습니다.

ClickHouse에서 배열은 [`array`](/sql-reference/data-types/array) 함수를 사용하여 생성됩니다:

```sql
array(T)
```

또는 대괄호를 사용하여 표현할 수도 있습니다:

```sql
[]
```

예를 들어 숫자 배열을 생성할 수 있습니다:

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

또는 문자열 배열을 사용할 수 있습니다:

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

또는 [튜플(tuple)](/sql-reference/data-types/tuple)과 같은 중첩 타입의 배열:

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

다음과 같이 서로 다른 타입의 배열을 만들려고 시도할 수 있습니다:

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

그러나 배열 요소는 항상 공통 상위 타입(common super-type)을 가져야 합니다. 공통 상위 타입은 두 개 이상의 서로 다른 타입의 값을 손실 없이 표현할 수 있는 최소 데이터 타입으로, 이를 통해 함께 사용할 수 있습니다.
공통 상위 타입이 없는 경우 배열을 생성하려고 하면 예외가 발생합니다:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

배열을 즉석에서 생성할 때 ClickHouse는 모든 요소를 포함할 수 있는 가장 좁은 데이터 타입을 선택합니다.
예를 들어, 정수와 부동소수점 숫자로 구성된 배열을 생성하면 float의 상위 타입이 선택됩니다:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>서로 다른 타입의 배열 생성</summary>

  위에서 설명한 기본 동작은 `use_variant_as_common_type` 설정으로 변경할 수 있습니다.
  이 설정을 사용하면 인자 타입에 공통 타입이 없을 때 `if`/`multiIf`/`array`/`map` 함수의 결과 타입으로 [Variant](/sql-reference/data-types/variant) 타입을 사용할 수 있습니다.

  예를 들어:

  ```sql
  SELECT
      [1, 'ClickHouse', ['Another', 'Array']] AS array,
      toTypeName(array)
  SETTINGS use_variant_as_common_type = 1;
  ```

  ```response
  ┌─array────────────────────────────────┬─toTypeName(array)────────────────────────────┐
  │ [1,'ClickHouse',['Another','Array']] │ Array(Variant(Array(String), String, UInt8)) │
  └──────────────────────────────────────┴──────────────────────────────────────────────┘
  ```

  그런 다음 배열에서 타입 이름을 사용해 타입을 조회할 수도 있습니다:

  ```sql
  SELECT
      [1, 'ClickHouse', ['Another', 'Array']] AS array,
      array.UInt8,
      array.String,
      array.`Array(String)`
  SETTINGS use_variant_as_common_type = 1;
  ```

  ```response
  ┌─array────────────────────────────────┬─array.UInt8───┬─array.String─────────────┬─array.Array(String)─────────┐
  │ [1,'ClickHouse',['Another','Array']] │ [1,NULL,NULL] │ [NULL,'ClickHouse',NULL] │ [[],[],['Another','Array']] │
  └──────────────────────────────────────┴───────────────┴──────────────────────────┴─────────────────────────────┘
  ```
</details>

대괄호와 함께 인덱스를 사용하면 배열 요소에 편리하게 접근할 수 있습니다.
ClickHouse에서는 배열 인덱스가 항상 **1**부터 시작한다는 점을 알아두어야 합니다.
이는 배열이 0부터 시작하는 다른 프로그래밍 언어와 다를 수 있습니다.

예를 들어, 배열이 주어진 경우 다음과 같이 작성하여 배열의 첫 번째 요소를 선택할 수 있습니다:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

음수 인덱스도 사용할 수 있습니다.
이 방식으로 마지막 요소를 기준으로 요소를 선택할 수 있습니다:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

배열이 1부터 시작하는 인덱스를 사용하더라도 0 위치의 요소에 여전히 접근할 수 있습니다.
반환되는 값은 배열 타입의 *기본값*입니다.
아래 예시에서는 문자열 데이터 타입의 기본값이므로 빈 문자열이 반환됩니다:

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```


## 배열 함수 \{#array-functions\}

ClickHouse는 배열을 대상으로 동작하는 다양한 유용한 함수를 제공합니다.
이 섹션에서는 가장 단순한 함수부터 시작하여 점차 복잡한 함수까지, 가장 유용한 몇 가지를 살펴보겠습니다.

### length, arrayEnumerate, indexOf, has* 함수 \{#length-arrayEnumerate-indexOf-has-functions\}

`length` 함수는 배열의 요소 개수를 반환하는 데 사용됩니다:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

또한 [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) 함수를 사용하여 요소 인덱스의 배열을 반환할 수도 있습니다:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

특정 값의 인덱스를 찾으려면 `indexOf` 함수를 사용하면 됩니다:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

이 함수는 배열에 동일한 값이 여러 개 존재하는 경우, 처음 발견한 인덱스를 반환합니다.
배열 요소가 오름차순으로 정렬되어 있다면 [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted) 함수를 사용할 수 있습니다.

`has`, `hasAll`, `hasAny` 함수는 배열에 주어진 값이 포함되어 있는지를 판별할 때 유용합니다.
다음 예제를 참고하십시오:

```sql
WITH ['Airbus A380', 'Airbus A350', 'Airbus A220', 'Boeing 737', 'Boeing 747-400'] AS airplanes
SELECT
    has(airplanes, 'Airbus A350') AS has_true,
    has(airplanes, 'Lockheed Martin F-22 Raptor') AS has_false,
    hasAny(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAny_true,
    hasAny(airplanes, ['Lockheed Martin F-22 Raptor', 'Eurofighter Typhoon']) AS hasAny_false,
    hasAll(airplanes, ['Boeing 737', 'Boeing 747-400']) AS hasAll_true,
    hasAll(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAll_false
FORMAT Vertical;
```

```response
has_true:     1
has_false:    0
hasAny_true:  1
hasAny_false: 0
hasAll_true:  1
hasAll_false: 0
```


## 배열 함수를 사용하여 항공편 데이터 탐색하기 \{#exploring-flight-data-with-array-functions\}

지금까지의 예시는 매우 단순했습니다.
배열의 진정한 유용성은 현실 세계 데이터셋에 사용될 때 잘 드러납니다.

[ontime 데이터셋](/getting-started/example-datasets/ontime)을 사용하며, 이 데이터셋에는 미국 교통통계국(Bureau of Transportation Statistics)의 항공편 데이터가 포함되어 있습니다.
이 데이터셋은 [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K)에서 확인할 수 있습니다.

배열은 시계열 데이터 작업에 적합한 경우가 많으며, 그렇지 않으면 복잡해질 쿼리를 단순화하는 데 도움이 되기 때문에 이 데이터셋을 선택했습니다.

:::tip
아래의 「재생」 버튼을 클릭하여 문서에서 쿼리를 바로 실행하고 결과를 실시간으로 확인하십시오.
:::

### groupArray \{#grouparray\}

이 데이터셋에는 많은 컬럼이 있지만, 여기서는 일부 컬럼만 살펴보겠습니다.
아래 쿼리를 실행하여 데이터가 어떻게 구성되어 있는지 확인하십시오:

```sql runnable
-- SELECT
-- *
-- FROM ontime.ontime LIMIT 100

SELECT
    FlightDate,
    Origin,
    OriginCityName,
    Dest,
    DestCityName,
    DepTime,
    DepDelayMinutes,
    ArrTime,
    ArrDelayMinutes
FROM ontime.ontime LIMIT 5
```

무작위로 선택한 특정 날짜, 예를 들어 &#39;2024-01-01&#39;에 미국에서 가장 붐비는 공항 10곳을 살펴보겠습니다.
각 공항에서 출발하는 항공편 수를 파악하는 데 관심이 있습니다.
데이터는 항공편마다 한 행을 포함하고 있지만, 출발 공항별로 데이터를 그룹화하고 도착지를 배열로 모을 수 있다면 더 편리할 것입니다.

이를 위해 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 집계 함수를 사용할 수 있습니다. 이 함수는 각 행에서 지정된 컬럼의 값을 가져와 하나의 배열로 그룹화합니다.

아래 쿼리를 실행하여 동작 방식을 확인하십시오:

```sql runnable
SELECT
    FlightDate,
    Origin,
    groupArray(toStringCutToZero(Dest)) AS Destinations
FROM ontime.ontime
WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA') AND FlightDate='2024-01-01'
GROUP BY FlightDate, Origin
ORDER BY length(Destinations)
```

위 쿼리에서 [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#toStringCutToZero)는 일부 공항의 3글자 코드 뒤에 나타나는 널 문자를 제거하는 데 사용됩니다.

데이터가 이 형식으로 정리되어 있으면, 롤업된 「Destinations」 배열의 길이를 구해 가장 혼잡한 공항의 순서를 쉽게 찾을 수 있습니다:

```sql runnable
WITH
    '2024-01-01' AS date,
    busy_airports AS (
    SELECT
    FlightDate,
    Origin,
--highlight-next-line
    groupArray(toStringCutToZero(Dest)) AS Destinations
    FROM ontime.ontime
    WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA')
    AND FlightDate = date
    GROUP BY FlightDate, Origin
    ORDER BY length(Destinations)
    )
SELECT
    Origin,
    length(Destinations) AS outward_flights
FROM busy_airports
ORDER BY outward_flights DESC
```


### arrayMap 및 arrayZip \{#arraymap\}

이전 쿼리에서 선택한 특정 날짜에 출발 항공편이 가장 많았던 공항이 Denver International Airport라는 것을 확인했습니다.
이제 그 항공편들 중 정시 출발, 15–30분 지연, 30분 초과 지연이 각각 얼마나 되는지 살펴보겠습니다.

ClickHouse의 배열 함수들 중 상당수는 이른바 [&quot;고차 함수&quot;](/sql-reference/functions/overview#higher-order-functions)이며, 첫 번째 매개변수로 람다 함수를 받습니다.
[`arrayMap`](/sql-reference/functions/array-functions#arrayMap) 함수는 이러한 고차 함수의 한 예로, 원본 배열의 각 요소에 람다 함수를 적용하여 주어진 배열로부터 새로운 배열을 반환합니다.

아래 `arrayMap` 함수를 사용하는 쿼리를 실행하여 어떤 항공편이 지연되었는지, 또는 정시에 출발했는지 확인하십시오.
출발지/도착지 쌍별로 각 항공편의 꼬리번호와 상태를 보여 줍니다:

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    arrayZip(groupArray(Tail_Number), statuses) as tailNumberStatuses
FROM ontime.ontime
WHERE Origin = 'DEN'
  AND FlightDate = '2024-01-01'
  AND DepTime IS NOT NULL
  AND DepDelayMinutes IS NOT NULL
GROUP BY ALL
```

위 쿼리에서 `arrayMap` 함수는 단일 요소 배열 `[DepDelayMinutes]`를 입력으로 받아 람다 함수 `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'`를 적용하여 값을 범주화합니다.
그다음 결과 배열의 첫 번째 요소를 `[DepDelayMinutes][1]` 표현식을 사용해 추출합니다.
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 함수는 `Tail_Number` 배열과 `statuses` 배열을 하나의 배열로 결합합니다.


### arrayFilter \{#arrayfilter\}

다음으로 공항 `DEN`, `ATL`, `DFW`에서 30분 이상 지연된 항공편 수만 살펴보겠습니다:

```sql runnable
SELECT
    Origin,
    OriginCityName,
--highlight-next-line
    length(arrayFilter(d -> d >= 30, groupArray(ArrDelayMinutes))) AS num_delays_30_min_or_more
FROM ontime.ontime
WHERE Origin IN ('DEN', 'ATL', 'DFW')
    AND FlightDate = '2024-01-01'
GROUP BY Origin, OriginCityName
ORDER BY num_delays_30_min_or_more DESC
```

위 쿼리에서는 첫 번째 인수로 lambda 함수를 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 함수에 전달합니다.
이 lambda 함수는 지연 시간(d, 분 단위)을 입력으로 받아 조건을 만족하면 `1`, 그렇지 않으면 `0`을 반환합니다.

```sql
d -> d >= 30
```


### arraySort 및 arrayIntersect \{#arraysort-and-arrayintersect\}

다음으로, [`arraySort`](/sql-reference/functions/array-functions#arraySort) 및 [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect) 함수를 사용하여 어떤 미국 주요 공항 쌍이 가장 많은 공통 목적지를 갖는지 살펴봅니다.
`arraySort`는 배열을 입력으로 받아 기본적으로 오름차순으로 정렬하며, 정렬 순서를 정의하기 위해 람다 함수를 전달할 수도 있습니다.
`arrayIntersect`는 여러 배열을 입력으로 받아, 모든 배열에 공통으로 존재하는 요소들만 포함하는 배열을 반환합니다.

아래 쿼리를 실행하여 이 두 배열 함수가 어떻게 동작하는지 확인하십시오:

```sql runnable
WITH airport_routes AS (
    SELECT 
        Origin,
--highlight-next-line
        arraySort(groupArray(DISTINCT toStringCutToZero(Dest))) AS destinations
    FROM ontime.ontime
    WHERE FlightDate = '2024-01-01'
    GROUP BY Origin
)
SELECT 
    a1.Origin AS airport1,
    a2.Origin AS airport2,
--highlight-next-line
    length(arrayIntersect(a1.destinations, a2.destinations)) AS common_destinations
FROM airport_routes a1
CROSS JOIN airport_routes a2
WHERE a1.Origin < a2.Origin
    AND a1.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
    AND a2.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
ORDER BY common_destinations DESC
LIMIT 10
```

이 쿼리는 두 가지 주요 단계로 동작합니다.
먼저 Common Table Expression(CTE)을 사용해 `airport_routes`라는 임시 데이터셋을 생성하여 2024년 1월 1일의 모든 항공편을 조회하고, 각 출발 공항마다 해당 공항이 운항하는 모든 고유 도착지를 정렬된 배열로 구성합니다.
예를 들어, `airport_routes` 결과 집합에서 DEN에는 `['ATL', 'BOS', 'LAX', 'MIA', ...]`와 같이 이 공항이 운항하는 모든 도시가 담긴 배열이 포함될 수 있습니다.

두 번째 단계에서 쿼리는 다섯 개 미국 주요 허브 공항(`DEN`, `ATL`, `DFW`, `ORD`, `LAS`)을 대상으로 가능한 모든 공항 쌍을 비교합니다.
이를 위해 CROSS JOIN을 사용하여 이들 공항의 모든 조합을 생성합니다.
그런 다음 각 쌍에 대해 `arrayIntersect` 함수를 사용해 두 공항의 리스트에 모두 포함되는 도착지가 무엇인지 찾습니다.
`length` 함수는 두 공항이 공통으로 가지는 도착지 수를 계산합니다.

`a1.Origin < a2.Origin` 조건은 각 공항 쌍이 한 번만 나타나도록 보장합니다.
이 조건이 없으면 JFK-LAX와 LAX-JFK가 서로 다른 결과로 모두 나오는데, 이는 동일한 비교를 중복해서 나타내므로 불필요합니다.
마지막으로 쿼리는 결과를 정렬하여 어떤 공항 쌍이 가장 많은 공통 도착지를 가지는지 보여 주고, 상위 10개만 반환합니다.
이를 통해 어떤 주요 허브가 가장 많이 겹치는 노선 네트워크를 보유하는지 파악할 수 있으며, 이는 여러 항공사가 동일한 도시 쌍을 운항하는 경쟁 시장을 의미할 수도 있고, 비슷한 지리적 지역을 운항하여 여행자를 위한 대체 환승 지점으로 활용될 수 있는 허브를 나타낼 수도 있습니다.


### arrayReduce \{#arrayReduce\}

지연 시간을 살펴보고 있는 김에, 또 다른 고차 배열 FUNCTION인 `arrayReduce`를 사용해 덴버 국제공항 출발 각 노선별 평균 및 최대 지연 시간을 계산해 보겠습니다:

```sql runnable
SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    groupArray(DepDelayMinutes) AS delays,
--highlight-start
    round(arrayReduce('avg', groupArray(DepDelayMinutes)), 2) AS avg_delay,
    round(arrayReduce('max', groupArray(DepDelayMinutes)), 2) AS worst_delay
--highlight-end
FROM ontime.ontime
WHERE Origin = 'DEN'
    AND FlightDate = '2024-01-01'
    AND DepDelayMinutes IS NOT NULL
GROUP BY Origin, Destination
ORDER BY avg_delay DESC
```

위 예제에서는 `arrayReduce`를 사용하여 `DEN`에서 출발하는 여러 항공편의 평균 및 최대 지연 시간을 계산했습니다.
`arrayReduce`는 첫 번째 매개변수로 지정된 집계 함수(aggregate function)를 두 번째 매개변수로 전달된 배열의 요소들에 적용합니다.


### arrayJoin \{#arrayJoin\}

ClickHouse의 일반 함수는 입력으로 받은 행 수와 동일한 수의 행을 반환하는 특성이 있습니다.
하지만 이 규칙을 깨는, 알아둘 가치가 있는 흥미롭고 독특한 함수가 하나 있는데, 바로 `arrayJoin` 함수입니다.

`arrayJoin`은 배열을 받아 각 요소마다 별도의 행을 생성하여 배열을 「폭발(explode)」시키는 함수입니다.
이는 다른 데이터베이스의 `UNNEST` 또는 `EXPLODE` SQL 함수와 유사합니다.

배열이나 스칼라 값을 반환하는 대부분의 배열 함수와 달리, `arrayJoin`은 행 수를 늘려 결과 집합을 근본적으로 변화시킵니다.

아래 쿼리는 0에서 100까지 10 단위로 증가하는 값들의 배열을 반환합니다.
이 배열을 서로 다른 지연 시간으로 볼 수 있습니다. 예를 들어 0분, 10분, 20분 등입니다.

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

`arrayJoin`을 사용하여 두 공항 사이에서 해당 분 수 이내에 발생한 지연이 몇 건인지 계산하는 쿼리를 작성할 수 있습니다.
아래 쿼리는 누적 지연 버킷을 사용하여 2024년 1월 1일 덴버(DEN)에서 마이애미(MIA)로 가는 항공편 지연 분포를 보여주는 히스토그램을 생성합니다.

```sql runnable
WITH range(0, 100, 10) AS delay,
    toStringCutToZero(Dest) AS Destination

SELECT
    'Up to ' || arrayJoin(delay) || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= arrayJoin(delay)) AS flightsDelayed
FROM ontime.ontime
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY delayTime
ORDER BY flightsDelayed DESC
```

위 쿼리에서는 CTE 절(`WITH` 절)을 사용하여 지연 시간 배열을 반환합니다.
`Destination`은 목적지 코드를 문자열로 변환합니다.

`arrayJoin`을 사용하여 지연 시간 배열을 개별 행으로 펼칩니다.
`delay` 배열의 각 값은 `del`이라는 별칭을 가진 별도의 행이 되며,
총 10개의 행이 생성됩니다. 하나는 `del=0`, 또 하나는 `del=10`, 또 다른 하나는 `del=20` 등의 형태입니다.
각 지연 임계값(`del`)에 대해 쿼리는 `countIf(DepDelayMinutes >= del)`을 사용하여
해당 임계값 이상으로 지연된 항공편이 몇 건이었는지 계산합니다.

`arrayJoin`에는 이에 상응하는 SQL 명령인 `ARRAY JOIN`도 있습니다.
비교를 위해 위 쿼리를 SQL 명령 형태로 아래에 다시 제시합니다.

```sql runnable
WITH range(0, 100, 10) AS delay, 
     toStringCutToZero(Dest) AS Destination

SELECT    
    'Up to ' || del || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```


## 다음 단계 \{#next-steps\}

축하합니다! 이제 ClickHouse에서 배열을 사용하는 방법을, 기본적인 배열 생성과 인덱싱부터 `groupArray`, `arrayFilter`, `arrayMap`, `arrayReduce`, `arrayJoin` 같은 강력한 함수까지 학습했습니다.
학습을 계속 진행하려면 전체 배열 함수 레퍼런스 문서를 살펴보고 `arrayFlatten`, `arrayReverse`, `arrayDistinct`와 같은 추가 함수를 확인하십시오.
또한 배열과 함께 잘 동작하는 [`tuples`](/sql-reference/data-types/tuple#creating-tuples), [JSON](/sql-reference/data-types/newjson), [맵](/sql-reference/data-types/map) 타입과 같은 관련 데이터 구조도 살펴보는 것이 좋습니다.
이 개념들을 실제 데이터셋에 적용해 보고 SQL 플레이그라운드나 다른 예제 데이터셋에서 다양한 쿼리를 실험해 보십시오.

배열은 ClickHouse에서 효율적인 분석 쿼리를 가능하게 하는 핵심 기능이며, 배열 함수에 익숙해질수록 복잡한 집계와 시계열 분석을 크게 단순화할 수 있습니다.
배열을 더 깊이 익히고 싶다면, 아래에 있는 사내 데이터 전문가 Mark의 YouTube 동영상을 시청해 보시기를 권장합니다:

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>