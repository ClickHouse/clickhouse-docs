---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'sumSimpleState 결합자 사용 예제'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---

# sumSimpleState \{#sumsimplestate\}

## 설명 \{#description\}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 결합자는 모든 입력 값의 합계를 계산하도록 [`sum`](/sql-reference/aggregate-functions/reference/sum)
함수에 적용할 수 있습니다. 결과는 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction)
데이터 타입으로 반환됩니다.

## 사용 예 \{#example-usage\}

### 추천 및 비추천 추적 \{#tracking-post-votes\}

게시물에 대한 투표를 추적하는 테이블을 사용하는 실제 예제를 살펴보겠습니다.
각 게시물마다 추천 수, 비추천 수, 전체 점수의 누적 합계를 유지하려고 합니다.
이런 사용 사례에서는 집계의 전체 상태를 저장할 필요 없이 누적 합계만 저장하면 되므로,
`SimpleAggregateFunction` 타입에 sum을 사용하는 것이 적합합니다.
그 결과 더 빠르게 동작하며 부분 집계 상태를 병합할 필요도 없습니다.

먼저 원시 데이터를 위한 테이블을 생성합니다:

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

다음으로 집계된 데이터를 저장할 대상 테이블을 생성합니다:

```sql
CREATE TABLE vote_aggregates
(
    post_id UInt32,
    upvotes SimpleAggregateFunction(sum, UInt64),
    downvotes SimpleAggregateFunction(sum, UInt64),
    score SimpleAggregateFunction(sum, Int64)
)
ENGINE = AggregatingMergeTree()
ORDER BY post_id;
```

그런 다음 `SimpleAggregateFunction` 타입의 컬럼을 사용하는 materialized view를 생성합니다.

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- Initial value for sum state (1 if upvote, 0 otherwise)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- Initial value for sum state (1 if downvote, 0 otherwise)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- Initial value for sum state (1 for upvote, -1 for downvote)
  toInt64(vote_type) AS score
FROM raw_votes;
```

샘플 데이터 삽입:

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

`SimpleState` 조합자를 사용해 materialized view를 조회합니다:

```sql
SELECT
  post_id,
  sum(upvotes) AS total_upvotes,
  sum(downvotes) AS total_downvotes,
  sum(score) AS total_score
FROM vote_aggregates -- Query the target table
GROUP BY post_id
ORDER BY post_id ASC;
```

```response
┌─post_id─┬─total_upvotes─┬─total_downvotes─┬─total_score─┐
│       1 │             2 │               1 │           1 │
│       2 │             1 │               1 │           0 │
│       3 │             0 │               1 │          -1 │
└─────────┴───────────────┴─────────────────┴─────────────┘
```


## 참고 항목 \{#see-also\}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)