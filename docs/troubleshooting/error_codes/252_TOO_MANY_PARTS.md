---
slug: /troubleshooting/error-codes/252_TOO_MANY_PARTS
sidebar_label: '252 TOO_MANY_PARTS'
doc_type: 'reference'
keywords: ['error codes', 'TOO_MANY_PARTS', '252', 'merges', 'parts', 'partition']
title: '252 TOO_MANY_PARTS'
description: 'ClickHouse error code - 252 TOO_MANY_PARTS'
---

# Error 252: TOO_MANY_PARTS

:::tip
This error occurs when a table accumulates too many data parts, indicating that inserts are creating new parts faster than the background merge process can combine them. This is almost always caused by inserting data too frequently (many small inserts instead of fewer large batch inserts) or having an inappropriate partition key.
:::

## Quick reference {#quick-reference}

**What you'll see:**

```text
Code: 252. DB::Exception: Too many parts (300). Merges are processing significantly slower than inserts. 
(TOO_MANY_PARTS)
```

Or:

```text
Code: 252. DB::Exception: Too many parts (10004) in all partitions in total in table 'default.table_name'. 
This indicates wrong choice of partition key. The threshold can be modified with 'max_parts_in_total' setting.
(TOO_MANY_PARTS)
```

**Most common causes:**
1. **Too many small inserts** - Inserting data row-by-row or with very high frequency
2. **Wrong partition key choice** - Daily or hourly partitions creating thousands of partitions
3. **Merge process can't keep up** - Heavy queries blocking merge threads or insufficient resources
4. **Small insert batches** - Each insert creating a new part that needs merging

**Quick diagnostic:**

```sql
-- Check parts per partition
SELECT 
    partition,
    count() AS parts,
    sum(rows) AS rows,
    formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active AND table = 'your_table'
GROUP BY partition
ORDER BY parts DESC
LIMIT 10;

-- Check merge activity
SELECT 
    table,
    elapsed,
    progress,
    num_parts,
    result_part_name
FROM system.merges;
```

**Quick fixes:**

```sql
-- 1. Manually trigger merges
OPTIMIZE TABLE your_table FINAL;

-- 2. Temporarily increase limit (emergency only)
ALTER TABLE your_table 
MODIFY SETTING parts_to_throw_insert = 600;

-- 3. Check and kill heavy queries blocking merges
SELECT query_id, query, elapsed 
FROM system.processes 
WHERE elapsed > 300;

KILL QUERY WHERE query_id = 'problem-query-id';
```

**Long-term solution: Fix your insert pattern!**
- Batch inserts: 10K-500K rows per INSERT
- Frequency: 1 insert every 1-2 seconds (maximum)
- Use Buffer tables if you need more frequent small inserts
- Use [asynchronous inserts](/optimize/asynchronous-inserts)

## Most common causes {#most-common-causes}

### 1. **Too many small inserts (most common root cause)** {#too-many-small-inserts}

Each `INSERT` statement creates a new data part on disk. ClickHouse merges these parts in the background, but if you insert too frequently, parts accumulate faster than they can be merged.

**Examples of problematic patterns:**
- Row-by-row inserts (one INSERT per row)
- Inserts every second or multiple times per second
- Very small batches (< 1,000 rows per INSERT)
- Hundreds of concurrent INSERT queries

**Why this happens:**

A hypothetical example:

```text
Time    Inserts/sec    Parts Created    Parts Merged    Net Parts
0:00    100           100              10              +90
0:01    100           100              10              +180
0:02    100           100              10              +270
0:03    100           100              10              +360 -> Error!
```

### 2. **Inappropriate partition key** {#inappropriate-partition-key}

Using overly granular partition keys (daily, hourly, or by high-cardinality columns) creates too many partitions. Each partition has its own set of parts, multiplying the problem.

