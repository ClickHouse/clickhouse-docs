---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: 'Performance Optimization'
doc_type: 'how-to-guide'
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

# Performance optimization: production-tested strategies {#performance-optimization}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Having trouble with Materialized Views? Check out the [Materialized Views](./materialized-views.md) community insights guide.*
*If you're experiencing slow queries and want more examples, we also have a [Query Optimization](/optimize/query-optimization) guide.*

## Order by cardinality (lowest to highest) {#rule-1-cardinality-ordering}
ClickHouse's primary index works best when low-cardinality columns come first, allowing it to skip large chunks of data efficiently. High-cardinality columns later in the key provide fine-grained sorting within those chunks. Start with columns that have few unique values (like status, category, country) and end with columns that have many unique values (like user_id, timestamp, session_id).

```sql runnable editable
-- Challenge: Try filtering by different event types or time ranges
-- Experiment: Add SAMPLE 0.1 to see how sampling affects cardinality analysis
SELECT 
    column_name,
    unique_values,
    total_rows,
    cardinality_percentage,
    assessment
FROM (
    SELECT 
        'event_type' as column_name,
        uniq(event_type) as unique_values,
        count() as total_rows,
        round(uniq(event_type) / count() * 100, 4) as cardinality_percentage,
        'Low cardinality - good for sort key prefix' as assessment
    FROM github.github_events
    WHERE created_at >= '2024-01-01'

    UNION ALL

    SELECT 
        'actor_login' as column_name,
        uniq(actor_login) as unique_values,
        count() as total_rows,
        round(uniq(actor_login) / count() * 100, 4) as cardinality_percentage,
        'High cardinality - use later in sort key' as assessment
    FROM github.github_events
    WHERE created_at >= '2024-01-01'
)
ORDER BY cardinality_percentage;
```

## Time granularity matters {#rule-2-time-granularity}
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

*"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly. I only care about my query"*

The key is understanding whether your slow query is hitting memory limits (too many unique groups) or scanning too much data (poor filtering). Here's how to diagnose each:

**Identify memory-bound queries:**

```sql runnable editable
-- This shows if your GROUP BY creates too many unique combinations
-- High cardinality ratio means memory problems, not scanning problems
SELECT 
    event_type,
    count() as total_events,
    uniq(actor_login, repo_name) as unique_combinations,
    round(uniq(actor_login, repo_name) / count() * 100, 2) as cardinality_ratio_percent,
    CASE 
        WHEN uniq(actor_login, repo_name) / count() > 0.8 THEN 'MEMORY PROBLEM: Almost every row unique'
        WHEN uniq(actor_login, repo_name) / count() > 0.3 THEN 'MODERATE RISK: High cardinality grouping'
        ELSE 'SCANNING PROBLEM: Look at filtering instead'
    END as bottleneck_type
FROM github.github_events 
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
GROUP BY event_type
ORDER BY cardinality_ratio_percent DESC
LIMIT 5;
```

**Identify scanning-bound queries:**

```sql runnable editable
-- This shows if your filters are working efficiently
-- Large difference between total vs filtered rows means scanning problems
WITH filter_efficiency AS (
    SELECT 
        count() as total_rows_scanned,
        countIf(event_type = 'PushEvent' AND actor_login LIKE 'a%') as rows_after_filter
    FROM github.github_events 
    WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
)
SELECT 
    total_rows_scanned,
    rows_after_filter,
    round(total_rows_scanned / rows_after_filter) as efficiency_ratio,
    CASE 
        WHEN total_rows_scanned / rows_after_filter > 100 THEN 'SCANNING PROBLEM: Improve WHERE conditions'
        ELSE 'FILTERING EFFICIENT: Look for memory or cardinality issues'
    END as bottleneck_type
FROM filter_efficiency;
```

Use this approach to focus your optimization efforts: if it's memory-bound, reduce cardinality or use sampling. If it's scanning-bound, improve your WHERE conditions or primary key design.

