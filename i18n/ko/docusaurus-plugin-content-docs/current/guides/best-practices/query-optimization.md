---
'slug': '/optimize/query-optimization'
'sidebar_label': '쿼리 최적화'
'title': '쿼리 최적화를 위한 가이드'
'description': '쿼리 성능 개선을 위한 일반적인 경로를 설명하는 쿼리 최적화에 대한 간단한 가이드'
'doc_type': 'guide'
'keywords':
- 'query optimization'
- 'performance'
- 'best practices'
- 'query tuning'
- 'efficiency'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';



# 쿼리 최적화를 위한 간단한 가이드

이 섹션에서는 [analyzer](/operations/analyzer), [query profiling](/operations/optimizing-performance/sampling-query-profiler) 또는 [nullable Columns 피하기](/optimize/avoid-nullable-columns)와 같은 다양한 성능 및 최적화 기법을 사용하는 방법을 일반적인 시나리오를 통해 설명하여 ClickHouse 쿼리 성능을 향상시키는 것을 목표로 합니다.

## 쿼리 성능 이해하기 {#understand-query-performance}

성능 최적화를 생각하기 가장 좋은 순간은 데이터를 ClickHouse로 첫 번째로 수집하기 전에 [데이터 스키마](/data-modeling/schema-design)를 설정할 때입니다.

하지만 솔직히 말하자면, 데이터가 얼마나 성장할지 또는 어떤 유형의 쿼리가 실행될지 예측하기는 어렵습니다.

기존 배포가 있고 개선하고 싶은 쿼리가 몇 개 있다면, 첫 번째 단계는 그런 쿼리가 어떻게 수행되는지 그리고 왜 어떤 쿼리는 몇 밀리초 안에 실행되고 다른 쿼리는 더 오래 걸리는지를 이해하는 것입니다.

ClickHouse는 쿼리가 어떻게 실행되는지 및 실행을 수행하기 위해 소비하는 리소스를 이해하는 데 도움을 주는 다양한 툴이 있습니다.

이 섹션에서는 이러한 도구와 사용하는 방법을 살펴보겠습니다.

## 일반적인 고려사항 {#general-considerations}

쿼리 성능을 이해하기 위해 ClickHouse에서 쿼리가 실행될 때 어떤 일이 발생하는지 살펴보겠습니다.

다음 내용은 의도적으로 단순화되어 있으며 몇 가지 단축키를 사용합니다; 여기에서의 목표는 세부 사항으로 당신을 압도하는 것이 아니라 기본 개념을 빠르게 이해하는 것입니다. 더 많은 정보는 [쿼리 분석기](/operations/analyzer)에서 읽을 수 있습니다.

매우 높은 수준에서 ClickHouse가 쿼리를 실행할 때 발생하는 일은 다음과 같습니다:

- **쿼리 파싱 및 분석**

쿼리가 파싱되고 분석되며 일반적인 쿼리 실행 계획이 생성됩니다.

- **쿼리 최적화**

쿼리 실행 계획이 최적화되고, 불필요한 데이터가 제거되며, 쿼리 계획으로부터 쿼리 파이프라인이 구축됩니다.

- **쿼리 파이프라인 실행**

데이터가 병렬로 읽히고 처리됩니다. 이 단계에서 ClickHouse는 필터링, 집계 및 정렬과 같은 쿼리 작업을 실제로 실행합니다.

- **최종 처리**

결과가 병합되고 정렬되며 클라이언트에 전송되기 전에 최종 결과로 형식화됩니다.

실제로 많은 [최적화](/concepts/why-clickhouse-is-so-fast)가 진행되고 있으며, 이 가이드에서 조금 더 논의하겠지만, 현재로서는 이러한 주요 개념이 ClickHouse가 쿼리를 실행할 때의 배경을 이해하는 데 도움이 됩니다.

이러한 높은 수준의 이해를 바탕으로 ClickHouse가 제공하는 도구와 그것을 사용하여 쿼리 성능에 영향을 미치는 메트릭을 추적하는 방법을 살펴보겠습니다.

## 데이터셋 {#dataset}

