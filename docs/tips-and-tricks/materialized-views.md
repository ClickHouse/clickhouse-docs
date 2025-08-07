---
sidebar_position: 1
slug: /tips-and-tricks/materialized-views
sidebar_label: 'Materialized Views'
doc_type: 'how-to-guide'
keywords: [
  'clickhouse materialized views',
  'materialized view optimization',
  'materialized view storage issues',
  'materialized view best practices',
  'database aggregation patterns',
  'materialized view anti-patterns',
  'storage explosion problems',
  'materialized view performance',
  'database view optimization',
  'aggregation strategy',
  'materialized view troubleshooting',
  'view storage overhead'
]
title: 'Lessons - Materialized Views'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# Materialized Views: The Double-Edged Sword {#materialized-views-the-double-edged-sword}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Too many parts bogging your database down? Check out the [Too Many Parts](./too-many-parts.md) community insights guide.*
*Learn more about [Materialized Views](/materialized-views)*

**Community warning from real production incidents:** Teams get *"over enthusiastic about materialized views and we end up creating too many of them and that kind of slows down... our injection as well"*

## The 10x Storage Anti-Pattern {#storage-antipattern}

**Real production problem:** *"We had a materialized view... the raw log table was around 20 gig but the view from that log table got exploded to 190 gig so almost 10x the size of the raw table... this happened because... we were creating one row per attribute and each log can have 10 attributes"*

**Rule:** If your GROUP BY creates more rows than it eliminates, you're building an expensive index, not a materialized view.

## Production MV Health Validation {#mv-health-validation}

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
        WHEN uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() > 0.95 THEN 'PROBLEM: MV will be larger than source!'
        WHEN uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() > 0.7 THEN 'BAD: Massive storage waste (190GB scenario)'
        WHEN uniq(pickup_datetime, dropoff_datetime, passenger_count) / count() > 0.3 THEN 'QUESTIONABLE: High storage overhead'
        ELSE 'GOOD: Substantial aggregation benefit'
    END as mv_assessment
FROM nyc_taxi.trips
WHERE pickup_datetime >= '2015-01-01' 
  AND pickup_datetime < '2015-01-02'
LIMIT 1;
```

## The Successful MV Patterns {#successful-mv-patterns}

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

## Recovery Strategy for Over-Enthusiastic MV Usage {#mv-recovery-strategy}

**From companies that fixed their MV problems:**

*"One thing we did was remove the Mater if you have lot of materialized views remove the selected materialized views and create the tables for them instead... we create the tables and then run periodically run a cron job to populate those tables instead of relying materialized views"*

**Decision Framework:**
- **Keep MV:** Query frequency × speed improvement > storage cost × maintenance overhead
- **Replace with cron:** Aggregations that are *"not very critical like if you have a 5 minute aggregation 1 hour aggregation already created... maybe it can wait"*
