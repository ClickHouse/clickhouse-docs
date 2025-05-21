---
'slug': '/examples/aggregate-function-combinators/sumSimpleState'
'title': 'sumSimpleState'
'description': 'Example of using the sumSimpleState combinator'
'keywords':
- 'sum'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'sumSimpleState'
'sidebar_label': 'sumSimpleState'
---




# sumSimpleState {#sumsimplestate}

## 描述 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 函数，以返回所有输入值的总和。它以 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 类型返回结果。

## 示例用法 {#example-usage}

### 跟踪点赞和点踩 {#tracking-post-votes}

让我们看一个实际的例子，使用一个表来跟踪帖子上的投票。对于每个帖子，我们希望维护点赞、点踩和总体得分的累计总数。使用 `SimpleAggregateFunction` 类型与 sum 适合这个用例，因为我们只需要存储累计总数，而不是聚合的整个状态。因此，这将更快，并且不需要合并部分聚合状态。

首先，我们创建一个用于原始数据的表：

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

接下来，我们创建一个目标表，以存储聚合的数据：

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

然后，我们创建一个包含 `SimpleAggregateFunction` 类型列的物化视图：

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

插入示例数据：

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

使用 `SimpleState` 组合器查询物化视图：

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

## 另请参见 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState 组合器`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction 类型`](/sql-reference/data-types/simpleaggregatefunction)
