---
slug: /troubleshooting/error-codes/396_TOO_MANY_ROWS_OR_BYTES
sidebar_label: '396 TOO_MANY_ROWS_OR_BYTES'
doc_type: 'reference'
keywords: ['error codes', 'TOO_MANY_ROWS_OR_BYTES', '396']
title: '396 TOO_MANY_ROWS_OR_BYTES'
description: 'ClickHouse error code - 396 TOO_MANY_ROWS_OR_BYTES'
---

# Error Code 396: TOO_MANY_ROWS_OR_BYTES

:::tip
This error occurs when query results exceed limits set by `max_result_rows` or `max_result_bytes` settings.
It's a safety mechanism to prevent queries from consuming excessive memory or network bandwidth when returning large result sets.
:::

**Error Message Format:**

```
Code: 396. DB::Exception: Limit for result exceeded, max bytes: X MiB, current bytes: Y MiB. (TOO_MANY_ROWS_OR_BYTES)
```

or

```
Code: 396. DB::Exception: Limit for result exceeded, max rows: X thousand, current rows: Y thousand. (TOO_MANY_ROWS_OR_BYTES)
```

### When you'll see it

1. **Large query results:**
   - When a `SELECT` query returns more rows than `max_result_rows` (default: unlimited in self-hosted, varies in ClickHouse Cloud)
   - When result size exceeds `max_result_bytes` limit

2. **LowCardinality columns:**
   - With `LowCardinality` columns, even small row counts can trigger this error
   - LowCardinality dictionaries add significant overhead to result size
   - A query returning 209 rows can exceed 10MB due to dictionary metadata

3. **HTTP interface queries:**
   - Particularly common when using SQL Console or HTTP clients
   - ClickHouse Cloud SQL Console sets `result_overflow_mode=break` by default

4. **Settings profiles:**
   - When organization/user settings profiles enforce restrictive result limits
   - Default limits may be set at the profile level for resource control

### Potential causes

1. **Queries returning too many rows** - The query legitimately returns more data than allowed by `max_result_rows`

2. **LowCardinality overhead** - Using `LowCardinality` columns with small fixed-size types causes dictionary metadata to inflate result size unexpectedly

3. **Restrictive profile settings** - Settings profiles (in ClickHouse Cloud or user profiles) enforce low limits like:

   ```sql
   max_result_rows = 1000
   max_result_bytes = 10000000  -- 10MB
   result_overflow_mode = 'throw'
   ```

4. **Query cache incompatibility** - Since ClickHouse 24.9+, using `use_query_cache = true` with `result_overflow_mode != 'throw'` triggers error 731, but older configurations may still hit error 396

5. **Missing ORDER BY optimization** - Queries without `ORDER BY` may hit the limit, while adding `ORDER BY` allows the query to succeed (query execution differences)

### Quick fixes

**1. Increase result limits:**

```sql
-- For your current session
SET max_result_rows = 0;  -- Unlimited rows
SET max_result_bytes = 0;  -- Unlimited bytes

-- For specific query
SELECT * FROM large_table
SETTINGS max_result_rows = 100000, max_result_bytes = 100000000;
```

**2. Use `result_overflow_mode = 'break'` to get partial results:**

```sql
-- Returns partial results when limit is reached
SELECT * FROM table
SETTINGS result_overflow_mode = 'break',
         max_result_rows = 10000;
```

:::warning
In ClickHouse 24.9+, `result_overflow_mode = 'break'` is **incompatible** with query cache
:::

```sql
-- This will fail with error 731 in 24.9+
SELECT * FROM table
SETTINGS use_query_cache = true, result_overflow_mode = 'break';  -- Error!

-- Solution: Use 'throw' mode with query cache
SELECT * FROM table
SETTINGS use_query_cache = true, result_overflow_mode = 'throw';
```

**3. Optimize LowCardinality usage:**

```sql
-- Check if LowCardinality is causing bloat
SELECT name, type FROM system.columns
WHERE table = 'your_table' AND type LIKE '%LowCardinality%';

-- Consider removing LowCardinality for small fixed-size types
ALTER TABLE your_table MODIFY COLUMN col String;  -- Remove LowCardinality
```

**4. Use pagination with LIMIT/OFFSET:**

```sql
-- Fetch results in chunks
SELECT * FROM large_table ORDER BY id LIMIT 10000 OFFSET 0;
SELECT * FROM large_table ORDER BY id LIMIT 10000 OFFSET 10000;
```

**5. Modify settings profile (ClickHouse Cloud):**

```sql
-- Check current profile settings
SELECT name, value FROM system.settings
WHERE name IN ('max_result_rows', 'max_result_bytes', 'result_overflow_mode');

-- Modify profile (requires admin)
ALTER SETTINGS PROFILE your_profile SETTINGS
    max_result_rows = 0,
    max_result_bytes = 0,
    result_overflow_mode = 'throw';
```

**6. For HTTP/JDBC clients - pass settings in connection:**

```bash
# HTTP with URL parameters
curl "https://your-host:8443/?max_result_rows=0&max_result_bytes=0" \
  -d "SELECT * FROM table"

# JDBC connection string
jdbc:clickhouse://host:port/database?max_result_rows=0&max_result_bytes=0
```

### Important notes

- **Cloud SQL Console behavior:** ClickHouse Cloud SQL Console automatically sets `result_overflow_mode=break` and `max_result_rows=500000` in HTTP query parameters

- **LowCardinality overhead:** When using `LowCardinality`, dictionary metadata is sent with each data block, which can cause unexpected size bloat:
   - 209 rows × 1 column can exceed 10MB limit
   - 110 rows can require 979MB due to dictionary overhead
   - Solution: Remove `LowCardinality` or increase `max_result_bytes`

- **Setting precedence:** Settings passed in query parameters override profile settings, but profile settings apply if not explicitly overridden

- **`result_overflow_mode` behavior:**
   - `'throw'` (default): Throws exception when limit exceeded
   - `'break'`: Returns partial results (incompatible with query cache in 24.9+)
   - Using `'break'` provides no indication that results were truncated

- **Version compatibility:** The query cache + overflow mode restriction was introduced in ClickHouse 24.9.

### Related documentation

- [`max_result_rows` setting](/operations/settings/settings#max_result_rows)
- [`max_result_bytes` setting](/operations/settings/settings#max_result_bytes)
- [`result_overflow_mode` setting](/operations/settings/settings#result_overflow_mode)
- [Query complexity settings](/operations/settings/query-complexity)
- [LowCardinality data type](/sql-reference/data-types/lowcardinality)