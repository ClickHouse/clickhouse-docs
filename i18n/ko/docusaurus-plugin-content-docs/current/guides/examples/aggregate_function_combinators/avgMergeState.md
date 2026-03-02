---
slug: '/examples/aggregate-function-combinators/avgMergeState'
title: 'avgMergeState'
description: 'avgMergeState 조합자(combinator)를 사용하는 예제'
keywords: ['avg', 'MergeState', 'combinator', 'examples', 'avgMergeState']
sidebar_label: 'avgMergeState'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# avgMergeState \{#avgMergeState\}



## 설명 \{#description\}

[`MergeState`](/sql-reference/aggregate-functions/combinators#-state) 조합자는
[`avg`](/sql-reference/aggregate-functions/reference/avg)
함수에 적용해 `AverageFunction(avg, T)` 타입의 부분 집계 상태를 병합하고
새로운 중간 집계 상태를 반환합니다.



## 사용 예시 \{#example-usage\}

`MergeState` 조합기는 다단계 집계 시나리오에서 특히 유용합니다. 사전 집계된 상태를 결합하고, 이후 처리를 위해 이를 (최종 결과로 확정하지 않고) 상태로 유지해야 할 때 적합합니다. 이를 설명하기 위해, 개별 서버 성능 메트릭을 여러 수준에 걸친 계층적 집계로 변환하는 예시를 살펴보겠습니다: 서버 수준 → 리전 수준 → 데이터센터 수준.

먼저 원시 데이터를 저장할 테이블을 생성합니다:

```sql
CREATE TABLE raw_server_metrics
(
    timestamp DateTime DEFAULT now(),
    server_id UInt32,
    region String,
    datacenter String,
    response_time_ms UInt32
)
ENGINE = MergeTree()
ORDER BY (region, server_id, timestamp);
```

서버 수준 집계 대상 테이블을 생성하고, 해당 테이블에 대한 INSERT 시 트리거처럼 동작하는 증분 materialized view를 정의합니다:

```sql
CREATE TABLE server_performance
(
    server_id UInt32,
    region String,
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (region, server_id);

CREATE MATERIALIZED VIEW server_performance_mv
TO server_performance
AS SELECT
    server_id,
    region,
    datacenter,
    avgState(response_time_ms) AS avg_response_time
FROM raw_server_metrics
GROUP BY server_id, region, datacenter;
```

지역 및 데이터 센터 수준에 대해서도 동일한 작업을 수행합니다:

```sql
CREATE TABLE region_performance
(
    region String,
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (datacenter, region);

CREATE MATERIALIZED VIEW region_performance_mv
TO region_performance
AS SELECT
    region,
    datacenter,
    avgMergeState(avg_response_time) AS avg_response_time
FROM server_performance
GROUP BY region, datacenter;

-- datacenter level table and materialized view

CREATE TABLE datacenter_performance
(
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY datacenter;

CREATE MATERIALIZED VIEW datacenter_performance_mv
TO datacenter_performance
AS SELECT
      datacenter,
      avgMergeState(avg_response_time) AS avg_response_time
FROM region_performance
GROUP BY datacenter;
```

이제 소스 테이블에 샘플 원시 데이터를 삽입합니다.

```sql
INSERT INTO raw_server_metrics (timestamp, server_id, region, datacenter, response_time_ms) VALUES
    (now(), 101, 'us-east', 'dc1', 120),
    (now(), 101, 'us-east', 'dc1', 130),
    (now(), 102, 'us-east', 'dc1', 115),
    (now(), 201, 'us-west', 'dc1', 95),
    (now(), 202, 'us-west', 'dc1', 105),
    (now(), 301, 'eu-central', 'dc2', 145),
    (now(), 302, 'eu-central', 'dc2', 155);
```

각 레벨에 대해 세 개의 쿼리를 작성합니다.


<Tabs>
  <TabItem value="Service level" label="서비스 수준" default>
    ```sql
    SELECT
        server_id,
        region,
        avgMerge(avg_response_time) AS avg_response_ms
    FROM server_performance
    GROUP BY server_id, region
    ORDER BY region, server_id;
    ```

    ```response
    ┌─server_id─┬─region─────┬─avg_response_ms─┐
    │       301 │ eu-central │             145 │
    │       302 │ eu-central │             155 │
    │       101 │ us-east    │             125 │
    │       102 │ us-east    │             115 │
    │       201 │ us-west    │              95 │
    │       202 │ us-west    │             105 │
    └───────────┴────────────┴─────────────────┘
    ```
  </TabItem>

  <TabItem value="Regional level" label="지역 수준">
    ```sql
    SELECT
        region,
        datacenter,
        avgMerge(avg_response_time) AS avg_response_ms
    FROM region_performance
    GROUP BY region, datacenter
    ORDER BY datacenter, region;
    ```

    ```response
    ┌─region─────┬─datacenter─┬────avg_response_ms─┐
    │ us-east    │ dc1        │ 121.66666666666667 │
    │ us-west    │ dc1        │                100 │
    │ eu-central │ dc2        │                150 │
    └────────────┴────────────┴────────────────────┘
    ```
  </TabItem>

  <TabItem value="Datacenter level" label="데이터센터 수준">
    ```sql
    SELECT
        datacenter,
        avgMerge(avg_response_time) AS avg_response_ms
    FROM datacenter_performance
    GROUP BY datacenter
    ORDER BY datacenter;
    ```

    ```response
    ┌─datacenter─┬─avg_response_ms─┐
    │ dc1        │             113 │
    │ dc2        │             150 │
    └────────────┴─────────────────┘
    ```
  </TabItem>
</Tabs>

더 많은 데이터를 삽입해 보겠습니다:

```sql
INSERT INTO raw_server_metrics (timestamp, server_id, region, datacenter, response_time_ms) VALUES
    (now(), 101, 'us-east', 'dc1', 140),
    (now(), 201, 'us-west', 'dc1', 85),
    (now(), 301, 'eu-central', 'dc2', 135);
```

데이터센터 수준의 성능을 다시 한 번 확인해 보겠습니다. 전체
집계 체인이 자동으로 업데이트된 점에 주목하십시오.

```sql
SELECT
    datacenter,
    avgMerge(avg_response_time) AS avg_response_ms
FROM datacenter_performance
GROUP BY datacenter
ORDER BY datacenter;
```

```response
┌─datacenter─┬────avg_response_ms─┐
│ dc1        │ 112.85714285714286 │
│ dc2        │                145 │
└────────────┴────────────────────┘
```


## 참고 \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
