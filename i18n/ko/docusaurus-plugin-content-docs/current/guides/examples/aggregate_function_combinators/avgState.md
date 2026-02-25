---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'avgState combinator 사용 예제'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
doc_type: 'reference'
---

# avgState \{#avgState\}

## Description \{#description\}

[`State`](/sql-reference/aggregate-functions/combinators#-state) 결합자(combinator)는 
[`avg`](/sql-reference/aggregate-functions/reference/avg) 
함수에 적용하여 `AggregateFunction(avg, T)` 타입의 중간 상태를 생성하며,
여기서 `T`는 평균에 대해 지정한 타입입니다.

## 사용 예제 \{#example-usage\}

이 예제에서는 `AggregateFunction` 타입을 `avgState` 함수와 함께 사용하여 웹사이트 트래픽 데이터를 집계하는 방법을 살펴봅니다.

먼저 웹사이트 트래픽 데이터를 위한 소스 테이블을 생성하세요:

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Page response time in milliseconds
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

평균 응답 시간을 저장할 집계 테이블을 생성하세요. `avg`는 복잡한 상태(합계와 개수)가 필요하므로 `SimpleAggregateFunction` 타입을 사용할 수 없습니다. 따라서 `AggregateFunction` 타입을 사용합니다:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Stores the state needed for avg calculation
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

새로운 데이터에 대한 삽입 트리거로 작동하며 위에서 정의한 대상 테이블에 중간 상태 데이터를 저장하는 증분형 materialized view를 생성하세요:

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- Using -State combinator
FROM raw_page_views
GROUP BY page_id, page_name;
```

소스 테이블에 초기 데이터를 삽입하여 디스크에 파트를 생성하세요:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

디스크에 두 번째 파트를 생성하기 위해 데이터를 추가로 삽입하세요:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

대상 테이블 `page_performance`를 확인하세요:

```sql
SELECT 
    page_id,
    page_name,
    avg_response_time,
    toTypeName(avg_response_time)
FROM page_performance
```

```response
┌─page_id─┬─page_name─┬─avg_response_time─┬─toTypeName(avg_response_time)──┐
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ �                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ �                 │ AggregateFunction(avg, UInt32) │
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ n                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ F                 │ AggregateFunction(avg, UInt32) │
│       4 │ Contact   │ }                 │ AggregateFunction(avg, UInt32) │
└─────────┴───────────┴───────────────────┴────────────────────────────────┘
```

`avg_response_time` 컬럼이 `AggregateFunction(avg, UInt32)` 타입이며
중간 상태 정보를 저장한다는 점을 확인하십시오. 또한 `avg_response_time`의
행 데이터는 유용하지 않으며 `�, n, F, }`와 같은 이상한 텍스트 문자가
표시됩니다. 이는 터미널이 바이너리 데이터를 텍스트로 표시하려고 시도하기
때문입니다. `AggregateFunction` 타입은 효율적인 저장 및 계산을 위해
최적화된 바이너리 형식으로 상태를 저장하며, 사람이 읽을 수 있도록 설계되지
않았습니다. 이 바이너리 상태에는 평균을 계산하는 데 필요한 모든 정보가
포함되어 있습니다.

이를 활용하려면 `Merge` 결합자를 사용하세요:

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

이제 올바른 평균값이 표시됩니다:

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 함께 보기 \{#see-also\}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)