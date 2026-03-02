---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'minSimpleState 조합자(combinator) 사용 예제'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
doc_type: 'reference'
---

# minSimpleState \{#minsimplestate\}

## 설명 \{#description\}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 조합자는 [`min`](/sql-reference/aggregate-functions/reference/min)
함수에 적용하여 모든 입력 값 중 최솟값을 반환합니다. 이 조합자는 
[`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 타입의 결과를 반환합니다.

## 사용 예시 \{#example-usage\}

일별 기온 측정값을 추적하는 테이블을 사용하는 실제 예시를 살펴보겠습니다.
각 위치에 대해 기록된 최저 기온을 유지하도록 합니다.
`SimpleAggregateFunction` 타입을 `min`과 함께 사용하면 더 낮은 기온이 기록될 때마다
저장된 값이 자동으로 갱신됩니다.

원시 기온 측정값을 위한 소스 테이블을 생성합니다:

```sql
CREATE TABLE raw_temperature_readings
(
    location_id UInt32,
    location_name String,
    temperature Int32,
    recorded_at DateTime DEFAULT now()
)
    ENGINE = MergeTree()
ORDER BY (location_id, recorded_at);
```

최소 기온을 저장할 집계 테이블을 생성하십시오.

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- Stores minimum temperature
    max_temp SimpleAggregateFunction(max, Int32)   -- Stores maximum temperature
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

삽입되는 데이터에 대해 INSERT 트리거처럼 동작하면서
위치별 최소 및 최대 온도를 유지하는 증분형 materialized view를 생성합니다.

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- Using SimpleState combinator
    maxSimpleState(temperature) AS max_temp      -- Using SimpleState combinator
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

초기 온도 측정값을 몇 개 삽입하십시오:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

이 측정값은 materialized view에 의해 자동으로 처리됩니다. 현재 상태를 확인해 보십시오.

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- Directly accessing the SimpleAggregateFunction values
    max_temp      -- No need for finalization function with SimpleAggregateFunction
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        5 │        5 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

데이터를 조금 더 삽입합니다:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

새로운 데이터가 반영된 후의 최신 극값을 조회합니다:

```sql
SELECT
    location_id,
    location_name,
    min_temp,  
    max_temp
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           1 │ North         │        5 │        5 │
│           2 │ South         │       18 │       18 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        2 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

위에서 각 location에 대해 두 개의 값이 삽입된 것을 확인할 수 있습니다. 이는
파트가 아직 병합되지 않았고(그리고 `AggregatingMergeTree`에 의해 집계되지도 않았기) 때문입니다. 부분 상태에서 최종 결과를 얻으려면 `GROUP BY`를 추가해야 합니다:

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- Aggregate across all parts 
    max(max_temp) AS max_temp   -- Aggregate across all parts
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

이제 예상한 결과를 얻을 수 있습니다:


```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
`SimpleState`를 사용하면 부분 집계 상태를 결합할 때 `Merge` 조합자를 사용할 필요가 없습니다.
:::


## 같이 보기 \{#see-also\}

- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)