---
sidebar_position: 1
slug: /tips-and-tricks/materialized-views
sidebar_label: 'Materialized Views'
doc_type: 'how-to'
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
title: 'Lessons - materialized views'
description: 'Real world examples of materialized views, problems and solutions'
---

# Materialized views: the double-edged sword {#materialized-views-the-double-edged-sword}

*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Too many parts bogging your database down? Check out the [Too Many Parts](./too-many-parts.md) community insights guide.*
*Learn more about [Materialized Views](/materialized-views).*

## The 10x storage anti-pattern {#storage-antipattern}

**Real production problem:** *"We had a materialized view. The raw log table was around 20 gig but the view from that log table exploded to 190 gig, so almost 10x the size of the raw table. This happened because we were creating one row per attribute and each log can have 10 attributes."*

**Rule:** If your `GROUP BY` creates more rows than it eliminates, you're building an expensive index, not a materialized view.

## Production materialized view health validation {#mv-health-validation}

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

## The successful materialized view patterns {#successful-mv-patterns}

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

## When materialized views become a problem {#mv-problems}

**Common mistake:** Teams create too many materialized views and hurt insert performance.

**Simple fix:** Replace non-critical MVs with regular tables populated by cron jobs. You get the same query benefits without slowing down inserts.

**Which MVs to remove:** Start with redundant time windows (like 2-hour aggregations when you already have 1-hour) and low-frequency queries.

## Video sources {#video-sources}
- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - Source of the "over enthusiastic about materialized views" and "20GB→190GB explosion" case study