쿼리 성능에 접근하는 방법을 설명하기 위해 실제 예제를 사용하겠습니다.

NYC의 택시 승차 데이터를 포함하는 NYC Taxi 데이터셋을 사용하겠습니다. 먼저 최적화 없이 NYC 택시 데이터셋을 수집합니다.

다음은 테이블을 생성하고 S3 버킷에서 데이터를 삽입하는 명령어입니다. 데이터를 기반으로 스키마를 자발적으로 추론한다고 가정합니다.

```sql
-- Create table with inferred schema
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Insert data into table with inferred schema
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

데이터에서 자동으로 추론된 테이블 스키마를 살펴보겠습니다.

```sql
--- Display inferred table schema
SHOW CREATE TABLE trips_small_inferred

Query id: d97361fd-c050-478e-b831-369469f0784d

CREATE TABLE nyc_taxi.trips_small_inferred
(
    `vendor_id` Nullable(String),
    `pickup_datetime` Nullable(DateTime64(6, 'UTC')),
    `dropoff_datetime` Nullable(DateTime64(6, 'UTC')),
    `passenger_count` Nullable(Int64),
    `trip_distance` Nullable(Float64),
    `ratecode_id` Nullable(String),
    `pickup_location_id` Nullable(String),
    `dropoff_location_id` Nullable(String),
    `payment_type` Nullable(Int64),
    `fare_amount` Nullable(Float64),
    `extra` Nullable(Float64),
    `mta_tax` Nullable(Float64),
    `tip_amount` Nullable(Float64),
    `tolls_amount` Nullable(Float64),
    `total_amount` Nullable(Float64)
)
ORDER BY tuple()
```

## 느린 쿼리 찾기 {#spot-the-slow-queries}

### 쿼리 로그 {#query-logs}

기본적으로 ClickHouse는 [쿼리 로그](/operations/system-tables/query_log)에서 실행된 각 쿼리에 관한 정보를 수집하고 기록합니다. 이 데이터는 `system.query_log` 테이블에 저장됩니다.

실행된 각 쿼리에 대해 ClickHouse는 쿼리 실행 시간, 읽은 행 수 및 CPU, 메모리 사용량 또는 파일 시스템 캐시 적중률과 같은 리소스 사용량과 같은 통계를 기록합니다.

따라서 쿼리 로그는 느린 쿼리를 조사할 때 시작하기 좋은 장소입니다. 실행하는 데 오래 걸리는 쿼리를 쉽게 찾고 각 쿼리에 대한 리소스 사용 정보도 표시할 수 있습니다.

NYC 택시 데이터셋에서 실행 시간이 긴 쿼리 상위를 찾아봅시다.

```sql
-- Find top 5 long running queries from nyc_taxi database in the last 1 hour
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (event_time >= (now() - toIntervalMinute(60))) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL

Query id: e3d48c9f-32bb-49a4-8303-080f59ed1835

Row 1:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:36
query_duration_ms: 2967
query:             WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 2:
──────
type:              QueryFinish
event_time:        2024-11-27 11:11:33
query_duration_ms: 2026
query:             SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM
    nyc_taxi.trips_small_inferred
WHERE
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY
    payment_type
ORDER BY
    trip_count DESC;

read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 3:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:17
query_duration_ms: 1860
query:             SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 4:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:31
query_duration_ms: 690
query:             SELECT avg(total_amount) FROM nyc_taxi.trips_small_inferred WHERE trip_distance > 5
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 5:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:44
query_duration_ms: 634
query:             SELECT
vendor_id,
avg(total_amount),
avg(trip_distance),
FROM
nyc_taxi.trips_small_inferred
GROUP BY vendor_id
ORDER BY 1 DESC
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']
```

`query_duration_ms` 필드는 해당 쿼리가 실행되는 데 걸린 시간을 나타냅니다. 쿼리 로그의 결과를 살펴보면 첫 번째 쿼리가 2967ms 걸린 것을 알 수 있으며, 이는 개선할 수 있습니다.

시스템에 가장 큰 메모리 또는 CPU를 소비하는 쿼리를 검사하여 어떤 쿼리가 시스템에 스트레스를 가하는지 알아보는 것도 좋습니다.

```sql
-- Top queries by memory usage
SELECT
    type,
    event_time,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    (ProfileEvents['CachedReadBufferReadFromCacheMicroseconds']) / 1000000 AS FromCacheSeconds,
    (ProfileEvents['CachedReadBufferReadFromSourceMicroseconds']) / 1000000 AS FromSourceSeconds,
    normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (type='QueryFinish') AND ((event_time >= (now() - toIntervalDay(2))) AND (event_time <= now())) AND (user NOT ILIKE '%internal%')
