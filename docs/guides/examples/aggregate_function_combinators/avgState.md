---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'Example of using the avgState combinator'
keywords: ['avg', 'state', 'combinator', 'examples', 'avgState']
sidebar_label: 'avgState'
doc_type: 'how-to'
---

# avgState {#avgState}

## Description {#description}

The [`State`](/sql-reference/aggregate-functions/combinators#-state) combinator 
can be applied to the [`avg`](/sql-reference/aggregate-functions/reference/avg) 
function to produce an intermediate state of `AggregateFunction(avg, T)` type where
`T` is the specified type for the average.

## Example usage {#example-usage}

In this example, we'll look at how we can use the `AggregateFunction` type, 
together with the `avgState` function to aggregate website traffic data.

First create the source table for website traffic data:

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

Create the aggregate table that will store average response times. Note that 
`avg` cannot use the `SimpleAggregateFunction` type as it requires a complex 
state (a sum and a count). We therefore use the `AggregateFunction` type:

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

Create an Incremental materialized view that will act as an insert trigger to 
new data and store the intermediate state data in the target table defined above:

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

Insert some initial data into the source table, creating a part on disk:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

Insert some more data to create a second part on disk:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

Examine the target table `page_performance`:

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

Notice that the `avg_response_time` column is of type `AggregateFunction(avg, UInt32)`
and stores intermediate state information. Also notice that the row data for the 
`avg_response_time` is not useful to us and we see strange text characters such 
as `�, n, F, }`. This is the terminals attempt to display binary data as text. 
The reason for this is that `AggregateFunction` types store their state in a 
binary format that's optimized for efficient storage and computation, not for 
human readability. This binary state contains all the information needed to 
calculate the average.

To make use of it, use the `Merge` combinator:

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

Now we see the correct averages:

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## See also {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
