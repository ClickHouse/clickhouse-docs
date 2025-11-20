---
'slug': '/examples/aggregate-function-combinators/minSimpleState'
'title': 'minSimpleState'
'description': 'minSimpleState 조합기를 사용하는 예'
'keywords':
- 'min'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'minSimpleState'
'sidebar_label': 'minSimpleState'
'doc_type': 'reference'
---


# minSimpleState {#minsimplestate}

## 설명 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 컴비네이터는 [`min`](/sql-reference/aggregate-functions/reference/min) 함수에 적용되어 모든 입력 값 중 최소 값을 반환합니다. 결과는 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 유형으로 반환됩니다.

## 사용 예시 {#example-usage}

일일 온도 측정을 추적하는 테이블을 사용하는 실제 예를 살펴보겠습니다. 각 위치에 대해 기록된 최저 온도를 유지하려고 합니다. `min`과 함께 `SimpleAggregateFunction` 유형을 사용하면 더 낮은 온도가 발생할 때 저장된 값이 자동으로 업데이트됩니다.

원시 온도 측정을 위한 원본 테이블을 생성합니다:

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

최소 온도를 저장할 집계 테이블을 생성합니다:

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

삽입된 데이터에 대한 삽입 트리거 역할을 하는 점진적 물리화된 뷰를 생성하고 각 위치별로 최소 및 최대 온도를 유지합니다.

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

일부 초기 온도 측정을 삽입합니다:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

이 측정값은 물리화된 뷰에 의해 자동으로 처리됩니다. 현재 상태를 확인해 봅시다:

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

좀 더 많은 데이터를 삽입합니다:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

새로운 데이터 후 업데이트된 극단값을 봅니다:

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

위에서 각 위치에 두 개의 삽입된 값이 있는 것을 주목하세요. 이는 파트가 아직 병합되지 않았기 때문입니다(그리고 `AggregatingMergeTree`에 의해 집계되었습니다). 부분 상태로부터 최종 결과를 얻기 위해 `GROUP BY`를 추가해야 합니다:

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

이제 예상 결과를 얻습니다:

```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
`SimpleState`를 사용하면 부분 집계 상태를 결합하기 위해 `Merge` 컴비네이터를 사용할 필요가 없습니다.
:::

## 참조 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
