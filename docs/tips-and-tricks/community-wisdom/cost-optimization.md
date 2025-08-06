---
sidebar_position: 1
slug: /community-wisdom/cost-optimization
sidebar_label: 'Performance Optimization'
keywords: [
  'cost optimization',
  'storage costs', 
  'partition management',
  'data retention',
  'storage analysis',
  'database optimization',
  'clickhouse cost reduction',
  'storage hot spots',
  'ttl performance',
  'disk usage',
  'compression strategies',
  'retention analysis'
]
title: 'Lessons - Cost Optimization'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# Cost Optimization: Battle-Tested Strategies {#cost-optimization}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Want to learn about creative use cases for ClickHouse? Check out the [Creative Use Cases](./creative-usecases.md) community insights guide.*

## The Partition Deletion vs TTL Discovery {#partition-vs-ttl}

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

## Storage Hot Spots Analysis {#storage-hot-spots}

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

## Cost-Driven Retention Analysis {#cost-driven-retention}

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

## How to Use This Guide {#how-to-use-guide}

*This interactive guide represents collective wisdom from hundreds of production deployments. Each runnable example helps you understand ClickHouse patterns using real GitHub events data - practice these concepts to avoid common mistakes and accelerate your success.*