ORDER BY memory_usage DESC
LIMIT 30
```

찾은 느린 쿼리를 분리하고 반응 시간을 이해하기 위해 몇 번 다시 실행해 보겠습니다.

이 시점에서, 재현성을 높이기 위해 `enable_filesystem_cache` 설정을 0으로 설정하여 파일 시스템 캐시를 끄는 것이 중요합니다.

```sql
-- Disable filesystem cache
set enable_filesystem_cache = 0;

-- Run query 1
WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON

----
1 row in set. Elapsed: 1.699 sec. Processed 329.04 million rows, 8.88 GB (193.72 million rows/s., 5.23 GB/s.)
Peak memory usage: 440.24 MiB.

-- Run query 2
SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM
    nyc_taxi.trips_small_inferred
WHERE
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY
    payment_type
ORDER BY
    trip_count DESC;

---
4 rows in set. Elapsed: 1.419 sec. Processed 329.04 million rows, 5.72 GB (231.86 million rows/s., 4.03 GB/s.)
Peak memory usage: 546.75 MiB.

-- Run query 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

쉽게 읽을 수 있도록 표로 요약합니다.

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

쿼리의 성과를 좀 더 잘 이해해 보겠습니다.

-   쿼리 1은 시속 30마일 이상의 평균 속도로 승차 거리 분포를 계산합니다.
-   쿼리 2는 주별 승차 수와 평균 비용을 찾습니다.
-   쿼리 3은 데이터셋의 각 여행의 평균 시간을 계산합니다.

이 쿼리들은 복잡한 처리를 수행하지 않지만, 첫 번째 쿼리는 쿼리가 실행될 때마다 즉시 여행 시간을 계산합니다. 그러나 이러한 각 쿼리는 ClickHouse 세계에서 아주 긴 시간인 1초 이상 걸립니다. 또한 각 쿼리는 동일한 수의 행(즉, 329.04 백만)을 읽는 것으로 보입니다. 이 테이블에 몇 개의 행이 있는지 신속하게 확인해 보겠습니다.

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

테이블에는 329.04 백만 행이 있으며, 따라서 각 쿼리는 테이블의 전체 스캔을 수행하고 있습니다.

### Explain 문 {#explain-statement}

이제 느린 쿼리를 몇 개 가지고 있으니, 이들이 어떻게 실행되는지 이해해 보겠습니다. 이를 위해 ClickHouse는 [EXPLAIN 문 명령어](/sql-reference/statements/explain)를 지원합니다. 이는 쿼리 실행 단계를 실제로 실행하지 않고도 매우 상세한 뷰를 제공하는 유용한 도구입니다. ClickHouse 전문가가 아닌 사람에게는 다소 압도적일 수 있지만, 쿼리가 어떻게 실행되는지 통찰을 얻는 데 필수적인 도구입니다.

문서는 EXPLAIN 문에 대한 자세한 [가이드](/guides/developer/understanding-query-execution-with-the-analyzer)를 제공하고 쿼리 실행을 분석하는 방법을 설명합니다. 이 가이드에서 중복되는 내용을 반복하기보다는, 쿼리 실행 성능에서 병목 현상을 찾는 데 도움이 되는 몇 가지 명령에 집중하겠습니다.

**Explain indexes = 1**

