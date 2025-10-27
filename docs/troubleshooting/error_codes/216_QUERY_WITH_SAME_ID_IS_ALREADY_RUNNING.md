---
slug: /troubleshooting/error-codes/216_QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING
sidebar_label: '216 QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING'
doc_type: 'reference'
keywords: ['error codes', 'QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING', '216', 'query_id', 'duplicate']
title: '216 QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING'
description: 'ClickHouse error code - 216 QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING'
---

# Error 216: QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING

:::tip
This error occurs when you attempt to execute a query with a `query_id` that is already in use by a currently running query.
ClickHouse enforces unique query IDs to prevent duplicate execution and enable proper query tracking, cancellation, and monitoring.
:::

## Quick reference {#quick-reference}

**What you'll see:**

```text
Code: 216. DB::Exception: Query with id = ca038ba5-bcdc-4b93-a857-79b066382917 is already running. 
(QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING)
```

**Most common causes:**
1. Reusing the same static `query_id` for multiple concurrent queries
2. Retry logic that doesn't regenerate the `query_id`
3. Insufficient randomness in multi-threaded ID generation
4. **Known bug in ClickHouse 25.5.1** (queries execute twice internally)
5. Previous query still running when retry is attempted

**Quick fixes:**

```sql
-- ❌ Don't reuse the same query_id
SELECT * FROM table SETTINGS query_id = 'my-static-id';
-- Running again immediately causes error 216

-- ✅ Fix 1: Generate unique query IDs with UUID
SELECT * FROM table SETTINGS query_id = concat('query-', toString(generateUUIDv4()));

-- ✅ Fix 2: Add high-precision timestamp
SELECT * FROM table SETTINGS query_id = concat('query-', toString(now64(9)));

-- ✅ Fix 3: Let ClickHouse auto-generate (recommended)
SELECT * FROM table;  -- No query_id setting
```

**For application code:**

```python
# Python - use UUID
import uuid
query_id = str(uuid.uuid4())
client.execute(sql, query_id=query_id)

# Java - use UUID
String queryId = UUID.randomUUID().toString();
response = client.query(sql, queryId).execute();
```

## Most common causes {#most-common-causes}

1. **Reusing static query IDs in application code**
   - Hardcoded query IDs like `'my-query'` or `'daily-report'`
   - Using the same ID for multiple concurrent requests
   - Application frameworks generating non-unique IDs
   - Pattern: `query_id = 'app-name-' + request_type` without uniqueness

2. **Client retry logic without ID regeneration**
   - Automatic retry on network timeout reusing the same `query_id`
   - Previous query still running when retry is attempted
   - Connection pools executing queries with duplicate IDs
   - Load balancers distributing the same request to multiple servers

3. **Insufficient randomness in multi-threaded applications**
   - Using `UUID + ":" + random(0, 100)` doesn't provide enough uniqueness
   - Timestamp-based IDs without sufficient precision (seconds instead of nanoseconds)
   - Multiple threads generating IDs simultaneously without proper coordination
   - Example that fails: `query_id = f"{uuid.uuid4()}:{random.randint(0, 100)}"`

4. **Version-specific regression (25.5.1)**
   - **ClickHouse 25.5.1 has a critical bug** where queries execute twice internally
   - Single client request results in two `executeQuery` log entries milliseconds apart
   - First execution succeeds, second fails with error 216
   - Affects almost all queries with custom `query_id` in 25.5.1
   - **Workaround**: Downgrade to 25.4.5 or wait for fix

5. **Long-running queries not cleaned up**
   - Previous query with same ID still in `system.processes`
   - Query appears completed on client side but server still processing
   - Network interruptions leaving queries in limbo state
   - Queries waiting on locks or merges

6. **Distributed query complexity**
   - Query coordinator using same ID for multiple nodes
   - Retry on different replica with same query_id
   - Cross-cluster queries not properly cleaned up