**Problematic partition keys:**
```sql
-- Daily partitions (creates 365+ partitions per year)
PARTITION BY toYYYYMMDD(date)

-- Hourly partitions (creates 8,760+ partitions per year)
PARTITION BY toYYYYMMDDhh(timestamp)

-- High-cardinality column
PARTITION BY user_id

-- Monthly partitions (recommended)
PARTITION BY toYYYYMM(date)

-- Or no partition at all
-- No PARTITION BY clause
```

### 3. **Merge process blocked or slowed** {#merge-process-blocked}

Merges can be prevented or slowed by:
- Heavy SELECT queries consuming all resources
- Insufficient CPU or disk I/O
- Mutations (ALTER operations) in progress
- Parts with different projections that can't be merged
- Maximum part size reached (parts won't merge further)

### 4. **Wrong table engine or settings** {#wrong-table-engine}

- Using special engines (AggregatingMergeTree, SummingMergeTree) with complex aggregations
- Very large ORDER BY keys causing slow merges
- `max_bytes_to_merge_at_max_space_in_pool` set too low
- Insufficient background merge threads

### 5. **Version-specific issues** {#version-specific-issues}

- **Projection mismatch**: Parts with different projection sets cannot be merged (see error: "Parts have different projection sets")
- **Small parts not merging**: Parts below minimum merge size threshold won't merge even when idle

---

## Common solutions {#common-solutions}

### **1. Fix your insert pattern (PRIMARY SOLUTION)** {#fix-insert-pattern}

This is the #1 fix for 99% of TOO_MANY_PARTS errors.

**Recommended insert pattern:**
- **Batch size**: 10,000 to 500,000 rows per INSERT
- **Frequency**: 1 INSERT every 1-2 seconds
- **Format**: Use bulk INSERT, not row-by-row

```python
# WRONG: Row-by-row inserts
for row in data:
    client.execute(f"INSERT INTO table VALUES ({row})")

# CORRECT: Batch inserts
batch_size = 50000
for i in range(0, len(data), batch_size):
    batch = data[i:i+batch_size]
    client.execute("INSERT INTO table VALUES", batch)
    time.sleep(1)  # 1 second delay between batches
```

```bash
# WRONG: Inserting files too quickly
for file in *.csv; do
    clickhouse-client --query="INSERT INTO table FORMAT CSV" < $file
done

# CORRECT: Add delays between inserts
for file in *.csv; do
    clickhouse-client --query="INSERT INTO table FORMAT CSV" < $file
    sleep 1
done
```

### **2. Use Buffer tables for high-frequency small inserts** {#use-buffer-tables}

If you cannot change your application to batch inserts, use a Buffer table to accumulate data in memory before flushing to disk.

```sql
-- Create the main table
CREATE TABLE main_table (
    timestamp DateTime,
    user_id UInt64,
    value Float64
) ENGINE = MergeTree()
ORDER BY (user_id, timestamp);

-- Create buffer table in front
CREATE TABLE buffer_table AS main_table
ENGINE = Buffer(
    currentDatabase(), main_table,
    16,  -- num_layers
    10,  -- min_time (seconds)
    100, -- max_time (seconds)
    10000,   -- min_rows
    1000000, -- max_rows
    10000000,    -- min_bytes
    100000000    -- max_bytes
);

-- Application inserts into buffer_table
INSERT INTO buffer_table VALUES (...);

-- Queries can read from buffer_table (includes both buffered and persisted data)
SELECT * FROM buffer_table;
```

**Buffer flushes when ANY condition is met:**
- Time: Every 10-100 seconds
- Rows: When 10,000-1,000,000 rows accumulated
- Bytes: When 10MB-100MB accumulated

### **3. Fix partition key (if applicable)** {#fix-partition-key}

```sql
-- Check current partitions
SELECT 
    partition,
    count() AS parts,
    formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active AND table = 'your_table'
GROUP BY partition
ORDER BY partition DESC
LIMIT 20;

-- If you see hundreds of partitions, you need to fix the partition key

-- Create new table with better partitioning
CREATE TABLE your_table_new AS your_table
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)  -- Monthly instead of daily
ORDER BY (user_id, date);

-- Copy data
INSERT INTO your_table_new SELECT * FROM your_table;

-- Swap tables
RENAME TABLE 
    your_table TO your_table_old,
    your_table_new TO your_table;

-- Drop old table after verification
DROP TABLE your_table_old;
```

### **4. Manually trigger merges (emergency fix)** {#manually-trigger-merges}

```sql
-- Force merge all parts in a table
OPTIMIZE TABLE your_table FINAL;

-- For large tables, optimize specific partitions
OPTIMIZE TABLE your_table PARTITION '202410' FINAL;

-- On clusters
OPTIMIZE TABLE your_table ON CLUSTER 'cluster_name' FINAL;
```

:::warning
`OPTIMIZE TABLE FINAL` can be resource-intensive and block inserts.
Use during low-traffic periods.
:::

### **5. Temporarily increase limits (emergency only - not a real fix)** {#temporarily-increase-limits}

```sql
-- Increase per-partition limit
ALTER TABLE your_table 
MODIFY SETTING parts_to_throw_insert = 600;  -- Default: 300

-- Increase total parts limit
ALTER TABLE your_table 
MODIFY SETTING max_parts_in_total = 20000;  -- Default: 10000

-- Increase delay threshold
ALTER TABLE your_table 
MODIFY SETTING parts_to_delay_insert = 300;  -- Default: 150
```

:::warning
This is **not** a solution, it only buys time.
You must fix the root cause (insert pattern or partition key).
:::

### **6. Check for blocking merges** {#check-blocking-merges}

```sql
-- Check if merges are running
SELECT 
    database,
    table,
    elapsed,
    progress,
    num_parts,
    total_size_bytes_compressed,
    result_part_name,
    merge_type
FROM system.merges;

-- Check for stuck mutations
SELECT 
    database,
    table,
    mutation_id,
    command,
    create_time,
    is_done,
    latest_failed_part,
    latest_fail_reason
FROM system.mutations
WHERE is_done = 0;

-- Check merge thread activity
SELECT *
FROM system.metrics
WHERE metric LIKE '%Merge%' OR metric LIKE '%BackgroundPool%';
```

### **7. Increase merge capacity** {#increase-merge-capacity}

```xml
<!-- In config.xml -->
<merge_tree>
    <!-- More threads for merges -->
    <max_bytes_to_merge_at_max_space_in_pool>161061273600</max_bytes_to_merge_at_max_space_in_pool>
    
    <!-- More concurrent merge tasks -->
    <background_pool_size>16</background_pool_size>
</merge_tree>
```

For ClickHouse Cloud users, contact support to adjust these settings.

## Prevention tips {#prevention-tips}

1. **Understand the parts model**: Every INSERT creates a new part. ClickHouse merges parts in the background. If inserts > merges, parts accumulate.

2. **Follow the golden rule**: **One INSERT every 1-2 seconds, containing 10K-500K rows**.

3. **Use appropriate partition keys**:
   - Most tables: Monthly partitions or no partition
   - Very large tables (> 1TB): Monthly is fine
   - Don't partition by high-cardinality columns
   - Guideline: < 1,000 total partitions

4. **Use Buffer tables** if your application requires high-frequency small inserts.

5. **Monitor parts regularly**:

   ```sql
   -- Daily monitoring query
   SELECT 
       database,
       table,
       count() AS parts,
       max(modification_time) AS latest_insert
   FROM system.parts
   WHERE active
   GROUP BY database, table
   HAVING parts > 100
   ORDER BY parts DESC;
   ```

6. **Avoid inserting to too many partitions at once**: A single INSERT that touches > 100 partitions will be rejected (`max_partitions_per_insert_block`).

7. **Test your workload**: Before going to production, test your insert pattern to ensure merges keep up.

8. **Scale appropriately**: If you legitimately need more than 500K rows/second, you need a distributed cluster, not setting adjustments.

## Understanding ClickHouse parts {#understanding-parts}

**What is a "part"?**

A part is a directory on disk containing:
- One file per column (data + compressed)
- Index files
- Metadata files

**Example:**

```text
/var/lib/clickhouse/data/default/my_table/
├── 202410_1_1_0/    <- Part 1
├── 202410_2_2_0/    <- Part 2
├── 202410_3_3_0/    <- Part 3
└── 202410_1_3_1/    <- Merged part (contains parts 1, 2, 3)
```

**The merge lifecycle:**
1. Each INSERT creates a new part
2. Background threads select parts to merge based on size and age
3. Merged part replaces original parts
4. Old parts are deleted after a delay

**Why too many parts is bad:**
- Slow SELECT queries (must read from many files)
- Slow server startup (must enumerate all parts)
- Filesystem limits (too many inodes)
- Memory pressure (tracking metadata for each part)

**Settings that control parts:**
- `parts_to_delay_insert`: 150 (default) - Start slowing down inserts
- `parts_to_throw_insert`: 300 (default per-partition) - Throw error
- `max_parts_in_total`: 10,000 (default) - Total across all partitions

## Debugging steps {#debugging-steps}

### **1. Identify which table and partition** {#identify-table-partition}

```sql
-- Find tables with most parts
SELECT 
    database,
    table,
    count() AS total_parts,
    countIf(active) AS active_parts
FROM system.parts
GROUP BY database, table
ORDER BY active_parts DESC
LIMIT 10;

-- Find partitions with most parts
SELECT 
    database,
    table,
    partition,
    count() AS parts,
    sum(rows) AS rows,
    formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active
GROUP BY database, table, partition
HAVING parts > 50
ORDER BY parts DESC
LIMIT 20;
```

### **2. Check recent insert patterns** {#check-insert-patterns}

```sql
-- Analyze recent inserts
SELECT 
    toStartOfMinute(event_time) AS minute,
    count() AS num_inserts,
    sum(read_rows) AS total_rows,
    avg(read_rows) AS avg_rows_per_insert
FROM system.query_log
WHERE type = 'QueryFinish'
  AND query_kind = 'Insert'
  AND event_time > now() - INTERVAL 1 HOUR
GROUP BY minute
ORDER BY minute DESC
LIMIT 20;
```

### **3. Check merge activity** {#check-merge-activity}

```sql
-- Current merges
SELECT * FROM system.merges;

-- Recent merge history
SELECT 
    event_time,
    duration_ms,
    table,
    partition_id,
    rows_read,
    bytes_read_uncompressed,
    peak_memory_usage
FROM system.part_log
WHERE event_type = 'MergeParts'
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 20;

-- Check for merge failures
SELECT 
    event_time,
    table,
    error,
    exception
FROM system.part_log
WHERE event_type = 'MergeParts'
  AND error > 0
ORDER BY event_time DESC
LIMIT 10;
```

### **4. Identify blocking issues** {#identify-blocking-issues}

```sql
-- Check for parts that can't merge due to projection differences
-- Look in system.text_log for messages like:
-- "Can't merge parts ... Parts have different projection sets"

SELECT 
    event_time,
    message
FROM system.text_log
WHERE message LIKE '%Can''t merge parts%'
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 20;
```

## Related error codes {#related-error-codes}

- [Error 241: `MEMORY_LIMIT_EXCEEDED`](/troubleshooting/error-codes/241_MEMORY_LIMIT_EXCEEDED) - Often related, heavy merges consuming memory
- [Error 242: `TABLE_IS_READ_ONLY`](/troubleshooting/error-codes/242_TABLE_IS_READ_ONLY) - Can prevent merges from running
