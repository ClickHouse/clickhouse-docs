---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
description: 'Example of using the sumSimpleState combinator'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
---

# sumSimpleState {#sumsimplestate}

## Description {#description}

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`sum`](/sql-reference/aggregate-functions/reference/sum)
function to return the sum across all input values. It returns the result with 
type `SimpleAggregateState`.

## Example Usage {#example-usage}

### Tracking upvotes and downvotes {#tracking-post-votes}

Let's look at a practical example using a table that tracks votes on posts. 
For each post, we want to maintain running totals of upvotes, downvotes, and an 
overall score. Using the `SimpleAggregateFunction` type with sum is suited for
this use case as we only need to store the running totals, not the entire state 
of the aggregation.

```sql title="Query"
CREATE TABLE raw_votes
(
    post_id UInt32,
    vote_type Enum8('upvote' = 1, 'downvote' = -1)
)
ENGINE = MergeTree()
ORDER BY post_id;
```

Create a materialized view with `SimpleAggregateFunction` type columns:
       
```sql
CREATE MATERIALIZED VIEW vote_totals
(
    post_id UInt32,
    upvotes SimpleAggregateFunction(sum, UInt64),
    downvotes SimpleAggregateFunction(sum, UInt64),
    score SimpleAggregateFunction(sum, Int64)
)
ENGINE = AggregatingMergeTree()
ORDER BY post_id
AS
SELECT
    post_id,
    toUInt32(vote_type = 'upvote') AS upvotes,
    toUInt32(vote_type = 'downvote') AS downvotes,
    toInt32(if(vote_type = 'upvote', 1, -1)) AS score
FROM raw_votes;
```

Insert sample data:
       
```sql
INSERT INTO raw_votes VALUES
    (1, 'upvote'),
    (1, 'upvote'),
    (1, 'downvote'),
    (2, 'upvote'),
    (2, 'downvote'),
    (3, 'downvote');
```

Query the Materialized View using the `SimpleState` combinator:

```sql
SELECT
    post_id,
    sumSimpleState(upvotes) AS total_upvotes,
    sumSimpleState(downvotes) AS total_downvotes,
    sumSimpleState(score) AS total_score
FROM vote_totals
GROUP BY post_id
ORDER BY post_id;
```

```response
┌─post_id─┬─total_upvotes─┬─total_downvotes─┬─total_score─┐
│       1 │             2 │               1 │           1 │
│       2 │             1 │               1 │           0 │
│       3 │             0 │               1 │          -1 │
└─────────┴───────────────┴─────────────────┴─────────────┘
```

Note that we could get the same result using just `sum` instead of `sumSimpleState`:

```sql
SELECT
    post_id,
    sum(upvotes) AS total_upvotes,
    sum(downvotes) AS total_downvotes,
    sum(score) AS total_score
FROM vote_totals
GROUP BY post_id
ORDER BY post_id ASC
```

```response
┌─post_id─┬─total_upvotes─┬─total_downvotes─┬─total_score─┐
│       1 │             2 │               1 │           1 │
│       2 │             1 │               1 │           0 │
│       3 │             0 │               1 │          -1 │
└─────────┴───────────────┴─────────────────┴─────────────┘
```

When you use `sumSimpleState(column)`:
- It directly extracts the stored sum value without doing any additional 
  aggregation.
- The result is of type `SimpleAggregateFunction(sum, Int64)`

When you use `sum(column)` on a `SimpleAggregateFunction` column:
- ClickHouse recognizes this special case and implicitly converts it to behave 
  like `sumSimpleState`
- The result is `Int64`

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction) 