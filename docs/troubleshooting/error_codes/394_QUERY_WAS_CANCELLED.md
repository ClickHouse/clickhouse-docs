---
slug: /troubleshooting/error-codes/394_QUERY_WAS_CANCELLED
sidebar_label: '394 QUERY_WAS_CANCELLED'
doc_type: 'reference'
keywords: ['error codes', 'QUERY_WAS_CANCELLED', '394']
title: '394 QUERY_WAS_CANCELLED'
description: 'ClickHouse error code - 394 QUERY_WAS_CANCELLED'
---

# Error 394: QUERY_WAS_CANCELLED

:::tip
This error occurs when a query execution is explicitly cancelled or terminated before completion.
It indicates that the query was stopped either by user request, system shutdown, resource limits, or automatic cancellation policies.
:::

## Most common causes {#most-common-causes}

1. **User-initiated cancellation**
    - User executed `KILL QUERY` command
    - Client sent cancel request (Ctrl+C in clickhouse-client)
    - Application cancelled query via API
    - Query stopped through management interface

2. **Client disconnection**
    - Client connection closed before query completed
    - HTTP client disconnected (with `cancel_http_readonly_queries_on_client_close = 1`)
    - Network connection lost between client and server
    - Client timeout causing connection termination

3. **System shutdown or restart**
    - ClickHouse server shutting down gracefully
    - Pod termination during Kubernetes rolling update
    - Service restart draining active queries
    - Graceful shutdown timeout reached (ClickHouse Cloud: 1 hour)

