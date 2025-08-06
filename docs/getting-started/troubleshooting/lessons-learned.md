---
sidebar_position: 1
slug: /getting-started/lessons-learned
sidebar_label: 'Lessons Learned'
keywords: [
  'clickhouse troubleshooting',
  'clickhouse errors',
  'slow queries',
  'memory problems', 
  'connection issues',
  'performance optimization',
  'database errors',
  'configuration problems',
  'debug',
  'solutions'
]
title: 'Troubleshooting Common Issues'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# ClickHouse Community Lessons Learned: Production Battle-Tested Guide {#community-lessons-learned}

*Real-world wisdom from companies processing billions of events - searchable solutions to common problems*

## Quick Problem Finder {#quick-problem-finder}

**Need immediate help?** Jump to your specific issue:

| Problem Type | Common Symptoms | Quick Solution |
|--------------|----------------|----------------|
| [Too Many Parts Error](#the-too-many-parts-crisis) | Performance suddenly degrades, small frequent inserts | Enable `async_insert=1`, batch 30sec+ |
| [Migration Taking Forever](#migration-timeline-reality-check) | 6+ month timeline, API breakage fears | Plan 12 months, run parallel systems |
| [Sort Key Regrets](#the-sort-key-trap) | Can't optimize queries, wrong column order | Test with production data first, order by cardinality |
| [Memory Exhaustion](#memory-vs-row-scanning-trade-offs) | Queries fail on aggregations, not row scanning | Enable external aggregation, reduce cardinality |
| [Materialized View Bloat](#materialized-views-the-double-edged-sword) | 10x storage increase, performance worse | Rule: Views should be sparser than parent tables |
| [Slow Individual Queries](#focus-on-individual-queries-not-averages) | Good averages but bad user experience | Debug individual slow queries, not averages |

## Migration and Getting Started Lessons {#migration-getting-started}

### The Performance Shock Moment {#performance-shock-moment}

**What every team experiences:** Almost every migration story includes disbelief at ClickHouse performance gains.

**Real examples with numbers:**
- **Corunet**: *"PostgreSQL took 4.5 seconds while ClickHouse took 0.44 seconds... that's my face I didn't know that was possible"* - David from Corunet
- **ContentSquare**: 11x infrastructure cost reduction + *"4x faster queries on average"* with 10x faster P99 queries  
- **ChartMetric**: *"From 60 seconds down to 2 seconds for top artists. Taylor Swift used to take 5 minutes to see which playlists she's on because it's that important."*
- **RangeGage**: *"going to go bankrupt because it's too expensive"* on Snowflake → eliminated "spinning loading icons" with ClickHouse
- **Huntress**: Achieved 50x compression (vs 10x advertised) and *"$70k/month Elasticsearch → $5k/month ClickHouse Cloud for similar workloads"*

**Why this matters:** Plan for dramatic improvements, not incremental ones. Budget and architecture decisions should account for order-of-magnitude gains.

### Migration Timeline Reality Check {#migration-timeline-reality-check}

**What surprises teams:** Migrations take 6-12 months for operational reasons, not technical complexity.

**Real timeline examples:**
- **LiveStream**: Full year migration *"June 2016 to June 2017"* with careful batch rollouts by customer segments, not all 600 clients at once
- **ContentSquare**: 11-month Elasticsearch → ClickHouse migration with zero regressions
- **Langfuse**: 6+ months of community preparation for *"thousands of self hosters"* migrating from PostgreSQL

**Critical success factors validated by zero-regression migrations:**

#### 1. API Contract Preservation (ContentSquare Strategy)
*"Never break the contract"* - ContentSquare's golden rule for their 11-month migration
- Run old and new systems in parallel during transition
- Maintain all existing API endpoints unchanged
- Allow gradual internal switchover without user impact

#### 2. Transparent Communication Strategy (Langfuse Approach)  
*"We communicated very early and transparently and frequently... We really tried to keep everyone in the loop"*
- Start communication 6+ months before migration
- Create focus groups for high-impact users
- Provide migration scripts and clear timelines

#### 3. Production Volume Testing
- Test with real production data volumes, not samples
- *"When you are doing an insert into distributed tables... only one server will take the full insertion"* - ContentSquare discovered this bottleneck during testing
- Batch user rollouts - never all-at-once switches

#### 4. ZooKeeper Anxiety Management
Reassure teams about operational concerns: *"Many people are very afraid of ZooKeeper... with our experience ZooKeeper is not a problem at all."*

#### Production-Tested Optimization Rules {#optimization-rules}

**Rule 1: Order by Cardinality (Lowest to Highest)**

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

**Rule 2: Time Granularity Matters**

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

### The Too Many Parts Crisis: Complete Prevention Guide {#the-too-many-parts-crisis}

**Universal pain point:** Small frequent inserts create performance disasters through part explosion.

**Clear warnings from ClickHouse engineers and users:**
- *"If you are doing 100,000 inserts it is going to create 100,000 parts and behind the scenes over time click house is going to merge those parts... more parts you create the more meta work that you create for click house to merge"*
- *"If the inserts are too small we have another question that the background merging stress will not merge these small parts together in time then when the parts accumulating too many it will easy to get too many parts error which will slow down our writing throughput"*
- *"We encourage our users to insert the data in batches for example 20,000 rows at once"*

#### Recognize the Crisis Early {#recognize-parts-crisis}

```sql runnable editable
-- Challenge: Replace with your actual database and table names for production use
-- Experiment: Adjust the part count thresholds (1000, 500, 100) based on your system
SELECT 
    database,
    table,
    count() as total_parts,
    sum(rows) as total_rows,
    round(avg(rows), 0) as avg_rows_per_part,
    min(rows) as min_rows_per_part,
    max(rows) as max_rows_per_part,
    round(sum(bytes_on_disk) / 1024 / 1024, 2) as total_size_mb,
    CASE 
        WHEN count() > 1000 THEN 'CRITICAL - Too many parts (>1000)'
        WHEN count() > 500 THEN 'WARNING - Many parts (>500)'
        WHEN count() > 100 THEN 'CAUTION - Getting many parts (>100)'
        ELSE 'OK - Reasonable part count'
    END as parts_assessment,
    CASE 
        WHEN avg(rows) < 1000 THEN 'POOR - Very small parts'
        WHEN avg(rows) < 10000 THEN 'FAIR - Small parts'
        WHEN avg(rows) < 100000 THEN 'GOOD - Medium parts'
        ELSE 'EXCELLENT - Large parts'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```

#### Root Cause: Proper Insert Batching {#proper-insert-batching}

**Community-proven batching strategy from production deployments:**

*"All these batching services they buffer the traffic... either for 30 seconds or till the data size hits 200 MB... there is a fine balance that needs to be struck here for how much to buffer... we don't want to insert again too frequently because then it unnecessarily consumes click house cycles"* - Production observability platform processing TB/day

```python
# Python example - battle-tested batching approach from production systems
import clickhouse_driver
import time

class ProductionBatchInserter:
    """Based on patterns from companies processing TB/day"""
    def __init__(self, client, batch_size=10000, batch_timeout=30):
        self.client = client
        self.batch_size = batch_size  # Or 200MB as used in production
        self.batch_timeout = batch_timeout  # 30 seconds proven threshold
        self.buffer = []
        self.last_flush = time.time()
        
    def insert_event(self, event_data):
        self.buffer.append(event_data)
        
        # Flush on size or time threshold - prevents "too many parts"
        if (len(self.buffer) >= self.batch_size or 
            time.time() - self.last_flush >= self.batch_timeout):
            self.flush()
            
    def flush(self):
        if self.buffer:
            self.client.execute('INSERT INTO events VALUES', self.buffer)
            self.buffer.clear()
            self.last_flush = time.time()
```

**Alternative: Async Inserts (ClickHouse 21.11+)**
*"We developed a function called async insert... this mechanism is straightforward similar to buffer table we insert to the server side and use some buffer to collect these inserts by default we have 16 threads to collect this buffer and if the buffer is large enough or reach timeout we will flush the buffer to the storage so apart will contain multiple inserts"* - ClickHouse team explaining built-in solution

```sql
-- Enable async inserts to automatically batch small inserts
SET async_insert = 1;
SET wait_for_async_insert = 1;  -- For consistency guarantees
SET async_insert_max_data_size = 10485760;  -- 10MB buffer size
SET async_insert_busy_timeout_ms = 30000;   -- 30 second timeout
```

### Materialized Views: The Double-Edged Sword {#materialized-views-the-double-edged-sword}

**Community warning from real production disasters:** Teams get *"over enthusiastic about materialized views and we end up creating too many of them and that kind of slows down... our injection as well"*

#### The 10x Storage Explosion Anti-Pattern {#storage-explosion-antipattern}

**Real production disaster:** *"We had a materialized view... the raw log table was around 20 gig but the view from that log table got exploded to 190 gig so almost 10x the size of the raw table... this happened because... we were creating one row per attribute and each log can have 10 attributes"*

**Rule:** If your GROUP BY creates more rows than it eliminates, you're building an expensive index, not a materialized view.

#### Production MV Health Validation {#mv-health-validation}

```sql runnable editable
-- Challenge: Replace table name with your own data to check MV viability
-- Experiment: Try different GROUP BY combinations to see aggregation ratios
SELECT 
    'MV Pre-deployment Health Check' as analysis_type,
    count() as source_rows,
    uniq(pickup_datetime, dropoff_datetime, passenger_count) as mv_unique_combinations,
    round(uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() * 100, 2) as aggregation_ratio_percent,
    formatReadableSize(count() * 100) as estimated_source_size,
    formatReadableSize(uniq(pickup_datetime, dropoff_datetime, passenger_count) * 100) as estimated_mv_size,
    round(uniq(pickup_datetime, dropoff_datetime, passenger_count) * 100 / (count() * 100), 1) as storage_multiplier,
    CASE 
        WHEN uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() > 0.95 THEN 'DISASTER: MV will be larger than source!'
        WHEN uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() > 0.7 THEN 'TERRIBLE: Massive storage waste (190GB scenario)'
        WHEN uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() > 0.3 THEN 'QUESTIONABLE: High storage overhead'
        ELSE 'GOOD: Substantial aggregation benefit'
    END as mv_assessment
FROM nyc_taxi.trips
WHERE pickup_datetime >= '2015-01-01' 
  AND pickup_datetime < '2015-01-02'
LIMIT 1;
```

#### The Successful MV Patterns {#successful-mv-patterns}

**From companies with excellent MV results:**

*"Because of how we put it into the disk we are compressing from 72 to 3 gigabytes which is 25x which is pretty good"* - Example of proper MV achieving massive compression

```sql runnable editable
-- Challenge: Try this pattern with different low-cardinality column combinations
-- Experiment: Change the time granularity to see how it affects compression
SELECT 
    'Production Success Pattern' as analysis_type,
    count() as source_rows,
    uniq(event_type, toStartOfHour(created_at)) as unique_combinations,
    round(uniq(event_type, toStartOfHour(created_at)) / count() * 100, 4) as aggregation_ratio_percent,
    formatReadableSize(count() * 50) as estimated_source_size,
    formatReadableSize(uniq(event_type, toStartOfHour(created_at)) * 50) as estimated_mv_size,
    CASE 
        WHEN uniq(event_type, toStartOfHour(created_at)) / count() < 0.001 THEN 'OUTSTANDING: Like the 72GB→3GB compression example'
        WHEN uniq(event_type, toStartOfHour(created_at)) / count() < 0.01 THEN 'EXCELLENT: Massive aggregation benefit'
        WHEN uniq(event_type, toStartOfHour(created_at)) / count() < 0.1 THEN 'GOOD: Strong aggregation'
        ELSE 'REVIEW: Limited benefit'
    END as mv_assessment
FROM github.github_events
WHERE created_at >= '2024-01-01' 
  AND created_at < '2024-01-08'
LIMIT 1;
```

#### Recovery Strategy for Over-Enthusiastic MV Usage {#mv-recovery-strategy}

**From companies that fixed their MV problems:**

*"One thing we did was remove the Mater if you have lot of materialized views remove the selected materialized views and create the tables for them instead... we create the tables and then run periodically run a cron job to populate those tables instead of relying materialized views"*

**Decision Framework:**
- **Keep MV:** Query frequency × speed improvement > storage cost × maintenance overhead
- **Replace with cron:** Aggregations that are *"not very critical like if you have a 5 minute aggregation 1 hour aggregation already created... maybe it can wait"*

## Performance Optimization: Production-Tested Strategies {#performance-optimization}

### Focus on Individual Queries, Not Averages {#focus-on-individual-queries-not-averages}

**Alexey Milovidov's core insight:** *"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly I only care about my query"*

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

### Memory vs Row Scanning Trade-offs {#memory-vs-row-scanning-trade-offs}

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
        THEN 'CRITICAL: Nearly every row creates unique group - will exhaust memory!'
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.5 
        THEN 'HIGH RISK: Too many unique groups for large datasets'
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

**The key diagnostic question:** Is your query slow because it's reading too many rows, or because it's creating too many aggregation groups? The solution strategies are completely different.

## Cost Optimization: Battle-Tested Strategies {#cost-optimization}

### The Partition Deletion vs TTL Discovery {#partition-vs-ttl}

**Hard-learned lesson from production:** TTL mutations are resource-intensive and slow down everything.

*"Don't try to mutate data if there isn't a world where you absolutely need to... when you mutate data ClickHouse creates a new version of the data and then it merges it with the existing data... it's resource intensive... significantly significant performance impact"*

**Better strategy:** Delete entire partitions instead of TTL row-by-row deletion.

```sql runnable editable
-- Challenge: Adjust the month thresholds (3 months, 1 month) based on your retention needs
-- Experiment: Try different partition patterns like weekly or daily instead of monthly
SELECT 
    toYYYYMM(created_at) as year_month,
    count() as events,
    min(created_at) as oldest_event,
    max(created_at) as newest_event,
    formatReadableSize(count() * 200) as estimated_size_bytes,
    CASE 
        WHEN toYYYYMM(created_at) < toYYYYMM(now()) - 3 
        THEN 'DELETE PARTITION - older than 3 months'
        WHEN toYYYYMM(created_at) < toYYYYMM(now()) - 1 
        THEN 'ARCHIVE CANDIDATE - 1-3 months old'
        ELSE 'KEEP - recent data'
    END as retention_strategy
FROM github.github_events 
WHERE created_at >= '2023-01-01'
GROUP BY year_month
ORDER BY year_month DESC
LIMIT 12;
```

### Storage Hot Spots Analysis {#storage-hot-spots}

**Find your biggest storage consumers:** Identify which columns and patterns drive your storage costs.

```sql runnable editable
-- Challenge: Replace column names with your own table's columns to find storage hot spots
-- Experiment: Try different size thresholds (50MB) and repetition factors (10, 3, 5)
SELECT 
    column_name,
    total_size_mb,
    unique_values,
    repetition_factor,
    storage_efficiency,
    optimization_priority
FROM (
    SELECT 
        'repo_name' as column_name,
        round(sum(length(repo_name)) / 1024 / 1024, 2) as total_size_mb,
        count(DISTINCT repo_name) as unique_values,
        round(count() / count(DISTINCT repo_name), 1) as repetition_factor,
        CASE 
            WHEN count() / count(DISTINCT repo_name) > 10 THEN 'HIGH compression potential'
            WHEN count() / count(DISTINCT repo_name) > 3 THEN 'MEDIUM compression potential' 
            ELSE 'LOW compression potential'
        END as storage_efficiency,
        CASE 
            WHEN round(sum(length(repo_name)) / 1024 / 1024, 2) > 50 AND count() / count(DISTINCT repo_name) > 5 
            THEN 'OPTIMIZE FIRST - large + repetitive'
            WHEN round(sum(length(repo_name)) / 1024 / 1024, 2) > 50 
            THEN 'SIZE CONCERN - consider retention'
            ELSE 'LOW PRIORITY'
        END as optimization_priority
    FROM github.github_events 
    WHERE created_at >= '2024-01-01' AND created_at < '2024-01-08'

    UNION ALL

    SELECT 
        'actor_login',
        round(sum(length(actor_login)) / 1024 / 1024, 2),
        count(DISTINCT actor_login),
        round(count() / count(DISTINCT actor_login), 1),
        CASE 
            WHEN count() / count(DISTINCT actor_login) > 10 THEN 'HIGH compression potential'
            WHEN count() / count(DISTINCT actor_login) > 3 THEN 'MEDIUM compression potential' 
            ELSE 'LOW compression potential'
        END,
        CASE 
            WHEN round(sum(length(actor_login)) / 1024 / 1024, 2) > 50 AND count() / count(DISTINCT actor_login) > 5 
            THEN 'OPTIMIZE FIRST - large + repetitive'
            WHEN round(sum(length(actor_login)) / 1024 / 1024, 2) > 50 
            THEN 'SIZE CONCERN - consider retention'
            ELSE 'LOW PRIORITY'
        END
    FROM github.github_events 
    WHERE created_at >= '2024-01-01' AND created_at < '2024-01-08'
) 
ORDER BY total_size_mb DESC;
```

### Cost-Driven Retention Analysis {#cost-driven-retention}

**Real production strategy:** *"Once we get this kind of deletion signal... we do the row based deletion... we know what needs to be deleted and keep on tracking"*

```sql runnable editable
-- Challenge: Modify the age thresholds (7, 30, 90 days) to match your business needs
-- Experiment: Try different retention strategies for each temperature tier
SELECT 
    data_temperature,
    count() as event_count,
    round(count() * 100.0 / sum(count()) OVER(), 2) as percentage_of_total,
    formatReadableSize(count() * 200) as estimated_storage_size,
    retention_strategy
FROM (
    SELECT 
        CASE 
            WHEN dateDiff('day', created_at, now()) <= 7 THEN 'Hot Data (0-7 days)'
            WHEN dateDiff('day', created_at, now()) <= 30 THEN 'Warm Data (8-30 days)' 
            WHEN dateDiff('day', created_at, now()) <= 90 THEN 'Cool Data (31-90 days)'
            ELSE 'Cold Data (90+ days)'
        END as data_temperature,
        CASE 
            WHEN dateDiff('day', created_at, now()) <= 7 THEN 'Keep all columns - high query value'
            WHEN dateDiff('day', created_at, now()) <= 30 THEN 'Consider column-based TTL for large fields'
            WHEN dateDiff('day', created_at, now()) <= 90 THEN 'Drop expensive columns, keep core data'
            ELSE 'DELETE PARTITION - storage cost > query value'
        END as retention_strategy,
        CASE 
            WHEN dateDiff('day', created_at, now()) <= 7 THEN 1
            WHEN dateDiff('day', created_at, now()) <= 30 THEN 2 
            WHEN dateDiff('day', created_at, now()) <= 90 THEN 3
            ELSE 4
        END as sort_order
    FROM github.github_events 
    WHERE created_at >= '2023-01-01'
) 
GROUP BY data_temperature, retention_strategy, sort_order
ORDER BY sort_order;
```

**The key insight:** Instead of deleting entire rows, strategically drop the expensive columns first while preserving the essential data structure for longer periods. This can save "several terabytes" as Displayce discovered.

## Operations: The 2AM Debugging Toolkit {#operations-debugging}

### When Everything is Broken: Crisis Diagnostics {#crisis-diagnostics}

**Community philosophy:** *"If something looks odd even just slightly something is wrong - investigate before it gets worse"*

**The nightmare scenario:** *"One of the worst days of my life over the past three years... it locked the database you couldn't insert anything couldn't read anything CPU went crazy memory usage went crazy"*

---

### EMERGENCY: Production Crisis Queries (Copy-Paste Ready) {#emergency-queries}

**When your ClickHouse is down at 2AM, run these in order:**

```sql
-- Step 1: What's broken right now?
SELECT name, value, 'CRITICAL ERROR' as urgency 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```

```sql
-- Step 2: Disk space check (most common killer)
SELECT 
    database, table,
    formatReadableSize(sum(bytes_on_disk)) as size,
    count() as parts,
    CASE 
        WHEN sum(bytes_on_disk) > 15*1024*1024*1024*1024 THEN 'CRITICAL: Near 16TB limit'
        WHEN count() > 1000 THEN 'PARTS EXPLOSION'
        ELSE 'OK'
    END as status
FROM system.parts 
WHERE active=1 AND database NOT IN ('system')
GROUP BY database, table 
ORDER BY sum(bytes_on_disk) DESC;
```

```sql
-- Step 3: Replication disasters
SELECT 
    database, table, absolute_delay, queue_size,
    CASE 
        WHEN absolute_delay > 300 THEN 'CRITICAL: 5+ min lag'
        WHEN is_readonly = 1 THEN 'READ-ONLY ERROR'  
        ELSE 'OK'
    END as status
FROM system.replicas 
ORDER BY absolute_delay DESC;
```

```sql
-- Step 4: Kill resource hogs
SELECT query_id, user, elapsed, formatReadableSize(memory_usage) as memory,
       substring(query, 1, 80) as query_preview
FROM system.processes 
WHERE elapsed > 60 OR memory_usage > 4*1024*1024*1024
ORDER BY memory_usage DESC;

-- To kill: KILL QUERY WHERE query_id = 'paste_id_here';
```

```sql
-- Step 5: Stuck merges  
SELECT database, table, elapsed, progress, 
       CASE WHEN elapsed > 3600 AND progress < 0.1 THEN 'STUCK' ELSE 'OK' END
FROM system.merges 
ORDER BY elapsed DESC;
```

---

### Learning: Crisis Pattern Recognition {#crisis-patterns}

**Understand the failure modes with working examples:**

#### Memory Exhaustion Detection {#memory-exhaustion}

```sql runnable editable
-- Challenge: Try different cardinality combinations to see which ones are most dangerous
-- Experiment: Add SAMPLE 0.1 to this query if it's slow on large datasets
SELECT 
    'Memory Risk Analysis' as crisis_type,
    count() as total_events,
    uniq(actor_login, repo_name, event_type) as unique_combinations,
    round(uniq(actor_login, repo_name, event_type) / count() * 100, 2) as cardinality_percent,
    CASE 
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.9 
        THEN 'CRITICAL: Nearly every row unique - will exhaust memory!'
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.5 
        THEN 'HIGH RISK: Too many unique groups'
        ELSE 'SAFE: Reasonable aggregation ratio'
    END as memory_risk_level
FROM github.github_events 
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
LIMIT 1;
```

#### Bad Data Detection {#bad-data-detection}

```sql runnable editable
-- Challenge: Modify the year thresholds (2010, 2030) based on your expected data ranges
-- Experiment: Try different time ranges to see what suspicious data patterns emerge
SELECT 
    'Data Quality Check' as analysis,
    data_year,
    count() as events,
    CASE 
        WHEN data_year < 2010 THEN 'BAD: Suspiciously old timestamps'
        WHEN data_year > 2030 THEN 'BAD: Far future timestamps'  
        ELSE 'NORMAL'
    END as data_quality
FROM (
    SELECT toYear(created_at) as data_year
    FROM github.github_events 
    WHERE created_at >= '2020-01-01'
)
GROUP BY data_year
ORDER BY data_year DESC;
```

---

### The 2AM Methodology {#crisis-methodology}

**Follow this exact sequence when everything is broken:**

#### **Phase 1: Immediate Triage (30 seconds)**
1. Run `system.errors` - any non-zero = active crisis
2. Check disk space - *"It took us from 12 to 4 AM... it was as simple as low disk"*
3. Look for replication lag > 5 minutes

#### **Phase 2: Resource Investigation (2 minutes)** 
4. Find memory-hungry queries in `system.processes`
5. Check for stuck merges running >1 hour
6. Kill obviously problematic queries

#### **Phase 3: Data Quality Check (5 minutes)**
7. Look for bad partitions (1998, 2050 dates)
8. Check for parts explosion (>1000 parts per table)

### Emergency Actions Reference {#emergency-actions}

**Production-tested solutions:**

| Problem | Detection Query | Solution |
|---------|-----------------|----------|
| **Memory OOM** | `SELECT * FROM system.processes WHERE memory_usage > 8GB` | Enable `external_aggregation=1` |
| **Disk Full** | `SELECT sum(bytes_on_disk) FROM system.parts` | Delete old partitions, expand disk |
| **Replication Lag** | `SELECT * FROM system.replicas WHERE absolute_delay > 300` | Check network, restart lagging replica |
| **Stuck Query** | `SELECT * FROM system.processes WHERE elapsed > 300` | `KILL QUERY WHERE query_id = '...'` |
| **Parts Explosion** | `SELECT count() FROM system.parts WHERE active=1` | Enable async_insert, increase batch sizes |

**The golden rule:** *"Problems very rarely just pop out of nowhere there are signs... investigate before it goes from 15 milliseconds to 30 seconds"*

### Community War Stories & Lessons {#war-stories}

**Disk Space Disasters:**
- *"Default AWS EBS limit of 16TB hits you when you least expect it"*
- *"Other nodes keep sending data to the full node creating cascading failure"*

**Memory Exhaustion:**  
- *"Out of memory typically appears when you have a big aggregation with a lot of keys"*
- *"Enable external aggregation - query will be slower but won't crash"*

**Bad Data:**
- *"Developers send data from 1998 or 2050 causing partition chaos"*
- *"Always validate timestamps before they hit production"*

The key insight: **Most 2AM disasters are preventable** if you recognize the warning signs and have ready-to-use diagnostic queries.

## Breaking the Rules: Success Stories {#breaking-the-rules}

### ClickHouse as Rate Limiter (Craigslist Story) {#clickhouse-rate-limiter}

**Conventional wisdom:** Use Redis for rate limiting.

**Craigslist's breakthrough:** *"Everyone uses Redis for rate limiter implementations... Why not just do it in Redis?"*

**The problem with Redis:** *"Our experience with Redis is not like what you've seen in the movies... weird maintenance issues... we will reboot a node in a Redis cluster and some weird latency spike hits the front end"*

**Test rate limiting logic using ClickHouse approach:**

```sql runnable editable
-- Challenge: Try different rate limit thresholds (100, 50) or time windows (hour vs minute)
-- Experiment: Test with different user patterns by changing the HAVING clause
SELECT 
    actor_login as user_id,
    toStartOfHour(created_at) as hour,
    count() as requests_per_hour,
    CASE 
        WHEN count() > 100 THEN 'RATE_LIMITED'
        WHEN count() > 50 THEN 'WARNING' 
        ELSE 'ALLOWED'
    END as rate_limit_status
FROM github.github_events 
WHERE created_at >= '2024-01-15'
  AND created_at < '2024-01-16'
GROUP BY actor_login, hour
HAVING count() > 10
ORDER BY requests_per_hour DESC
LIMIT 20;
```

**Results:** *"Running untouched for nearly a year without any alert"* - a dramatic improvement over Redis infrastructure.

**Why it works:**
- Incredible write performance for access log data
- Built-in TTL for automatic cleanup  
- SQL flexibility for complex rate limiting rules
- No Redis cluster maintenance headaches

---

### Mobile Analytics: The 7-Eleven Success Story {#mobile-analytics}

**Conventional wisdom:** Analytics databases aren't for mobile applications.

**The reality:** *"People out in the factory floors... people out in health care facilities construction sites... they like to be able to look at reports... to sit at a computer at a desktop... is just not optimal"*

**7-Eleven's breakthrough:** Store managers using ClickHouse-powered analytics on mobile devices.

```sql runnable editable
-- Challenge: Modify this to show weekly or monthly patterns instead of daily
-- Experiment: Add different metrics like peak activity hours or user retention patterns
SELECT 
    'Daily Sales Summary' as report_type,
    toDate(created_at) as date,
    count() as total_transactions,
    uniq(actor_login) as unique_customers,
    round(count() / uniq(actor_login), 1) as avg_transactions_per_customer,
    'Perfect for mobile dashboard' as mobile_optimized
FROM github.github_events 
WHERE created_at >= today() - 7
GROUP BY date
ORDER BY date DESC;
```

**The use case:** *"The person who runs a store they're going back and forth between the stock room out to the front into the register and then going between stores"*

**Success metrics:**
- Daily sales by store (corporate + franchise)
- Out-of-stock alerts in real-time
- *"Full feature capability between your phone and your desktop"*

---

### Customer-Facing Real-Time Applications {#customer-facing-applications}

**Conventional wisdom:** ClickHouse is for internal analytics, not customer-facing apps.

**ServiceNow's reality:** *"We offer an analytic solution both for internal needs and for customers across web mobile and chatbots"*

**The breakthrough insight:** *"It enables you to build applications that are highly responsive... customer facing applications... whether they're web apps or mobile apps"*

```sql runnable editable
-- Challenge: Try different segmentation approaches like geographic or time-based grouping  
-- Experiment: Add percentage calculations or ranking functions for customer insights
SELECT 
    'Customer Segmentation' as feature,
    event_type as segment,
    count() as segment_size,
    round(count() * 100.0 / sum(count()) OVER(), 1) as percentage,
    'Real-time customer insights' as value_proposition
FROM github.github_events 
WHERE created_at >= '2024-01-01'
  AND created_at < '2024-01-02'
GROUP BY event_type
ORDER BY segment_size DESC;
```

**Why this breaks conventional rules:**
- **Real-time customer segmentation:** *"Give customers the ability to real-time segments the data and dynamically slicing"*
- **User expectations:** *"In 2024 we have been very much trained to expect a certain degree of responsiveness"* 
- **Retention impact:** *"If that repeats often enough you're either not going to come back"*

**Success pattern:** ClickHouse's speed enables customer-facing applications with sub-second response times, challenging the notion that analytical databases are only for internal use.

---

### The Rule-Breaking Philosophy

**Common thread:** These successes came from questioning assumptions:
- *"I asked my boss like what do you think of this idea maybe I can try this with ClickHouse"* - Craigslist
- *"Mobile first actually became a big part of how we thought about this"* - Mobile analytics pioneers  
- *"We wanted to give customers the ability to... slice and dice everything as much as they wanted"* - ServiceNow

**The lesson:** Sometimes the "wrong" tool for the job becomes the right tool when you understand its strengths and design around them.

---

*This interactive guide represents collective wisdom from hundreds of production deployments. Each runnable example helps you understand ClickHouse patterns using real GitHub events data - practice these concepts to avoid common mistakes and accelerate your success.*

**How to use this guide:**
1. **Run the examples** - All SQL blocks marked `runnable editable` are executable
2. **Experiment freely** - Modify queries to test different patterns
3. **Adapt to your data** - Use templates with your own table names  
4. **Monitor regularly** - Implement health check queries as ongoing monitoring
5. **Learn progressively** - Start with basics, advance to optimization patterns

**Interactive Features:**
- **Real Data Examples**: Using actual GitHub events from ClickHouse playground
- **Production-Ready Templates**: Adapt examples for your production systems
- **Progressive Difficulty**: From basic concepts to advanced optimization
- **Emergency Procedures**: Ready-to-use debugging and recovery queries

**Last Updated:** Based on community meetup insights through 2024-2025  
**Contributing:** Found a mistake or have a new lesson? Community contributions welcome