쿼리 계획을 확인하기 위해 EXPLAIN indexes = 1로 시작해 보겠습니다. 쿼리 계획은 쿼리가 실행되는 방식을 보여주는 트리입니다. 이곳에서는 쿼리의 절차가 어떤 순서로 실행될 것인지 볼 수 있습니다. EXPLAIN 문에 의해 반환된 쿼리 계획은 아래에서 위로 읽을 수 있습니다.

우리의 느린 쿼리 중 하나를 사용해 보겠습니다.

```sql
EXPLAIN indexes = 1
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: f35c412a-edda-4089-914b-fa1622d69868

   ┌─explain─────────────────────────────────────────────┐
1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │     Expression (Before GROUP BY)                    │
4. │       Filter (WHERE)                                │
5. │         ReadFromMergeTree (nyc_taxi.trips_small_inferred) │
   └─────────────────────────────────────────────────────┘
```

출력은 명확합니다. 쿼리는 `nyc_taxi.trips_small_inferred` 테이블에서 데이터를 읽는 것으로 시작합니다. 그런 다음 WHERE 절이 적용되어 계산된 값을 기반으로 행이 필터링됩니다. 필터링된 데이터는 집계를 위해 준비되며, 분위수가 계산됩니다. 마지막으로 결과가 정렬되어 출력됩니다.

여기에서 기본 키가 사용되지 않았음에 주목할 수 있습니다. 이는 우리가 테이블을 생성할 때 기본 키를 정의하지 않았기 때문에 의미가 있습니다. 결과적으로 ClickHouse는 쿼리를 위해 테이블의 전체 스캔을 수행하고 있습니다.

**Explain Pipeline**

EXPLAIN Pipeline은 쿼리에 대한 구체적인 실행 전략을 보여줍니다. 여기에서 ClickHouse가 실제로 이전에 살펴본 일반 쿼리 계획을 어떻게 실행했는지 볼 수 있습니다.

```sql
EXPLAIN PIPELINE
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: c7e11e7b-d970-4e35-936c-ecfc24e3b879

    ┌─explain─────────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                        │
 2. │ ExpressionTransform × 59                                                            │
 3. │   (Aggregating)                                                                     │
 4. │   Resize 59 → 59                                                                    │
 5. │     AggregatingTransform × 59                                                       │
 6. │       StrictResize 59 → 59                                                          │
 7. │         (Expression)                                                                │
 8. │         ExpressionTransform × 59                                                    │
 9. │           (Filter)                                                                  │
10. │           FilterTransform × 59                                                      │
11. │             (ReadFromMergeTree)                                                     │
12. │             MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
```

여기에서 쿼리를 실행하는 데 사용된 스레드 수에 유의할 수 있습니다: 59개의 스레드. 이는 높은 병렬성을 나타냅니다. 이는 작은 머신에서 실행하는 것보다 쿼리가 더 빠르게 실행되도록 합니다. 병렬로 실행되는 스레드 수는 쿼리가 사용하는 높은 메모리 양을 설명할 수 있습니다.

이론적으로 느린 쿼리는 모두 똑같은 방법으로 조사하여 불필요한 복잡한 쿼리 계획을 식별하고 각 쿼리가 읽는 행 수와 소비되는 리소스를 이해하는 것이 중요합니다.

## 방법론 {#methodology}

프로덕션 배포에서 문제가 있는 쿼리를 식별하는 것은 어렵습니다. 왜냐하면 ClickHouse 배포에서 언제든지 많은 수의 쿼리가 실행되고 있을 가능성이 높기 때문입니다.

어떤 사용자, 데이터베이스 또는 테이블에 문제가 있는지 알고 있다면 `system.query_logs`에서 `user`, `tables` 또는 `databases` 필드를 사용하여 검색 범위를 좁힐 수 있습니다.

최적화하고 싶은 쿼리를 식별하면 이를 최적화하기 시작할 수 있습니다. 이 단계에서 개발자들이 흔히 저지르는 실수는 동시에 여러 가지를 변경하고 즉흥 실험을 시도하여 대개 엇갈리는 결과를 얻고, 더 중요한 것은 쿼리를 더 빠르게 만든 요소에 대한 올바른 이해를 놓치는 것입니다.

