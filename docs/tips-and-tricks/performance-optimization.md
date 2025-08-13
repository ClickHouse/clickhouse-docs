---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: 'Performance Optimization'
doc_type: 'how-to'
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
title: 'Lessons - Performance Optimization'
description: 'Real world examples of performance optimization strategies'
---

# Performance Optimization: Production-Tested Strategies {#performance-optimization}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Having trouble with Materialized Views? Check out the [Materialized Views](./materialized-views.md) community insights guide.*
*If you're experiencing slow queries and want more examples, we also have a [Query Optimization](/optimize/query-optimization) guide.*

## Order by Cardinality (Lowest to Highest) {#rule-1-cardinality-ordering}

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

## Time Granularity Matters {#rule-2-time-granularity}

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

## Focus on Individual Queries, Not Averages {#focus-on-individual-queries-not-averages}

*"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly. I only care about my query"*

Instead of looking at average performance, identify specific query patterns that cause problems:

```sql runnable editable
-- Challenge: Change the cardinality threshold values (0.8, 0.3) to be more or less strict
-- Experiment: Try different column combinations to find the riskiest patterns
SELECT 
    event_type,
    count() as total_events,
    uniq(actor_login) as unique_actors,
    uniq(repo_name) as unique_repos,
    -- High cardinality combinations can cause memory problems
    uniq(actor_login, repo_name) as unique_combinations,
    round(uniq(actor_login, repo_name) / count() * 100, 2) as cardinality_ratio_percent,
    CASE 
        WHEN uniq(actor_login, repo_name) / count() > 0.8 THEN 'HIGH MEMORY RISK: Almost every row unique'
        WHEN uniq(actor_login, repo_name) / count() > 0.3 THEN 'MODERATE RISK: High cardinality grouping'
        ELSE 'LOW RISK: Good aggregation potential'
    END as memory_risk_assessment
FROM github.github_events 
WHERE created_at >= '2024-01-01'
  AND created_at < '2024-01-02'
GROUP BY event_type
ORDER BY cardinality_ratio_percent DESC
LIMIT 8;
```

**Spot queries with different performance bottlenecks:**

```sql runnable editable
-- Challenge: Modify the filter conditions to test different early vs late filtering scenarios
-- Experiment: Try adding more complex WHERE conditions to see the efficiency impact
WITH early_filter AS (
    SELECT count() as rows_after_early_filter
    FROM github.github_events 
    WHERE created_at >= '2024-01-01' 
      AND created_at < '2024-01-02'
      AND event_type = 'PushEvent'  -- Filter early
      AND actor_login LIKE 'a%'
),
late_filter_simulation AS (
    SELECT 
        count() as total_rows_processed,
        countIf(event_type = 'PushEvent' AND actor_login LIKE 'a%') as rows_after_late_filter
    FROM github.github_events 
    WHERE created_at >= '2024-01-01' 
      AND created_at < '2024-01-02'
)
SELECT 
    'Early Filtering' as strategy,
    early_filter.rows_after_early_filter as result_rows,
    early_filter.rows_after_early_filter as rows_scanned,
    'Efficient: Only processes needed rows' as assessment
FROM early_filter
UNION ALL
SELECT 
    'Late Filtering Simulation',
    late_filter_simulation.rows_after_late_filter,
    late_filter_simulation.total_rows_processed,
    concat('Inefficient: Processes ', 
           toString(round(late_filter_simulation.total_rows_processed / late_filter_simulation.rows_after_late_filter)), 
           'x more rows than needed') as assessment
FROM late_filter_simulation;
```

**The key lesson from production teams:** When a query is slow, don't just look at averages. Ask "Why was THIS specific query slow?" and examine the actual resource usage patterns.

## Memory vs Row Scanning Trade-offs {#memory-vs-row-scanning-trade-offs}

**Sentry's key insight:** *"The cardinality of the grouping key that's going to drive memory in this particular situation"* - High cardinality aggregations kill performance through memory exhaustion, not row scanning.

**Pattern Recognition:** When queries fail, determine if it's a memory problem (too many groups) or scanning problem (too many rows).

**Compare granularity impact:**

```sql runnable editable
-- Challenge: Try different time granularities like toStartOfMinute or toStartOfWeek
-- Experiment: See how the memory multiplier changes with different time functions
SELECT 
    'Granularity Analysis' as analysis_type,
    uniq(toStartOfHour(created_at)) as hourly_groups,
    uniq(toStartOfMinute(created_at)) as minute_groups, 
    uniq(created_at) as microsecond_groups,
    concat('Minute granularity = ', toString(round(uniq(toStartOfMinute(created_at)) / uniq(toStartOfHour(created_at)))), 'x more memory') as minute_impact,
    concat('Microsecond = ', toString(round(uniq(created_at) / uniq(toStartOfHour(created_at)))), 'x more memory') as microsecond_impact
FROM github.github_events 
WHERE created_at >= '2024-01-01'
  AND created_at < '2024-01-02'
LIMIT 1;
```

**High-cardinality danger pattern:**

