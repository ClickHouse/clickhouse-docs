---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Too many parts'
doc_type: 'guide'
keywords: [
  'clickhouse too many parts',
  'too many parts error',
  'clickhouse insert batching',
  'part explosion problem',
  'clickhouse merge performance',
  'batch insert optimization',
  'clickhouse async inserts',
  'small insert problems',
  'clickhouse parts management',
  'insert performance optimization',
  'clickhouse batching strategy',
  'database insert patterns'
]
title: 'Lessons - Too Many Parts Problem'
description: 'Solutions and prevention of Too Many Parts'
---

# The too many parts problem {#the-too-many-parts-problem}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Need more performance optimization tips? Check out the [Performance Optimization](./performance-optimization.md) community insights guide.*

## Understanding the problem {#understanding-the-problem}

ClickHouse will throw a "Too many parts" error to prevent severe performance degradation. Small parts cause multiple issues: poor query performance from reading and merging more files during queries, increased memory usage since each part requires metadata in memory, reduced compression efficiency as smaller data blocks compress less effectively, higher I/O overhead from more file handles and seek operations, and slower background merges giving the merge scheduler more work.

**Related Docs**
- [MergeTree Engine](/engines/table-engines/mergetree-family/mergetree)
- [Parts](/parts)
- [Parts System Table](/operations/system-tables/parts)

## Recognize the problem early {#recognize-parts-problem}

This query monitors table fragmentation by analyzing part counts and sizes across all active tables. It identifies tables with excessive or undersized parts that may need merge optimization. Use this regularly to catch fragmentation issues before they impact query performance.

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

## Video Sources {#video-sources}

- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) - ClickHouse team member explains async inserts and the too many parts problem
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) - Real-world batching strategies from observability platforms