쿼리 최적화는 구조가 필요합니다. 저는 고급 벤치마킹에 대해 이야기하는 것이 아니라, 변경 사항이 쿼리 성능에 어떻게 영향을 미치는지 이해하기 위한 간단한 프로세스를 마련하는 것이라는 것을 의미합니다.

쿼리 로그에서 느린 쿼리를 식별한 다음, 격리된 상태에서 잠재적인 개선 사항을 조사해 보십시오. 쿼리를 테스트할 때는 파일 시스템 캐시를 비활성화해야 합니다.

> ClickHouse는 [캐싱](/operations/caches)을 활용하여 쿼리 성능을 다양한 단계에서 향상시킵니다. 이는 쿼리 성능에 좋지만, 문제 해결 중에는 발생할 수 있는 I/O 병목 현상이나 불량 테이블 스키마를 숨길 수 있습니다. 그러므로 테스트 중에는 파일 시스템 캐시를 끄기를 권장합니다. 운영 환경에서는 이를 활성화해야 합니다.

잠재적인 최적화를 식별한 후에는 성능에 미치는 영향을 더 잘 추적하기 위해 하나씩 구현하는 것이 좋습니다. 아래는 일반적인 접근 방식을 설명하는 다이어그램입니다.

<Image img={queryOptimizationDiagram1} size="lg" alt="최적화 워크플로우"/>

_마지막으로, 특이값에 주의하십시오. 사용자가 즉흥적으로 비싼 쿼리를 시도했거나 시스템이 다른 이유로 압박을 받고 있던 경우 쿼리가 느리게 실행되는 것은 매우 일반적입니다. 정규화된 쿼리 해시 필드로 그룹화하여 정기적으로 실행되는 비싼 쿼리를 식별할 수 있습니다. 이러한 쿼리가 아마도 조사할 필요가 있는 쿼리일 것입니다._

## 기본 최적화 {#basic-optimization}

이제 테스트하기 위한 프레임워크가 있으므로 최적화를 시작할 수 있습니다.

시작하기 가장 좋은 것은 데이터가 어떻게 저장되는지를 살펴보는 것입니다. 모든 데이터베이스와 마찬가지로 읽는 데이터가 적을수록 쿼리가 더 빠르게 실행됩니다.

데이터를 수집한 방법에 따라 ClickHouse의 [기능](/interfaces/schema-inference)을 활용하여 수집한 데이터를 기반으로 테이블 스키마를 추론했을 수 있습니다. 이를 통해 시작하는 데 매우 유용하지만, 쿼리 성능을 최적화하려면 데이터 스키마를 검토하여 사용 사례에 가장 올바르게 맞춰야 합니다.

### Nullable {#nullable}

