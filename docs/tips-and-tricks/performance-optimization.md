---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: 'Performance optimization'
doc_type: 'guide'
keywords: [
  'performance optimization',
  'query performance',
  'database tuning',
  'slow queries',
  'memory optimization',
  'cardinality analysis',
  'indexing strategies',
  'aggregation optimization',
  'sampling techniques',
  'database performance',
  'query analysis',
  'performance troubleshooting'
]
title: 'Lessons - performance optimization'
description: 'Real world examples of performance optimization strategies'
---

# Performance optimization: community tested strategies {#performance-optimization}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Having trouble with Materialized Views? Check out the [Materialized Views](./materialized-views.md) community insights guide.*
*If you're experiencing slow queries and want more examples, we also have a [Query Optimization](/optimize/query-optimization) guide.*

## Order by cardinality (lowest to highest) {#cardinality-ordering}
ClickHouse's primary index works best when low-cardinality columns come first, allowing it to skip large chunks of data efficiently. High-cardinality columns later in the key provide fine-grained sorting within those chunks. Start with columns that have few unique values (like status, category, country) and end with columns that have many unique values (like user_id, timestamp, session_id).

Check out more documentation on cardinality and primary indexes:
- [Choosing a Primary Key](/best-practices/choosing-a-primary-key)
- [Primary indexes](/primary-indexes)

## Time granularity matters {#time-granularity}
When using timestamps in your ORDER BY clause, consider the cardinality vs precision trade-off. Microsecond-precision timestamps create very high cardinality (nearly one unique value per row), which reduces the effectiveness of ClickHouse's sparse primary index. Rounded timestamps create lower cardinality that enables better index skipping, but you lose precision for time-based queries.

```sql runnable editable
-- Challenge: Try different time functions like toStartOfMinute or toStartOfWeek
-- Experiment: Compare the cardinality differences with your own timestamp data
SELECT 
    'Microsecond precision' as granularity,
    uniq(created_at) as unique_values,
    'Creates massive cardinality - bad for sort key' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    'Hour precision',
    uniq(toStartOfHour(created_at)),
    'Much better for sort key - enables skip indexing'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    'Day precision',
    uniq(toStartOfDay(created_at)),
    'Best for reporting queries'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## Focus on individual queries, not averages {#focus-on-individual-queries-not-averages}

When debugging ClickHouse performance, don't rely on average query times or overall system metrics. Instead, identify why specific queries are slow. A system can have good average performance while individual queries suffer from memory exhaustion, poor filtering, or high cardinality operations.

According to Alexey, CTO of ClickHouse: *"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly. I only care about my query"*

When a query is slow, don't just look at averages. Ask "Why was THIS specific query slow?" and examine the actual resource usage patterns.

## Memory and row scanning {#memory-and-row-scanning}

Sentry is a developer-first error tracking platform processing billions of events daily from 4+ million developers. Their key insight: *"The cardinality of the grouping key that's going to drive memory in this particular situation"* - High cardinality aggregations kill performance through memory exhaustion, not row scanning.

When queries fail, determine if it's a memory problem (too many groups) or scanning problem (too many rows).

A query like `GROUP BY user_id, error_message, url_path` creates a separate memory state for every unique combination of all three values together. With a higher load of users, error types, and URL paths, you could easily generate millions of aggregation states that must be held in memory simultaneously.

For extreme cases, Sentry uses deterministic sampling. A 10% sample reduces memory usage by 90% while maintaining roughly 5% accuracy for most aggregations:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

This ensures the same users appear in every query, providing consistent results across time periods. The key insight: `cityHash64()` produces consistent hash values for the same input, so `user_id = 12345` will always hash to the same value, ensuring that user either always appears in your 10% sample or never does - no flickering between queries.

## Sentry's bit mask optimization {#bit-mask-optimization}

When aggregating by high-cardinality columns (like URLs), each unique value creates a separate aggregation state in memory, leading to memory exhaustion. Sentry's solution: instead of grouping by the actual URL strings, group by boolean expressions that collapse into bit masks.

Here is a query that you can try on your own tables if this situation applies to you:

```sql
-- Memory-Efficient Aggregation Pattern: Each condition = one integer per group
-- Key insight: sumIf() creates bounded memory regardless of data volume
-- Memory per group: N integers (N * 8 bytes) where N = number of conditions

SELECT 
    your_grouping_column,
    
    -- Each sumIf creates exactly one integer counter per group
    -- Memory stays constant regardless of how many rows match each condition
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,
    
    -- Complex multi-condition aggregations still use constant memory
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,
    
    -- Standard aggregations for context
    count() as total_rows,
    avg(your_numeric_column) as average_value,
    max(your_timestamp_column) as latest_timestamp
    
FROM your_schema.your_table
WHERE your_timestamp_column >= 'start_date' 
  AND your_timestamp_column < 'end_date'
GROUP BY your_grouping_column
HAVING condition_1_count > minimum_threshold 
   OR condition_2_count > another_threshold
ORDER BY (condition_1_count + condition_2_count + pattern_matches) DESC
LIMIT 20
```

Instead of storing every unique string in memory, you're storing the answer to questions about those strings as integers. The aggregation state becomes bounded and tiny, regardless of data diversity.

From Sentry's engineering team: "These heavy queries are more than 10x faster and our memory usage is 100x lower (and, more importantly, bounded). Our largest customers no longer see errors when searching for replays and we can now support customers of arbitrary size without running out of memory."

## Video sources {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry's production lessons on memory optimization
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov on debugging methodology
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - Community optimization strategies

**Read Next**:
- [Query Optimization Guide](/optimize/query-optimization)
- [Materialized Views Community Insights](./materialized-views.md)