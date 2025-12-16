---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: '使用 sumSimpleState 组合器的示例'
keywords: ['sum', '状态', '简单', '组合器', '示例', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---

# sumSimpleState {#sumsimplestate}

## 描述 {#description}

可以将 [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum)
函数，以返回所有输入值的总和。它返回结果的类型为
[`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction)。

## 示例用法 {#example-usage}

### 跟踪点赞和点踩 {#tracking-post-votes}

来看一个实际示例，使用一张表来跟踪帖子上的投票。
对于每条帖子，我们希望维护点赞、点踩以及总体得分的累计总数。
在这个用例中，使用带有 `sum` 的 `SimpleAggregateFunction` 类型非常合适，
因为我们只需要存储累计总数，而不是整个聚合的完整状态。
这样一来，性能会更好，并且不需要合并部分聚合状态。

首先，我们创建一张用于存储原始数据的表：

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

接下来，我们创建一个目标表，用于存储聚合数据：

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

然后创建一个物化视图，其中包含 `SimpleAggregateFunction` 类型的列：

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

使用 `SimpleState` 组合子来查询该物化视图：

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

## 另请参阅 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState 组合器`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction 类型`](/sql-reference/data-types/simpleaggregatefunction)
