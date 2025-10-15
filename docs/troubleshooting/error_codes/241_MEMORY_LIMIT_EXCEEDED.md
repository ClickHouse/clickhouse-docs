---
slug: /troubleshooting/error-codes/241_MEMORY_LIMIT_EXCEEDED
sidebar_label: '241 MEMORY_LIMIT_EXCEEDED'
doc_type: 'reference'
keywords: ['error codes', 'MEMORY_LIMIT_EXCEEDED', '241']
title: '241 MEMORY_LIMIT_EXCEEDED'
description: 'ClickHouse error code - 241 MEMORY_LIMIT_EXCEEDED'
---

# Error 241: MEMORY_LIMIT_EXCEEDED

:::tip
This error occurs when a query or operation attempts to use more memory than the configured limits allow.
It indicates that ClickHouse's memory protection mechanisms have stopped the operation to prevent out-of-memory (OOM) conditions and system instability.
:::

## Most common causes {#most-common-causes}

1. **Query exceeds per-query memory limit**
    - Query using more than [`max_memory_usage`](/operations/settings/settings#max_memory_usage) setting
    - Large joins without proper filtering
    - Aggregations with too many distinct keys
    - Sorting very large result sets

2. **Total server memory exhausted**
    - Sum of all query memory exceeds [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage)
    - Too many concurrent memory-intensive queries
    - Background operations (merges, mutations) consuming memory
    - Memory fragmentation and retention

3. **Insufficient resources for workload**
    - Server RAM too small for data volume
    - Memory limits set too low for query patterns
    - Large tables with insufficient memory for operations

4. **Memory-intensive operations**
    - `GROUP BY` with high cardinality
    - `JOIN` operations on large tables
    - `DISTINCT` on millions/billions of rows
    - Window functions over large datasets
    - External sorting spilling to disk

5. **Background operations consuming memory**
    - Large merge operations
    - Mutations on large partitions
    - Multiple concurrent merges
    - Cleanup threads allocating memory

6. **Memory leaks or accumulation**
    - Old ClickHouse versions with memory leaks
    - Retained memory not being released
    - Memory fragmentation (high `retained` in jemalloc stats)

## Common solutions {#common-solutions}

**1. Check current memory limits**

```sql
-- View memory limit settings
SELECT 
    name,
    value,
    description
FROM system.settings
WHERE name LIKE '%memory%'
ORDER BY name;

-- Key settings to check:
-- max_memory_usage (per query limit)
-- max_memory_usage_for_user (per user limit)
-- max_server_memory_usage (total server limit)
```

**2. Increase memory limits (if appropriate)**

```sql
-- Increase per-query limit
SET max_memory_usage = 20000000000;  -- 20 GB

-- Increase for specific query
SELECT * FROM large_table
SETTINGS max_memory_usage = 50000000000;  -- 50 GB

-- For user
ALTER USER your_user SETTINGS max_memory_usage = 30000000000;
```

**3. Optimize the query**

```sql
-- Add WHERE clause to filter data early
SELECT * FROM table
WHERE date >= today() - INTERVAL 7 DAY;

-- Use LIMIT to reduce result size
SELECT * FROM table
ORDER BY id
LIMIT 100000;

-- Pre-aggregate before joining
SELECT a.id, COUNT(b.id)
FROM small_table a
LEFT JOIN (
    SELECT user_id, COUNT(*) as cnt
    FROM large_table
    GROUP BY user_id
) b ON a.id = b.user_id;
```

**4. Enable external aggregation/sorting**

```sql
-- Allow spilling to disk when memory limit approached
SET max_bytes_before_external_group_by = 20000000000;  -- 20 GB
SET max_bytes_before_external_sort = 20000000000;       -- 20 GB

-- This prevents memory errors by using disk when needed
```

**5. Reduce query concurrency**

```sql
-- Limit concurrent queries per user
SET max_concurrent_queries_for_user = 5;

-- Monitor current memory usage
SELECT 
    user,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    query
FROM system.processes
ORDER BY memory_usage DESC;
```

**6. Upgrade server memory (ClickHouse Cloud)**

For ClickHouse Cloud, if consistent memory issues:
- Upgrade to a larger instance tier
- Contact support to increase memory limits
- Consider horizontal scaling (add more replicas)

**7. Optimize table design**

```sql
-- Use appropriate codecs to reduce memory
CREATE TABLE optimized_table (
    id UInt64,
    name String CODEC(ZSTD),
    value Int64 CODEC(Delta, ZSTD)
) ENGINE = MergeTree()
ORDER BY id;

-- Use smaller data types where possible
-- UInt32 instead of UInt64, Date instead of DateTime when possible
```

## Common scenarios {#common-scenarios}

**Scenario 1: Query aggregating high-cardinality column**

```
Error: Memory limit (for query) exceeded: 
would use 10.50 GiB, maximum: 10.00 GiB
```

**Cause:** `GROUP BY` on column with millions of distinct values.

**Solution:**

```sql
-- Option 1: Increase limit
SET max_memory_usage = 20000000000;

-- Option 2: Enable external aggregation
SET max_bytes_before_external_group_by = 10000000000;

-- Option 3: Reduce cardinality
SELECT 
    toStartOfHour(timestamp) AS hour,  -- Instead of exact timestamp
    COUNT(*)
FROM table
GROUP BY hour;
```

**Scenario 2: Total server memory exceeded**

```
Error: Memory limit (total) exceeded: 
would use 66.23 GiB, maximum: 56.48 GiB
```

**Cause:** Too many concurrent queries or background operations.

**Solution:**
```sql
-- Check what's using memory
SELECT 
    query_id,
    user,
    formatReadableSize(memory_usage) AS memory,
    query
FROM system.processes
ORDER BY memory_usage DESC;

-- Kill memory-intensive queries if needed
KILL QUERY WHERE query_id = 'high_memory_query_id';

-- Reduce concurrent queries
SET max_concurrent_queries = 50;  -- Server config
```

**Scenario 3: Large JOIN operation**

```
Error: Memory limit exceeded while executing JOIN
```

**Cause:** Joining large tables without proper filtering.

**Solution:**

```sql
-- Add filters before JOIN
SELECT *
FROM table1 a
JOIN table2 b ON a.id = b.id
WHERE a.date >= today() - INTERVAL 1 DAY
  AND b.active = 1;

-- Or use appropriate JOIN algorithm
SELECT *
FROM large_table a
JOIN small_table b ON a.id = b.id
SETTINGS join_algorithm = 'hash';  -- or 'parallel_hash'
```

**Scenario 4: Background merge consuming memory**

```
Error: Memory limit (total) exceeded during merge operation
```

**Cause:** Large parts being merged consume significant memory.

**Solution:**

```sql
-- Check merge activity
SELECT *
FROM system.merges;

-- Adjust merge settings
SET max_bytes_to_merge_at_max_space_in_pool = 50000000000;  -- 50 GB

-- Or temporarily pause merges
SYSTEM STOP MERGES your_table;
-- Run query
-- SYSTEM START MERGES your_table;
```

**Scenario 5: Pod OOMKilled (ClickHouse Cloud)**

```
Pod terminated with OOMKilled status
```

**Cause:** Memory limit set too low for workload.

**Solution:**
- Upgrade to higher memory tier
- Request memory limit increase from support
- Optimize queries to use less memory
- Distribute load across more replicas
