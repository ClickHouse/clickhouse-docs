---
slug: '/examples/aggregate-function-combinators/sumSimpleState'
description: 'Example of using the sumSimpleState combinator'
keywords: ['sum', 'state', 'simple', 'combinator', 'examples', 'sumSimpleState']
sidebar_label: 'sumSimpleState'
---

# sumSimpleState {#sumsimplestate}

## Description {#description}

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`sum`](/sql-reference/aggregate-functions/reference/sum)
function to return the sum across all input values. It returns the result with type `SimpleAggregateState`.

## Example Usage {#example-usage}

Let's look at a practical example using a table that tracks votes on posts. For each post, we want to maintain running totals of upvotes, downvotes, and an overall score. Using SimpleAggregateFunction with sum is perfect for this use case as we only need to store the running totals, not the entire state of the aggregation.

```sql title="Query"
-- Create a table using SimpleAggregateFunction type for vote tracking
CREATE TABLE post_votes
(
    post_id UInt32,
    upvotes SimpleAggregateFunction(sum, Int64),    -- Stores running total of upvotes
    downvotes SimpleAggregateFunction(sum, Int64),  -- Stores running total of downvotes
    score SimpleAggregateFunction(sum, Int64)       -- Stores running total score
)
ENGINE = AggregatingMergeTree()
ORDER BY post_id;

-- Insert sample voting data
INSERT INTO post_votes VALUES
    (1, 1, 0, 1), -- Post 1: One upvote
    (2, 2, 1, 1), -- Post 2: Two upvotes, one downvote
    (1, 2, 1, 1), -- Post 1: Two more upvotes, one downvote
    (3, 0, 3, -3); -- Post 3: Three downvotes

-- Show the current vote totals using sumSimpleState
SELECT
    post_id,
    sumSimpleState(upvotes) as total_upvotes,
    sumSimpleState(downvotes) as total_downvotes,
    sumSimpleState(score) as total_score,
    toTypeName(sumSimpleState(score)) as score_type
FROM post_votes
GROUP BY post_id
ORDER BY post_id;
```

```response title="Response"
   ┌─post_id─┬─total_upvotes─┬─total_downvotes─┬─total_score─┬─score_type──────────────────────────┐
1. │       1 │             3 │               1 │           2 │ SimpleAggregateFunction(sum, Int64) │
2. │       2 │             2 │               1 │           1 │ SimpleAggregateFunction(sum, Int64) │
3. │       3 │             0 │               3 │          -3 │ SimpleAggregateFunction(sum, Int64) │
   └─────────┴───────────────┴─────────────────┴─────────────┴─────────────────────────────────────┘
```

The example shows how:
- SimpleAggregateFunction(sum, Type) stores just the running total instead of the full state
- AggregatingMergeTree efficiently handles the aggregation of states by simply adding the values

For post_id 1, we can see the cumulative effect of multiple votes: 3 total upvotes, 1 downvote, resulting in a score of 2. The SimpleAggregateFunction with sum makes it efficient to maintain these running totals without storing individual votes.

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction) 