7. **Misunderstanding query_id purpose**
   - Attempting to use `query_id` as an idempotency key
   - Expecting ClickHouse to deduplicate based on `query_id`
   - Using `query_id` to prevent duplicate inserts (doesn't work)

## Common solutions {#common-solutions}

### **1. Generate truly unique query IDs** {#generate-unique-query-ids}

```python
# ✅ Best practice: Use UUID4
import uuid
from clickhouse_driver import Client

client = Client('localhost')
query_id = str(uuid.uuid4())  # e.g., 'ca038ba5-bcdc-4b93-a857-79b066382917'
result = client.execute('SELECT * FROM table', query_id=query_id)

# For debugging: Add timestamp and context
import time
query_id = f"{uuid.uuid4()}-{int(time.time() * 1000)}-{thread_id}"

# High-precision timestamp (if UUID not available)
import time
query_id = f"query-{time.time_ns()}-{random.randint(10000, 99999)}"
```

```java
// Java: Use UUID.randomUUID()
import java.util.UUID;
import com.clickhouse.client.*;

String queryId = UUID.randomUUID().toString();
ClickHouseResponse response = client
    .query(sql, queryId)
    .format(ClickHouseFormat.JSONEachRow)
    .execute()
    .get();
```

```sql
-- SQL-level: Generate unique IDs
SELECT * FROM table 
SETTINGS query_id = concat(
    'query-',
    toString(generateUUIDv4()),
    '-',
    toString(now64(9))
);

-- Or let ClickHouse handle it (recommended)
SELECT * FROM table;
-- ClickHouse auto-generates: query_id like 'a1b2c3d4-...'
```

### **2. Implement proper retry logic** {#implement-retry-logic}

```python
# WRONG: Reusing same query_id on retry
def execute_with_retry_wrong(client, sql, max_retries=3):
    query_id = str(uuid.uuid4())  # Generated ONCE
    for attempt in range(max_retries):
        try:
            return client.execute(sql, query_id=query_id)
        except Exception as e:
            if "QUERY_WITH_SAME_ID_IS_ALREADY_RUNNING" in str(e):
                time.sleep(2 ** attempt)
                continue  # Retries with SAME query_id
            raise

# CORRECT: Generate new query_id for each attempt
def execute_with_retry_correct(client, sql, max_retries=3):
    for attempt in range(max_retries):
        query_id = str(uuid.uuid4())  # New ID each time
        try:
            return client.execute(sql, query_id=query_id)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)

# BETTER: Check if previous query finished before retry
def execute_with_smart_retry(client, sql, max_retries=3):
    previous_query_id = None
    
    for attempt in range(max_retries):
        # If we're retrying, check if previous query finished
        if previous_query_id and not is_query_finished(client, previous_query_id):
            # Wait for previous query to finish or kill it
            kill_query(client, previous_query_id)
            time.sleep(2)
        
        query_id = str(uuid.uuid4())
        previous_query_id = query_id
        
        try:
            return client.execute(sql, query_id=query_id)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)

def is_query_finished(client, query_id):
    result = client.execute(f"""
        SELECT count() > 0 as finished
        FROM system.query_log
        WHERE query_id = '{query_id}'
          AND type IN ('QueryFinish', 'ExceptionWhileProcessing')
          AND event_time > now() - INTERVAL 60 SECOND
    """)
    return result[0][0]

def kill_query(client, query_id):
    try:
        client.execute(f"KILL QUERY WHERE query_id = '{query_id}'")
    except:
        pass
```

### **3. Check if query is still running before retry** {#check-query-running-before-retry}

```sql
-- Check if a specific query_id is still running
SELECT 
    query_id,
    user,
    elapsed,
    formatReadableTimeDelta(elapsed) AS duration,
    query
FROM system.processes
WHERE query_id = 'ca038ba5-bcdc-4b93-a857-79b066382917';

-- On clusters, check all nodes
SELECT 
    hostName() AS host,
    query_id,
    elapsed,
    formatReadableTimeDelta(elapsed) AS duration
FROM clusterAllReplicas('default', system.processes)
WHERE query_id = 'ca038ba5-bcdc-4b93-a857-79b066382917';
```

### **4. Kill stuck queries before retry** {#kill-stuck-queries}

```sql
-- Kill a specific query by ID
KILL QUERY WHERE query_id = 'ca038ba5-bcdc-4b93-a857-79b066382917';

-- For clusters, must use ON CLUSTER (common mistake)
KILL QUERY ON CLUSTER 'default' 
WHERE query_id = 'ca038ba5-bcdc-4b93-a857-79b066382917';

-- Verify the query was killed
SELECT 
    query_id,
    type,
    exception
FROM system.query_log
WHERE query_id = 'ca038ba5-bcdc-4b93-a857-79b066382917'
  AND type IN ('QueryFinish', 'ExceptionWhileProcessing')
ORDER BY event_time DESC
LIMIT 1;
```

### **5. Don't use query_id for idempotency** {#dont-use-query-id-for-idempotency}

```python
# WRONG: Using query_id to prevent duplicate inserts
def idempotent_insert_wrong(client, data, request_id):
    # This WON'T prevent duplicate inserts
    client.execute(
        f"INSERT INTO table VALUES {data}",
        query_id=request_id  # Doesn't work for idempotency
    )

# CORRECT: Implement proper idempotency at data layer
def idempotent_insert_correct(client, data, request_id):
    # Option 1: Use ReplacingMergeTree
    client.execute(f"""
        INSERT INTO table_replacing_merge_tree 
        (request_id, data, created_at)
        VALUES ('{request_id}', '{data}', now())
    """)
    
    # Option 2: Check before insert
    client.execute(f"""
        INSERT INTO table (request_id, data)
        SELECT '{request_id}', '{data}'
        WHERE NOT EXISTS (
            SELECT 1 FROM table WHERE request_id = '{request_id}'
        )
    """)
    
    # Option 3: Use Distributed table deduplication
    # Set replicated_deduplication_window in config
```

### **6. Workaround for 25.5.1 regression** {#workaround-25-5-1-regression}

```bash
# If experiencing widespread issues on 25.5.1, downgrade immediately

# Docker:
docker pull clickhouse/clickhouse-server:25.4.5
docker run -d clickhouse/clickhouse-server:25.4.5

# ClickHouse Cloud:
# Contact support to rollback to 25.4.5

# Self-hosted (Debian/Ubuntu):
sudo apt-get install clickhouse-server=25.4.5 clickhouse-client=25.4.5

# Temporary workaround: Don't use custom query_id
# Let ClickHouse auto-generate IDs until upgraded/downgraded
```

## Prevention tips {#prevention-tips}

1. **Always use UUIDs for query_id**: Never use predictable or static query IDs. Use UUID4 (random) or UUID1 (timestamp-based with MAC address).

2. **Generate new query_id for every execution**: Even when retrying the exact same query, generate a fresh `query_id`.

3. **Understand query_id purpose**: It's for monitoring, tracking, and cancellation—NOT for idempotency or deduplication.

4. **Avoid 25.5.1**: If you're on ClickHouse 25.5.1 and experiencing this error frequently, downgrade to 25.4.5 or wait for 25.5.2+.

5. **Test concurrent execution**: Ensure your ID generation strategy produces unique IDs under high concurrency (1000+ queries/second).

6. **Use KILL QUERY ON CLUSTER**: In distributed setups, always use `ON CLUSTER` variant to kill queries on all nodes.

7. **Monitor query cleanup**: Set up alerts for queries stuck in `system.processes` for > 5 minutes.

8. **Implement proper ID structure**:
   ```text
   {app_name}-{environment}-{uuid}-{timestamp_ns}
   example: myapp-prod-a1b2c3d4-1234567890123456789
   ```

## Debugging steps {#debugging-steps}

### **1. Check if query is actually running** {#check-query-actually-running}

```sql
-- Is this query_id currently running?
SELECT 
    query_id,
    user,
    elapsed,
    formatReadableTimeDelta(elapsed) AS duration,
    memory_usage,
    query
FROM system.processes
WHERE query_id = 'your-query-id';

-- If no results, it's not running (might be an application bug)
```

### **2. Check query execution history** {#check-query-execution-history}

```sql
-- See all executions of this query_id in last hour
SELECT 
    event_time,
    type,
    query_duration_ms,
    formatReadableSize(memory_usage) AS memory,
    exception_code,
    exception
FROM system.query_log
WHERE query_id = 'your-query-id'
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC;

-- Count execution patterns
SELECT 
    query_id,
    count() AS total_executions,
    countIf(type = 'QueryStart') AS starts,
    countIf(type = 'QueryFinish') AS finishes,
    countIf(type = 'ExceptionWhileProcessing') AS exceptions
FROM system.query_log
WHERE query_id = 'your-query-id'
  AND event_time > now() - INTERVAL 1 DAY
GROUP BY query_id;
```

### **3. Investigate 25.5.1 regression pattern** {#investigate-regression-pattern}

```sql
-- Look for the telltale double-execution pattern
SELECT 
    query_id,
    groupArray(event_time) AS times,
    groupArray(type) AS types,
    groupArray(exception_code) AS error_codes,
    arrayMax(times) - arrayMin(times) AS time_diff_sec
FROM system.query_log
WHERE event_time > now() - INTERVAL 10 MINUTE
  AND exception_code = 216
GROUP BY query_id
HAVING time_diff_sec < 1  -- Executions within 1 second
ORDER BY time_diff_sec ASC;

-- If you see many results with time_diff < 0.1 sec, it's likely the 25.5.1 bug
```

### **4. Find duplicate query_id patterns** {#find-duplicate-query-id-patterns}

```sql
-- Identify queries with non-unique IDs
SELECT 
    query_id,
    count() AS collision_count,
    groupArray(event_time) AS execution_times,
    groupUniqArray(user) AS users
FROM system.query_log
WHERE event_time > now() - INTERVAL 1 HOUR
  AND type = 'QueryStart'
GROUP BY query_id
HAVING count() > 1
ORDER BY count() DESC
LIMIT 20;

-- Analyze ID generation patterns
SELECT 
    substring(query_id, 1, 20) AS id_prefix,
    count() AS occurrences
FROM system.query_log
WHERE event_time > now() - INTERVAL 1 HOUR
GROUP BY id_prefix
HAVING count() > 10
ORDER BY count() DESC;
```

### **5. Check for stuck queries** {#check-for-stuck-queries}

```sql
-- Find long-running queries that might be stuck
SELECT 
    query_id,
    user,
    elapsed,
    formatReadableTimeDelta(elapsed) AS duration,
    formatReadableSize(memory_usage) AS memory,
    query
FROM system.processes
WHERE elapsed > 300  -- Running for > 5 minutes
ORDER BY elapsed DESC;
```

## When query_id is useful {#when-query-id-is-useful}

Despite the limitations, `query_id` is valuable for:

### **1. Query tracking and correlation** {#query-tracking-correlation}

```python
# Correlate ClickHouse queries with application logs
import logging

query_id = str(uuid.uuid4())
logger.info(f"Executing query {query_id} for user {user_id}")
result = client.execute(query, query_id=query_id)
logger.info(f"Query {query_id} completed in {duration}s")

# Now you can search logs: "query_id: a1b2c3d4-..."
```

### **2. Selective query cancellation** {#selective-query-cancellation}

```sql
-- Start a long-running batch job
SELECT * FROM huge_table 
WHERE date >= today() - INTERVAL 30 DAY
SETTINGS query_id = 'batch-monthly-report-2024-01';

-- From another connection, cancel if needed
KILL QUERY WHERE query_id = 'batch-monthly-report-2024-01';
```

### **3. Performance analysis over time** {#performance-analysis-over-time}

```sql
-- Track how query performance changes over time
SELECT 
    toDate(event_time) AS date,
    count() AS executions,
    avg(query_duration_ms) AS avg_duration_ms,
    max(query_duration_ms) AS max_duration_ms,
    avg(memory_usage) AS avg_memory_bytes
FROM system.query_log
WHERE query_id LIKE 'daily-report-%'
  AND type = 'QueryFinish'
  AND event_time > now() - INTERVAL 30 DAY
GROUP BY date
ORDER BY date DESC;
```

### **4. Distributed tracing integration** {#distributed-tracing-integration}

```python
# OpenTelemetry example
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("clickhouse_query") as span:
    query_id = str(uuid.uuid4())
    span.set_attribute("query_id", query_id)
    span.set_attribute("database", "analytics")
    
    result = client.execute(query, query_id=query_id)
    
    span.set_attribute("rows_returned", len(result))
```

## Related error codes {#related-error-codes}

- [Error 202: `TOO_MANY_SIMULTANEOUS_QUERIES`](/docs/troubleshooting/error-codes/202_TOO_MANY_SIMULTANEOUS_QUERIES) - Concurrent query limit exceeded (often seen together)
- [Error 394: `QUERY_WAS_CANCELLED`](/docs/troubleshooting/error-codes/394_QUERY_WAS_CANCELLED) - Query cancelled via KILL QUERY