[모범 사례 문서](/best-practices/select-data-types#avoid-nullable-columns)에서 설명한 대로, 가능한 한 nullable 컬럼을 피하십시오. 이는 데이터 수집 메커니즘을 더 유연하게 만들어 줘서 자주 사용하기 유혹을 주지만, 매번 추가 컬럼을 처리해야 하므로 성능에 부정적인 영향을 미칩니다.

NULL 값을 가진 행을 계산하는 SQL 쿼리를 실행하면 실제로 Nullable 값이 필요한 테이블의 컬럼을 쉽게 드러낼 수 있습니다.

```sql
-- Find non-null values columns
SELECT
    countIf(vendor_id IS NULL) AS vendor_id_nulls,
    countIf(pickup_datetime IS NULL) AS pickup_datetime_nulls,
    countIf(dropoff_datetime IS NULL) AS dropoff_datetime_nulls,
    countIf(passenger_count IS NULL) AS passenger_count_nulls,
    countIf(trip_distance IS NULL) AS trip_distance_nulls,
    countIf(fare_amount IS NULL) AS fare_amount_nulls,
    countIf(mta_tax IS NULL) AS mta_tax_nulls,
    countIf(tip_amount IS NULL) AS tip_amount_nulls,
    countIf(tolls_amount IS NULL) AS tolls_amount_nulls,
    countIf(total_amount IS NULL) AS total_amount_nulls,
    countIf(payment_type IS NULL) AS payment_type_nulls,
    countIf(pickup_location_id IS NULL) AS pickup_location_id_nulls,
    countIf(dropoff_location_id IS NULL) AS dropoff_location_id_nulls
FROM trips_small_inferred
FORMAT VERTICAL

Query id: 4a70fc5b-2501-41c8-813c-45ce241d85ae

Row 1:
──────
vendor_id_nulls:           0
pickup_datetime_nulls:     0
dropoff_datetime_nulls:    0
passenger_count_nulls:     0
trip_distance_nulls:       0
fare_amount_nulls:         0
mta_tax_nulls:             137946731
tip_amount_nulls:          0
tolls_amount_nulls:        0
total_amount_nulls:        0
payment_type_nulls:        69305
pickup_location_id_nulls:  0
dropoff_location_id_nulls: 0
```

NULL 값을 가진 두 개의 컬럼만 있습니다: `mta_tax` 및 `payment_type`. 나머지 필드는 `Nullable` 컬럼을 사용해서는 안 됩니다.

### 낮은 기준값 {#low-cardinality}

문자열에 적용할 수 있는 쉬운 최적화 방법은 LowCardinality 데이터 유형을 최대한 활용하는 것입니다. 낮은 기준값 [문서](/sql-reference/data-types/lowcardinality)에서 설명된 대로, ClickHouse는 LowCardinality-컬럼에 딕셔너리 코딩을 적용하여 쿼리 성능을 크게 향상시킵니다.

10,000개의 고유 값보다 적은 모든 컬럼은 LowCardinality의 완벽한 후보입니다.

고유 값 수가 적은 컬럼을 찾기 위해 다음 SQL 쿼리를 사용할 수 있습니다.

```sql
-- Identify low cardinality columns
SELECT
    uniq(ratecode_id),
    uniq(pickup_location_id),
    uniq(dropoff_location_id),
    uniq(vendor_id)
FROM trips_small_inferred
FORMAT VERTICAL

Query id: d502c6a1-c9bc-4415-9d86-5de74dd6d932

Row 1:
──────
uniq(ratecode_id):         6
uniq(pickup_location_id):  260
uniq(dropoff_location_id): 260
uniq(vendor_id):           3
```

기준값이 낮은 이 네 개의 컬럼인 `ratecode_id`, `pickup_location_id`, `dropoff_location_id`, `vendor_id`는 LowCardinality 필드 유형의 좋은 후보입니다.

### 데이터 유형 최적화 {#optimize-data-type}

ClickHouse는 많은 수의 데이터 유형을 지원합니다. 성능을 최적화하고 디스크에서 데이터 저장 공간을 줄이기 위해 사용 사례에 맞는 가장 작은 데이터 유형을 선택해야 합니다.

숫자의 경우, 데이터셋에서 최소/최대 값을 확인하여 현재 정밀도 값이 데이터셋의 현실과 일치하는지 확인할 수 있습니다.

```sql
-- Find min/max values for the payment_type field
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

날짜의 경우, 데이터셋에 맞고 실행할 계획인 쿼리에 가장 적합한 정밀도를 선택해야 합니다.

### 최적화 적용 {#apply-the-optimizations}

최적화된 스키마를 사용하기 위해 새 테이블을 만들고 데이터를 다시 수집합시다.

```sql
-- Create table with optimized data
CREATE TABLE trips_small_no_pk
(
    `vendor_id` LowCardinality(String),
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` LowCardinality(String),
    `dropoff_location_id` LowCardinality(String),
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
ORDER BY tuple();

-- Insert the data
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

새 테이블을 사용하여 다시 쿼리를 실행하여 개선 사항을 확인합니다.

| Name    | Run 1 - Elapsed | Elapsed   | Rows processed | Peak memory |
| ------- | --------------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

쿼리 시간과 메모리 사용량이 개선된 것을 확인했습니다. 데이터 스키마의 최적화 덕분에 데이터의 총량을 줄여 메모리 소비가 개선되고 처리 시간이 단축되었습니다.

테이블 크기를 확인하여 차이를 살펴보겠습니다.

```sql
SELECT
    `table`,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    sum(rows) AS rows
FROM system.parts
WHERE (active = 1) AND ((`table` = 'trips_small_no_pk') OR (`table` = 'trips_small_inferred'))
GROUP BY
    database,
    `table`
ORDER BY size DESC

Query id: 72b5eb1c-ff33-4fdb-9d29-dd076ac6f532

   ┌─table────────────────┬─compressed─┬─uncompressed─┬──────rows─┐
1. │ trips_small_inferred │ 7.38 GiB   │ 37.41 GiB    │ 329044175 │
2. │ trips_small_no_pk    │ 4.89 GiB   │ 15.31 GiB    │ 329044175 │
   └──────────────────────┴────────────┴──────────────┴───────────┘
```

새 테이블은 이전 테이블보다 상당히 작습니다. 테이블의 디스크 공간이 약 34% 감소했습니다 (7.38 GiB 대비 4.89 GiB).

## 기본 키의 중요성 {#the-importance-of-primary-keys}

ClickHouse의 기본 키는 대부분의 전통적인 데이터베이스 시스템에서와는 다르게 작동합니다. 그러한 시스템에서 기본 키는 고유성과 데이터 무결성을 강제합니다. 중복 기본 키 값을 삽입하려는 모든 시도는 거부되며, 일반적으로 빠른 검색을 위한 B-tree 또는 해시 기반 인덱스가 생성됩니다.

ClickHouse에서 기본 키의 [목적](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)은 다릅니다; 고유성을 강제하거나 데이터 무결성에 도움을 주기 위한 것이 아닙니다. 대신 쿼리 성능을 최적화하는 데 설계되었습니다. 기본 키는 데이터가 디스크에 저장되는 순서를 정의하며, 각 그라뉼의 첫 번째 행에 대한 포인터를 저장하는 스파스 인덱스로 구현됩니다.

> ClickHouse의 그라뉼은 쿼리 실행 중 읽어 들이는 가장 작은 데이터 단위입니다. 이들은 최대 고정 수의 행을 포함하며, index_granularity에 의해 결정되며, 기본값은 8192행입니다. 그라뉼은 연속적으로 저장되고 기본 키에 의해 정렬됩니다.

좋은 기본 키 세트를 선택하는 것은 성능에 중요하며, 실제로 특정 쿼리 집합을 빠르게 하기 위해 동일한 데이터를 서로 다른 테이블에 저장하고 서로 다른 기본 키 세트를 사용하는 것이 일반적입니다.

ClickHouse에서 지원하는 다른 옵션들인 Projection 또는 Materialized view를 사용하면 동일한 데이터에 대해 다른 기본 키 세트를 사용할 수 있습니다. 이 블로그 시리즈의 두 번째 부분에서는 이에 대해 더 자세히 다룰 것입니다.

### 기본 키 선택 {#choose-primary-keys}

올바른 기본 키 세트를 선택하는 것은 복잡한 주제이며 최상의 조합을 찾으려면 거래와 실험이 필요할 수 있습니다.

현재로서는 이러한 간단한 관행을 따르겠습니다:

-   대부분의 쿼리에서 필터링에 사용되는 필드를 사용하십시오.
-   우선 낮은 기준값을 가진 컬럼을 선택하십시오.
-   기본 키에 시간 기반 요소를 고려하십시오. 타임스탬프 데이터셋에서 시간으로 필터링하는 것이 매우 일반적입니다.

우리의 경우, `passenger_count`, `pickup_datetime`, `dropoff_datetime`라는 기본 키로 실험할 것입니다.

passenger_count의 기준값은 작고 (24개의 고유 값) 느린 쿼리에서 사용됩니다. 타임스탬프 필드(`pickup_datetime` 및 `dropoff_datetime`)를 추가하여 자주 필터링할 수 있도록 합니다.

기본 키로 새 테이블을 만들고 데이터를 다시 수집합니다.

```sql
CREATE TABLE trips_small_pk
(
    `vendor_id` UInt8,
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` UInt16,
    `dropoff_location_id` UInt16,
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
PRIMARY KEY (passenger_count, pickup_datetime, dropoff_datetime);

-- Insert the data
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

그런 다음 쿼리를 다시 실행합니다. 세 번의 실험에서 경과 시간, 처리된 행 수 및 메모리 소비에 대한 개선 사항을 정리합니다.

<table>
  <thead>
    <tr>
      <th colspan="4">쿼리 1</th>
    </tr>
    <tr>
      <th></th>
      <th>실행 1</th>
      <th>실행 2</th>
      <th>실행 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>경과 시간</td>
      <td>1.699 sec</td>
      <td>1.353 sec</td>
      <td>0.765 sec</td>
    </tr>
    <tr>
      <td>처리된 행 수</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
    </tr>
    <tr>
      <td>최대 메모리</td>
      <td>440.24 MiB</td>
      <td>337.12 MiB</td>
      <td>444.19 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">쿼리 2</th>
    </tr>
    <tr>
      <th></th>
      <th>실행 1</th>
      <th>실행 2</th>
      <th>실행 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>경과 시간</td>
      <td>1.419 sec</td>
      <td>1.171 sec</td>
      <td>0.248 sec</td>
    </tr>
    <tr>
      <td>처리된 행 수</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>41.46 million</td>
    </tr>
    <tr>
      <td>최대 메모리</td>
      <td>546.75 MiB</td>
      <td>531.09 MiB</td>
      <td>173.50 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">쿼리 3</th>
    </tr>
    <tr>
      <th></th>
      <th>실행 1</th>
      <th>실행 2</th>
      <th>실행 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>경과 시간</td>
      <td>1.414 sec</td>
      <td>1.188 sec</td>
      <td>0.431 sec</td>
    </tr>
    <tr>
      <td>처리된 행 수</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>276.99 million</td>
    </tr>
    <tr>
      <td>최대 메모리</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

수행 시간과 사용된 메모리 모두에서 상당한 개선을 볼 수 있습니다.

쿼리 2는 기본 키의 도움을 가장 많이 받습니다. 이전과 쿼리 계획이 어떻게 다른지 살펴보겠습니다.

```sql
EXPLAIN indexes = 1
SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM nyc_taxi.trips_small_pk
WHERE (pickup_datetime >= '2009-01-01') AND (pickup_datetime < '2009-04-01')
GROUP BY payment_type
ORDER BY trip_count DESC

Query id: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY [lifted up part]))                                                     │
 2. │   Sorting (Sorting for ORDER BY)                                                                                 │
 3. │     Expression (Before ORDER BY)                                                                                 │
 4. │       Aggregating                                                                                                │
 5. │         Expression (Before GROUP BY)                                                                             │
 6. │           Expression                                                                                             │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             Indexes:                                                                                             │
 9. │               PrimaryKey                                                                                         │
10. │                 Keys:                                                                                            │
11. │                   pickup_datetime                                                                                │
12. │                 Condition: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf))) │
13. │                 Parts: 9/9                                                                                       │
14. │                 Granules: 5061/40167                                                                             │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

기본 키 덕분에 테이블 그라뉼의 일부만 선택되었습니다. 이것만으로도 ClickHouse가 처리해야 할 데이터가 상당히 줄어들기 때문에 쿼리 성능이 크게 향상됩니다.

## 다음 단계 {#next-steps}

이 가이드를 통해 ClickHouse에서 느린 쿼리를 조사하고 이를 더 빠르게 만드는 방법에 대한 좋은 이해를 얻으셨길 바랍니다. 이 주제에 대해 더 알고 싶다면 [쿼리 분석기](/operations/analyzer) 및 [profiling](/operations/optimizing-performance/sampling-query-profiler)에 대해 읽어보아 ClickHouse가 쿼리를 실행하는 방식을 더 잘 이해할 수 있습니다.

ClickHouse의 특성을 더 많이 알게 되면, [파티션 키](/optimize/partitioning-key) 및 [데이터 스킵 인덱스](/optimize/skipping-indexes)에 대해 읽어보아 쿼리를 가속화하는 데 사용할 수 있는 더 고급 기술을 배워보는 것을 권장합니다.
