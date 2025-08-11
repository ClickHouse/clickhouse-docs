---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Too Many Parts'
doc_type: 'how-to'
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

# The Too Many Parts Problem {#the-too-many-parts-problem}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Need more performance optimization tips? Check out the [Performance Optimization](./performance-optimization.md) community insights guide.*

**Universal pain point:** Small frequent inserts create performance degradation through part explosion.

## Recognize the Problem Early {#recognize-parts-problem}

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

## Proper Insert Batching {#proper-insert-batching}

**Community-proven batching strategy from production deployments:**

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

*"We developed a function called async insert... this mechanism is straightforward similar to buffer table we insert to the server side and use some buffer to collect these inserts by default we have 16 threads to collect this buffer and if the buffer is large enough or reach timeout we will flush the buffer to the storage so a part will contain multiple inserts"* - ClickHouse team explaining built-in solution

```sql
-- Enable async inserts to automatically batch small inserts
SET async_insert = 1;
SET wait_for_async_insert = 1;  -- For consistency guarantees
SET async_insert_max_data_size = 10485760;  -- 10MB buffer size
SET async_insert_busy_timeout_ms = 30000;   -- 30 second timeout
```

## Related Video Resources

**📺 Essential Too Many Parts Videos:**
- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) - ClickHouse team member explains async inserts and the too many parts problem
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) - Real-world batching strategies from observability platforms