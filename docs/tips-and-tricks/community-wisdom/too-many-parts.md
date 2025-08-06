---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Too Many Parts'
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
title: 'Lessons - Too Many Parts Problem'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# The Too Many Parts Problem {#the-too-many-parts-problem}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Need more performace optimization tips? Check out the [Performance Optimization](./performance-optimization.md) community insights guide.*

**Universal pain point:** Small frequent inserts create performance degradation through part explosion.

**Clear warnings from ClickHouse engineers and users:**
- *"If you are doing 100,000 inserts it is going to create 100,000 parts and behind the scenes over time click house is going to merge those parts... more parts you create the more meta work that you create for click house to merge"*
- *"If the inserts are too small we have another question that the background merging stress will not merge these small parts together in time then when the parts accumulating too many it will easy to get too many parts error which will slow down our writing throughput"*
- *"We encourage our users to insert the data in batches for example 20,000 rows at once"*

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
## How to Use This Guide {#how-to-use-guide}

*This interactive guide represents collective wisdom from hundreds of production deployments. Each runnable example helps you understand ClickHouse patterns using real GitHub events data - practice these concepts to avoid common mistakes and accelerate your success.*
