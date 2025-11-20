---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
title: 'sumSimpleState'
description: 'sumSimpleState 组合器的使用示例'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
doc_type: 'reference'
---



# sumSimpleState {#sumsimplestate}


## 描述 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 函数，以返回所有输入值的总和。该函数返回 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 类型的结果。


## 使用示例 {#example-usage}

### 跟踪点赞和点踩 {#tracking-post-votes}

让我们看一个实际示例,使用一个表来跟踪帖子的投票情况。
对于每个帖子,我们希望维护点赞数、点踩数的累计总数以及
总体评分。使用带有 sum 的 `SimpleAggregateFunction` 类型非常适合
这个场景,因为我们只需要存储累计总数,而不需要存储聚合的完整状态。
因此,它会更快,并且不需要合并部分聚合状态。

首先,我们为原始数据创建一个表:

```sql title="查询"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

接下来,我们创建一个目标表来存储聚合数据:

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

然后我们创建一个带有 `SimpleAggregateFunction` 类型列的物化视图:

```sql
CREATE MATERIALIZED VIEW mv_vote_processor TO vote_aggregates
AS
SELECT
  post_id,
  -- sum 状态的初始值(如果是点赞则为 1,否则为 0)
  toUInt64(vote_type = 'upvote') AS upvotes,
  -- sum 状态的初始值(如果是点踩则为 1,否则为 0)
  toUInt64(vote_type = 'downvote') AS downvotes,
  -- sum 状态的初始值(点赞为 1,点踩为 -1)
  toInt64(vote_type) AS score
FROM raw_votes;
```

插入示例数据:

```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

使用 `SimpleState` 组合器查询物化视图:

```sql
SELECT
  post_id,
  sum(upvotes) AS total_upvotes,
  sum(downvotes) AS total_downvotes,
  sum(score) AS total_score
FROM vote_aggregates -- 查询目标表
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