**The key lesson from production teams:** When a query is slow, don't just look at averages. Ask "Why was THIS specific query slow?" and examine the actual resource usage patterns.

## Memory vs row scanning trade-offs {#memory-vs-row-scanning-trade-offs}

Sentry is a developer-first error tracking platform processing billions of events daily from 4+ million developers. Their key insight: *"The cardinality of the grouping key that's going to drive memory in this particular situation"* - High cardinality aggregations kill performance through memory exhaustion, not row scanning.

When queries fail, determine if it's a memory problem (too many groups) or scanning problem (too many rows).

ClickHouse must maintain separate aggregation states in memory for each unique combination of GROUP BY columns. Memory usage grows exponentially with the number of unique combinations, not linearly with the number of rows processed.

The critical insight: **cardinality multiplies across dimensions**. A query like `GROUP BY user_id, error_message, url_path` doesn't just track three columns - it creates a separate memory state for every unique combination of all three values together. With thousands of users, hundreds of error types, and thousands of URL paths, you could easily generate millions of aggregation states that must be held in memory simultaneously.

This is exactly where Sentry's platform hit the wall. They had billions of events with highly diverse error attributes, and traditional GROUP BY operations would exhaust available memory trying to track every unique combination before they could complete the aggregation and return results.

For extreme cases, Sentry uses deterministic sampling. A 10% sample reduces memory usage by 90% while maintaining roughly 5% accuracy for most aggregations:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

This ensures the same users appear in every query, providing consistent results across time periods. The key insight: `cityHash64()` produces consistent hash values for the same input, so `user_id = 12345` will always hash to the same value, ensuring that user either always appears in your 10% sample or never does - no flickering between queries.

## Sentry's bit mask optimization: from memory explosion to bounded counters {#bit-mask-optimization}

When aggregating by high-cardinality columns (like URLs), each unique value creates a separate aggregation state in memory, leading to memory exhaustion. Sentry's solution: instead of grouping by the actual URL strings, group by boolean expressions that collapse into bit masks.

```sql runnable editable
-- Each condition becomes a single integer counter per user - bounded memory!
-- Challenge: Add more conditions and see how memory stays constant per user
-- Memory per user: 6 integers (48 bytes) regardless of how many repos they touch
SELECT 
    actor_login,
    -- Each sumIf creates exactly one integer, regardless of data diversity
    sumIf(1, event_type = 'PushEvent') as push_events,
    sumIf(1, event_type = 'WatchEvent') as watch_events, 
    sumIf(1, repo_name LIKE '%microsoft%') as microsoft_activity,
    sumIf(1, repo_name LIKE '%google%') as google_activity,
    
    -- Complex conditions still collapse to single counters
    sumIf(1, event_type = 'PushEvent' AND repo_name LIKE '%microsoft%') as microsoft_pushes,
    count() as total_events
FROM github.github_events
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
GROUP BY actor_login
HAVING push_events > 5 OR microsoft_activity > 0
ORDER BY (push_events + watch_events + microsoft_activity) DESC
LIMIT 20
```

The difference is dramatic. Before: each user stores arrays of ALL unique repo names (potentially MBs per user). After: each user stores exactly 6 integers (48 bytes), regardless of how many repos they interact with. Sentry achieved 100x memory reduction for certain query patterns with this approach.

Instead of storing every unique string in memory, you're storing the *answer to questions about those strings* as integers. The aggregation state becomes bounded and tiny, regardless of data diversity.

From Sentry's engineering team: "These heavy queries are more than 10x faster and our memory usage is 100x lower (and, more importantly, bounded). Our largest customers no longer see errors when searching for replays and we can now support customers of arbitrary size without running out of memory."

## Video sources {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry's production lessons on memory optimization
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov on debugging methodology
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - Community optimization strategies

**Read Next**:
- [Query Optimization Guide](/optimize/query-optimization)
- [Materialized Views Community Insights](./materialized-views.md)