---
'slug': '/examples/aggregate-function-combinators/sumSimpleState'
'title': 'sumSimpleState'
'description': 'sumSimpleState 조합자를 사용하는 예제'
'keywords':
- 'sum'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'sumSimpleState'
'sidebar_label': 'sumSimpleState'
'doc_type': 'reference'
---


# sumSimpleState {#sumsimplestate}

## Description {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 조합자는 [`sum`](/sql-reference/aggregate-functions/reference/sum) 함수에 적용되어 모든 입력 값의 합계를 반환할 수 있습니다. 결과는 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 타입으로 반환됩니다.

## Example usage {#example-usage}

### Tracking upvotes and downvotes {#tracking-post-votes}

게시물에 대한 투표를 추적하는 테이블을 사용하는 실제 예제를 살펴보겠습니다. 각 게시물에 대해, 우리는 업보트, 다운보트, 그리고 전체 점수의 누적 합계를 유지하고자 합니다. `SimpleAggregateFunction` 타입과 sum을 사용하는 것은 전체 집계 상태를 저장할 필요 없이 누적 합계만 저장하면 되므로 이 사용 사례에 적합합니다. 그 결과, 더 빠르게 처리되며 부분 집계 상태의 병합이 필요하지 않습니다.

먼저, 원시 데이터를 위한 테이블을 생성합니다:

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

다음으로, 집계 데이터를 저장할 목표 테이블을 생성합니다:

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

그 후, `SimpleAggregateFunction` 타입 컬럼을 가진 물리화된 뷰를 생성합니다:
       
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

샘플 데이터를 삽입합니다:
       
```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

`SimpleState` 조합자를 사용하여 물리화된 뷰를 쿼리합니다:

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

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