```sql runnable editable
-- Challenge: Try different column combinations to see which create the most unique groups
-- Experiment: Add or remove columns from the uniq() function to test cardinality impact
SELECT 
    'Dangerous Pattern Analysis' as analysis_type,
    count() as total_events,
    uniq(actor_login, repo_name, event_type) as unique_combinations,
    round(uniq(actor_login, repo_name, event_type) / count() * 100, 2) as cardinality_percent,
    CASE 
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.9 
        THEN 'CRITICAL: Nearly every row unique - will exhaust memory!'
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.5 
        THEN 'HIGH RISK: Too many unique groups'
        ELSE 'SAFE: Reasonable aggregation ratio'
    END as memory_risk
FROM github.github_events 
WHERE created_at >= '2024-01-01'
  AND created_at < '2024-01-02'
LIMIT 1;
```

**Sentry's sampling solution for memory problems:**

```sql runnable editable
-- Challenge: Try different sampling rates (0.01, 0.05, 0.2) to see accuracy vs speed trade-offs
-- Experiment: Change the hash function or modulus to see different sampling methods
WITH sampled_data AS (
    SELECT 
        count() as sampled_events,
        uniq(actor_login) as sampled_unique_users,
        round(avg(length(repo_name)), 2) as sampled_avg_repo_length
    FROM github.github_events 
    WHERE created_at >= '2024-01-01'
      AND created_at < '2024-01-02'
      AND cityHash64(actor_login) % 10 = 0  -- Deterministic 10% sample
),
full_data AS (
    SELECT 
        count() as full_events,
        uniq(actor_login) as full_unique_users,
        round(avg(length(repo_name)), 2) as full_avg_repo_length
    FROM github.github_events 
    WHERE created_at >= '2024-01-01'
      AND created_at < '2024-01-02'
)
SELECT 
    'Sampling Comparison' as analysis,
    sampled_events * 10 as estimated_total_from_sample,
    full_events as actual_total,
    sampled_unique_users as users_in_sample,
    full_unique_users as actual_unique_users,
    '90% memory reduction with sampling' as benefit
FROM sampled_data, full_data;
```

## Sentry's Bit Mask Optimization: From Memory Explosion to 8 Bytes {#bit-mask-optimization}

**The Problem:** When aggregating by high-cardinality columns (like URLs), each unique value creates a separate aggregation state in memory, leading to memory exhaustion.

**Sentry's Solution:** Instead of grouping by the actual URL strings, group by boolean expressions that collapse into bit masks.

**PROBLEM: Memory explosion with unbounded string arrays**

```sql runnable editable
-- This creates separate aggregation states for every unique repo
-- Challenge: Watch the memory usage - each user stores ALL their repo names
SELECT 
    actor_login,
    groupArray(repo_name) as all_repos,
    length(all_repos) as repo_count
FROM github.github_events
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
GROUP BY actor_login
HAVING repo_count > 5
ORDER BY repo_count DESC
LIMIT 10;
```

**SOLUTION: Boolean expressions that collapse to single integers**

```sql runnable editable
-- Each condition becomes a bit in a single integer per user
-- Challenge: Add more repo conditions and see how memory stays bounded
SELECT 
    actor_login,
    -- Each sumIf creates a single integer counter, not arrays of strings
    sumIf(1, repo_name LIKE '%microsoft%') as microsoft_activity,
    sumIf(1, repo_name LIKE '%google%') as google_activity, 
    sumIf(1, repo_name LIKE '%kubernetes%') as k8s_activity,
    sumIf(1, event_type = 'PushEvent') as total_pushes,
    -- Complex conditions still collapse to single counters
    sumIf(1, repo_name LIKE '%microsoft%' AND event_type = 'PushEvent') as microsoft_pushes
FROM github.github_events
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
GROUP BY actor_login
HAVING microsoft_activity > 0 OR google_activity > 0
ORDER BY (microsoft_activity + google_activity + k8s_activity) DESC
LIMIT 20;
```

**Compare the memory efficiency:**

```sql runnable editable
-- Challenge: Compare cardinality - how many unique values vs simple counters?
SELECT 
    'High Cardinality (Memory Explosion)' as approach,
    uniq(repo_name) as unique_repos,
    'Each user aggregation state stores array of ALL repo names' as memory_impact
FROM github.github_events
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'

UNION ALL

SELECT 
    'Bit Mask Approach (Memory Bounded)',
    4 as unique_conditions, -- microsoft, google, k8s, pushes
    'Each user aggregation state = 4 integers (32 bytes total)' as memory_impact;
```

**The Memory Impact:**
- **Before:** Each user stores arrays of ALL unique repo names (potentially MBs per user)
- **After:** Each user stores fixed number of counters (32 bytes for 4 conditions)  
- **Result:** Sentry achieved 100x memory reduction for certain query patterns

**Production Insight:** *"Don't look for 10 or 20% improvements, look for orders of magnitude... you want to see like 10x, 100x less memory consumed."*

**Why This Works:** Instead of storing every unique string in memory, you're storing the *answer to questions about those strings* as integers. The aggregation state becomes bounded and tiny, regardless of data diversity.

## Video Sources {#video-sources}
- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry's production lessons on memory optimization
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov on debugging methodology
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - Community optimization strategies

**Read Next**:
- [Query Optimization Guide](/optimize/query-optimization)
- [Materialized Views Community Insights](./materialized-views.md)