---
sidebar_position: 1
slug: /tips-and-tricks/materialized-views
sidebar_label: 'Materialized views'
doc_type: 'guide'
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

# Materialized views: how they can become a double edged sword {#materialized-views-the-double-edged-sword}

*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Too many parts bogging your database down? Check out the [Too Many Parts](./too-many-parts.md) community insights guide.*
*Learn more about [Materialized Views](/materialized-views).*

## The 10x storage anti-pattern {#storage-antipattern}

**Real production problem:** *"We had a materialized view. The raw log table was around 20 gig but the view from that log table exploded to 190 gig, so almost 10x the size of the raw table. This happened because we were creating one row per attribute and each log can have 10 attributes."*

**Rule:** If your `GROUP BY` creates more rows than it eliminates, you're building an expensive index, not a materialized view.

## Production materialized view health validation {#mv-health-validation}

This query helps you predict whether a materialized view will compress or explode your data before you create it. Run it against your actual table and columns to avoid the "190GB explosion" scenario.

**What it shows:**
- **Low aggregation ratio** (\<10%) = Good MV, significant compression
- **High aggregation ratio** (\>70%) = Bad MV, storage explosion risk
- **Storage multiplier** = How much bigger/smaller your MV will be

```sql
-- Replace with your actual table and columns
SELECT 
    count() as total_rows,
    uniq(your_group_by_columns) as unique_combinations,
    round(uniq(your_group_by_columns) / count() * 100, 2) as aggregation_ratio
FROM your_table
WHERE your_filter_conditions;

-- If aggregation_ratio > 70%, reconsider your MV design
-- If aggregation_ratio < 10%, you'll get good compression
```

## When materialized views become a problem {#mv-problems}

**Warning signs to monitor:**
- Insert latency increases (queries that took 10ms now take 100ms+)
- "Too many parts" errors appearing more frequently 
- CPU spikes during insert operations
- Insert timeouts that didn't happen before

You can compare insert performance before and after adding MVs using `system.query_log` to track query duration trends.

## Video sources {#video-sources}
- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - Source of the "over enthusiastic about materialized views" and "20GB→190GB explosion" case study