4. **Query timeout enforcement**
    - Query exceeding [`max_execution_time`](/operations/settings/settings#max_execution_time) limit
    - Timeout from `KILL QUERY` command execution
    - Automatic cancellation due to resource policies

5. **Resource protection mechanisms**
    - Query was cancelled due to memory pressure
    - Too many concurrent queries, oldest cancelled
    - System overload protection
    - Emergency query termination

6. **Distributed query cancellation**
    - Parent query cancelled, child queries on remote servers also cancelled
    - One shard failing causes entire distributed query cancellation
    - Replica unavailability during parallel replica execution

## Common solutions {#common-solutions}

**1. Check if cancellation was intentional**

```sql
-- Find cancelled queries
SELECT 
    event_time,
    query_id,
    user,
    query_duration_ms / 1000 AS duration_sec,
    exception,
    query
FROM system.query_log
WHERE exception_code = 394
    AND event_date >= today() - 1
ORDER BY event_time DESC
LIMIT 10;
```

**2. Identify who/what cancelled the query**

```sql
-- Look for KILL QUERY commands
SELECT 
    event_time,
    user,
    query,
    query_id
FROM system.query_log
WHERE query LIKE '%KILL QUERY%'
    AND event_date >= today() - 1
ORDER BY event_time DESC;

-- Check for system shutdowns
SELECT 
    event_time,
    message
FROM system.text_log
WHERE message LIKE '%shutdown%' OR message LIKE '%terminating%'
    AND event_date >= today() - 1
ORDER BY event_time DESC;
```

**3. Increase timeout limits if queries are legitimately long**

```sql
-- Increase execution timeout
SET max_execution_time = 3600;  -- 1 hour

-- Or for specific query
SELECT * FROM large_table
SETTINGS max_execution_time = 7200;  -- 2 hours
```

**4. Handle client disconnections**

```sql
-- Configure whether to cancel on client disconnect
SET cancel_http_readonly_queries_on_client_close = 1;  -- Cancel on disconnect

-- Or keep queries running after disconnect
SET cancel_http_readonly_queries_on_client_close = 0;  -- Continue running
```

:::note
`cancel_http_readonly_queries_on_client_close` only works when `readonly > 0` (automatic for HTTP GET requests).
:::

**5. Handle shutdowns gracefully**

For applications that need to survive pod restarts:

```python
# Implement retry logic for cancelled queries
def execute_with_retry(query, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.query(query)
        except Exception as e:
            if 'QUERY_WAS_CANCELLED' in str(e) or '394' in str(e):
                if attempt < max_retries - 1:
                    # Query may have been cancelled due to shutdown
                    time.sleep(5)
                    continue
            raise
```

**6. Check for system resource issues**

```sql
-- Check if queries being killed due to resource limits
SELECT 
    event_time,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    query_duration_ms,
    exception
FROM system.query_log
WHERE exception_code = 394
    AND event_date >= today() - 1
ORDER BY memory_usage DESC
LIMIT 10;
```

## Common scenarios {#common-scenarios}

**Scenario 1: User killed query**

```
Error: Code: 394. DB::Exception: Query was cancelled
```

**Cause:** User executed `KILL QUERY WHERE query_id = 'xxx'`.

**Solution:**
- This is expected behavior
- Query was intentionally stopped
- Check `system.query_log` to see who killed it
- No action needed unless kill was unintentional

**Scenario 2: Client disconnection auto-cancel**

```
Error: Query was cancelled (after client disconnect)
```

**Cause:** Client disconnected and `cancel_http_readonly_queries_on_client_close = 1`.

**Solution:**

```sql
-- If you want queries to continue after disconnect
SET cancel_http_readonly_queries_on_client_close = 0;

-- Or ensure client doesn't disconnect prematurely
-- Increase client timeout to match query duration
```

**Scenario 3: Graceful shutdown during rolling update**

```
Error: Query was cancelled during pod termination
```

**Cause:** ClickHouse Cloud pod shutting down during rolling update.

**Solution:**
- Implement retry logic in application
- Design queries to complete within grace period (< 1 hour for Cloud)
- For very long queries, use `INSERT INTO ... SELECT` to materialize results
- Monitor for scheduled maintenance windows

**Scenario 4: Query takes too long to cancel**

```
KILL QUERY executed but query continues running for minutes
```

**Cause:** Known issue with some query types, especially those with subqueries or complex JOINs.

**Solution:**
- Query will eventually cancel (may take time to reach cancellation points)
- Consider using `KILL QUERY SYNC` for synchronous termination
- For stuck queries, may need to restart ClickHouse (rare)
- Upgrade to newer versions with improved cancellation

**Scenario 5: Cannot cancel query**

```
Cancellation signal sent but query doesn't stop
```

**Cause:** Query stuck in operation that doesn't check cancellation flag.

**Solution:**

```sql
-- Try synchronous kill
KILL QUERY WHERE query_id = 'stuck_query_id' SYNC;

-- If still stuck, may need server restart
-- Or wait for query timeout
```

## Prevention tips {#prevention-tips}

1. **Set appropriate timeouts:** Configure [`max_execution_time`](/operations/settings/settings#max_execution_time) for workload patterns
2. **Monitor long queries:** Track and optimize slow queries before they need cancellation
3. **Handle shutdowns gracefully:** Design applications to retry cancelled queries
4. **Use query result cache:** Cache expensive query results to avoid re-execution
5. **Implement checkpointing:** For very long operations, break into smaller steps
6. **Monitor cancellation patterns:** Track why queries are being cancelled
7. **Configure client timeouts:** Match client and server timeout settings

## Debugging steps {#debugging-steps}

1. **Find recently cancelled queries:**

   ```sql
   SELECT 
       event_time,
       query_id,
       user,
       query_duration_ms / 1000 AS duration_sec,
       formatReadableSize(memory_usage) AS memory,
       query
   FROM system.query_log
   WHERE exception_code = 394
       AND event_date >= today() - 1
   ORDER BY event_time DESC
   LIMIT 20;
   ```

2. **Check for kill commands:**

   ```sql
   -- Find who killed queries
   SELECT 
       event_time,
       user AS killer,
       query,
       query_id
   FROM system.query_log
   WHERE query LIKE '%KILL QUERY%'
       AND event_time >= now() - INTERVAL 1 HOUR
   ORDER BY event_time DESC;
   ```

3. **Check for pod restarts (ClickHouse Cloud):**

   ```bash
   # Kubernetes
   kubectl get events -n your-namespace \
       --sort-by='.lastTimestamp' | grep -E 'Killing|Terminating'
   
   # Check pod restart count
   kubectl get pods -n your-namespace
   ```

4. **Check error_log for cancellation patterns:**

   ```sql
   SELECT 
       last_error_time,
       last_error_message,
       value AS error_count
   FROM system.errors
   WHERE name = 'QUERY_WAS_CANCELLED'
   ORDER BY last_error_time DESC;
   ```

5. **Analyze cancellation timing:**

   ```sql
   -- See when during execution queries are cancelled
   SELECT 
       toStartOfHour(event_time) AS hour,
       count() AS cancelled_count,
       avg(query_duration_ms / 1000) AS avg_duration_sec,
       max(query_duration_ms / 1000) AS max_duration_sec
   FROM system.query_log
   WHERE exception_code = 394
       AND event_date >= today() - 7
   GROUP BY hour
   ORDER BY hour DESC;
   ```

6. **Check if queries complete before showing cancelled:**

   ```sql
   -- Some queries may complete but still show as cancelled
   SELECT 
       query_id,
       type,
       event_time,
       query_duration_ms,
       exception_code
   FROM system.query_log
   WHERE query_id = 'your_query_id'
   ORDER BY event_time;
   ```

## Special considerations {#special-considerations}

**For HTTP interface:**
- Setting `cancel_http_readonly_queries_on_client_close = 1` auto-cancels on disconnect
- Only works with `readonly > 0` (automatic for GET requests)
- Useful to prevent runaway queries from disconnected clients
- Can cause issues if the client has a short timeout but the query is valid

**For distributed queries:**
- Cancelling parent query cancels all child queries on remote servers
- Child queries show QUERY_WAS_CANCELLED when parent cancelled
- Check `initial_query_id` to find the parent query

**For long-running queries:**
- Cancellation may take time to propagate through query pipeline
- Some operations (like large JOINs or subqueries) have limited cancellation points
- Query must reach a cancellation checkpoint to actually stop
- In rare cases, queries may appear "stuck" but are making progress to cancellation

**For graceful shutdowns (ClickHouse Cloud):**
- During rolling updates, pods wait up to 1 hour for queries to complete
- Queries running longer than grace period are cancelled
- New connections rejected during shutdown
- Design applications to handle these graceful cancellations

**Cancellation vs interruption:**
- `exception_code = 394`: Query was cancelled (shows as error)
- `exception_code = 0` with early termination: Query interrupted but not error
- Check `type` field in `query_log` to distinguish

## Cancellation commands {#cancellation-commands}

**Kill specific query:**

```sql
-- Asynchronous kill (default)
KILL QUERY WHERE query_id = 'your_query_id';

-- Synchronous kill (wait for cancellation to complete)
KILL QUERY WHERE query_id = 'your_query_id' SYNC;

-- Kill by user
KILL QUERY WHERE user = 'problem_user';

-- Kill long-running queries
KILL QUERY WHERE elapsed > 3600;
```

**Check kill status:**

```sql
-- See if kill command succeeded
SELECT 
    query_id,
    user,
    elapsed,
    query
FROM system.processes
WHERE query_id = 'query_you_tried_to_kill';

-- If still running, may need SYNC or more time
```

## Settings affecting cancellation {#cancellation-settings}

```sql
-- Query execution timeout
max_execution_time = 0  -- 0 = unlimited (seconds)

-- Cancel on client disconnect
cancel_http_readonly_queries_on_client_close = 0  -- 0 = don't cancel, 1 = cancel

-- Polling interval for checking cancellation
interactive_delay = 100000  -- Microseconds

-- For distributed queries
distributed_connections_pool_size = 1024
connections_with_failover_max_tries = 3
```

## Distinguishing cancellation types {#cancellation-types}

```sql
-- User-initiated kill
SELECT * FROM system.query_log
WHERE exception_code = 394
    AND exception LIKE '%KILL QUERY%';

-- Timeout-based cancellation  
SELECT * FROM system.query_log
WHERE exception_code = 394
    AND exception LIKE '%timeout%';

-- Client disconnect cancellation
SELECT * FROM system.query_log
WHERE exception_code = 394
    AND exception LIKE '%client%disconnect%';

-- Shutdown-related cancellation
SELECT * FROM system.query_log
WHERE exception_code = 394
    AND event_time BETWEEN 'shutdown_start' AND 'shutdown_end';
```

## Known issues with cancellation {#known-issues}

**Issue 1: Slow query cancellation**
- **Symptom:** Queries take a long time to cancel (minutes after `KILL QUERY`)
- **Affected:** Complex queries with subqueries or large JOINs
- **Cause:** Limited cancellation checkpoints in query execution
- **Workaround:** Use `KILL QUERY SYNC` and wait, or restart server in extreme cases

**Issue 2: Cannot cancel during subquery building**
- **Symptom:** Query stuck building subquery, doesn't respond to cancel
- **Affected:** Queries with `IN` subqueries or complex CTEs
- **Cause:** Query planner doesn't check cancellation during subquery materialization
- **Status:** Known issue, improved in newer versions with new analyzer

**Issue 3: Double cancellation error**
- **Symptom:** "Cannot cancel. Either no query sent or already cancelled" `LOGICAL_ERROR`
- **Affected:** Distributed queries with failover
- **Cause:** Race condition in cancellation logic
- **Impact:** Usually harmless, query still gets cancelled

## Best practices for handling cancellations {#best-practices}

**1. Implement retry logic:**

```python
def execute_query_with_handling(query):
    try:
        return client.query(query)
    except Exception as e:
        if 'QUERY_WAS_CANCELLED' in str(e):
            # Log cancellation
            logger.info(f"Query cancelled: {query_id}")
            # Decide whether to retry based on context
            if is_retryable(e):
                return retry_query(query)
        raise
```

**2. Monitor cancellation patterns:**

```sql
-- Track cancellation frequency
SELECT 
    toStartOfDay(event_time) AS day,
    count() AS cancelled_queries,
    uniq(user) AS affected_users
FROM system.query_log
WHERE exception_code = 394
    AND event_date >= today() - 30
GROUP BY day
ORDER BY day DESC;
```

**3. Design for graceful handling:**
- Break very long operations into smaller chunks
- Use `INSERT INTO ... SELECT` to materialize intermediate results
- Implement savepoints for multi-stage operations
- Design applications to resume from last checkpoint

**4. Configure appropriate timeouts:**

```sql
-- Set realistic execution limits
SET max_execution_time = 1800;  -- 30 minutes

-- For known long queries, set explicitly
SELECT * FROM expensive_aggregation
SETTINGS max_execution_time = 7200;  -- 2 hours
```

## Monitoring cancelled queries {#monitoring}

```sql
-- Cancellation rate over time
SELECT 
    toStartOfHour(event_time) AS hour,
    count() AS total_queries,
    countIf(exception_code = 394) AS cancelled,
    round(cancelled / total_queries * 100, 2) AS cancellation_rate_pct
FROM system.query_log
WHERE event_date >= today() - 7
    AND type = 'ExceptionWhileProcessing'
GROUP BY hour
HAVING cancelled > 0
ORDER BY hour DESC;

-- Most frequently cancelled query patterns
SELECT 
    substr(normalizeQuery(query), 1, 100) AS query_pattern,
    count() AS cancel_count,
    avg(query_duration_ms / 1000) AS avg_duration_before_cancel
FROM system.query_log
WHERE exception_code = 394
    AND event_date >= today() - 7
GROUP BY query_pattern
ORDER BY cancel_count DESC
LIMIT 10;

-- Users with most cancelled queries
SELECT 
    user,
    count() AS cancelled_count,
    uniq(query_id) AS unique_queries
FROM system.query_log
WHERE exception_code = 394
    AND event_date >= today() - 7
GROUP BY user
ORDER BY cancelled_count DESC;
```

## When a query shows as cancelled but completed {#completed-but-cancelled}

Some queries may show `QUERY_WAS_CANCELLED` but actually completed:

```sql
-- Check both QueryFinish and ExceptionWhileProcessing
SELECT 
    query_id,
    type,
    event_time,
    query_duration_ms,
    read_rows,
    exception_code
FROM system.query_log
WHERE query_id = 'your_query_id'
ORDER BY event_time;

-- If you see QueryFinish before ExceptionWhileProcessing,
-- the query actually completed successfully
```

This can happen when:
- Client disconnects after query completes but before receiving results
- Graceful shutdown starts after query finishes
- Race condition between completion and cancellation

## Difference from query interruption {#vs-interruption}

```sql
-- Cancelled queries (error)
SELECT * FROM system.query_log
WHERE exception_code = 394;

-- Interrupted queries (no error, but stopped early)
SELECT * FROM system.query_log
WHERE exception_code = 0
    AND type = 'QueryFinish'
    AND query_duration_ms < expected_duration;

-- Check result_rows to see if query produced results
SELECT query_id, result_rows, read_rows
FROM system.query_log
WHERE query_id = 'your_query_id';
```

## Preventing unwanted cancellations {#preventing-cancellations}

1. **Set appropriate limits:**

   ```sql
   -- Global limits
   ALTER USER your_user SETTINGS max_execution_time = 3600;
   
   -- Or in user profile
   <profiles>
       <long_queries>
           <max_execution_time>7200</max_execution_time>
       </long_queries>
   </profiles>
   ```

2. **Ensure stable client connections:**
    - Use persistent connections
    - Configure TCP keep-alive
    - Set appropriate client timeouts
    - Handle network interruptions

3. **Optimize query performance:**
    - Faster queries less likely to be cancelled
    - Reduce execution time below timeout limits
    - Use proper indexes and partitioning

4. **Monitor system health:**
    - Track pod restarts and maintenance windows
    - Alert on unexpected query cancellations
    - Review cancellation patterns weekly

## For ClickHouse Cloud users {#clickhouse-cloud}

**Graceful shutdown behavior:**
- Rolling updates happen automatically
- 1-hour grace period for running queries
- Queries >1 hour cancelled during restart
- New connections rejected during shutdown
- Design for \<1 hour query duration or handle retries

**Recommendations:**
- Keep queries under 1 hour when possible
- Use materialized views for long aggregations
- Implement retry logic for `QUERY_WAS_CANCELLED`
- Monitor maintenance windows
- Break long operations into smaller chunks

If you're experiencing this error:
1. Check if cancellation was intentional (`KILL QUERY` or user action)
2. Review query duration vs configured timeouts
3. Check for pod restarts or system shutdowns at error time
4. Verify client didn't disconnect prematurely
5. For unintentional cancellations, investigate what triggered them
6. Implement retry logic if cancellations are transient
7. Optimize queries if being cancelled due to timeout
8. For queries that must run longer, increase timeout limits
9. Monitor cancellation patterns to identify systemic issues

**Related documentation:**
- [KILL QUERY statement](/sql-reference/statements/kill#kill-query)
- [Query complexity settings](/operations/settings/query-complexity)
- [Server settings](/operations/server-configuration-parameters/settings)