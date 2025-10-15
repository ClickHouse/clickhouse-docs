---
slug: /troubleshooting/error-codes/159_TIMEOUT_EXCEEDED
sidebar_label: '159 TIMEOUT_EXCEEDED'
doc_type: 'reference'
keywords: ['error codes', 'TIMEOUT_EXCEEDED', '159']
title: '159 TIMEOUT_EXCEEDED'
description: 'ClickHouse error code - 159 TIMEOUT_EXCEEDED'
---

# Error 159: TIMEOUT_EXCEEDED

:::tip
This error occurs when a query exceeds the configured timeout limits for execution, connection, or network operations.
It indicates that the operation took longer than the maximum allowed time and was automatically cancelled by ClickHouse.
:::

## Most common causes {#most-common-causes}

1. **Query execution timeout exceeded**
    - Query takes longer than [`max_execution_time`](/operations/settings/settings#max_execution_time) setting
    - Long-running aggregations or joins
    - Full table scans on large tables
    - Inefficient query patterns

2. **Network socket timeout**
    - Client connection timeout during long queries
    - Timeout while writing results to client socket
    - Client disconnected before query completed
    - Load balancer or proxy timeout between client and server

3. **Distributed query timeout**
    - Timeout communicating with remote servers in cluster
    - Network latency between cluster nodes
    - Slow responses from remote shards

4. **Resource contention causing slowness**
    - High CPU usage delaying query completion
    - Memory pressure causing disk spilling
    - I/O bottlenecks with slow storage
    - Too many concurrent queries

5. **HTTP connection timeout**
    - HTTP client timeout shorter than query execution time
    - Keep-alive timeout mismatched between client and server
    - Idle connection timeout on load balancers

## Common solutions {#common-solutions}

**1. Increase timeout settings**

```sql
-- Increase query execution timeout (in seconds)
SET max_execution_time = 3600;  -- 1 hour

-- Or set at user level
ALTER USER your_user SETTINGS max_execution_time = 7200;

-- For specific query
SELECT * FROM large_table
SETTINGS max_execution_time = 600;
```

**2. Optimize the query**

```sql
-- Add WHERE clause to filter data
SELECT * FROM table
WHERE date >= today() - INTERVAL 7 DAY;

-- Use appropriate indexes
-- Ensure ORDER BY uses primary key columns
-- Avoid SELECT * on wide tables
```

**3. Configure client-side timeout**

For HTTP clients:

```bash
# Increase socket timeout in connection string
# JDBC example
socket_timeout=7200000  # 2 hours in milliseconds

# Python clickhouse-connect
client = clickhouse_connect.get_client(
    host='your-host',
    query_settings={'max_execution_time': 3600},
    connect_timeout=30,
    send_receive_timeout=3600
)
```

**4. Handle timeout before checking execution speed**

```sql
-- Allow query to start before timeout kicks in
SET timeout_before_checking_execution_speed = 10;

-- Combined with max_execution_time
SET timeout_before_checking_execution_speed = 0;
SET max_execution_time = 300;
```

**5. Enable query cancellation on client disconnect**

```sql
-- Cancel query if HTTP client disconnects (requires readonly mode)
SET cancel_http_readonly_queries_on_client_close = 1;
```

**6. Use async inserts with appropriate timeout**

```sql
-- For insert operations
SET async_insert = 1;
SET wait_for_async_insert = 1;
SET async_insert_timeout = 300;
```

## Common scenarios {#common-scenarios}

**Scenario 1: Query timeout with `max_execution_time`**

```
Error: Timeout exceeded: elapsed 98448.998521 ms, maximum: 5000 ms
```

**Cause:** Query ran longer than `max_execution_time` setting.

**Solution:**

```sql
-- Increase timeout for this query
SELECT * FROM large_table
SETTINGS max_execution_time = 120;

-- Or optimize the query to run faster
```

**Scenario 2: Network socket timeout**

```
Error: Timeout exceeded while writing to socket
```

**Cause:** Client connection timed out while server was sending results.

**Solution:**
- Increase client socket timeout
- Use compression to reduce data transfer time
- Add `LIMIT` clause to reduce result size
- Ensure stable network connection

**Scenario 3: JDBC/HTTP client timeout**

```
Error: Read timed out
```

**Cause:** Client-side timeout shorter than query execution time.

**Solution:**

```java
// Increase JDBC timeout
Properties properties = new Properties();
properties.setProperty("socket_timeout", "7200000"); // 2 hours

// Or in connection URL
jdbc:clickhouse://host:8443/database?socket_timeout=7200000
```

**Scenario 4: Distributed query timeout**

```
Error: Timeout exceeded while communicating with remote server
```

**Cause:** Remote shard not responding within timeout.

**Solution:**

```sql
-- Increase distributed query timeout
SET distributed_connections_timeout = 60;

-- Check cluster health
SELECT * FROM system.clusters WHERE cluster = 'your_cluster';
```

**Scenario 5: Load balancer timeout**

```
Client receives timeout but query completes successfully on server
```

**Cause:** Load balancer or proxy has shorter timeout than query duration.

**Solution:**
- Configure load balancer timeout settings
- Use direct connection for long-running queries
- Enable TCP keep-alive to maintain connection

## Prevention tips {#prevention-tips}

1. **Set appropriate timeouts:** Match client and server timeout settings
2. **Monitor query performance:** Identify and optimize slow queries
3. **Use LIMIT clauses:** Reduce result set size for exploratory queries
4. **Optimize table design:** Use proper primary keys and partitioning
5. **Configure keep-alive:** Prevent idle connection timeouts
6. **Test long queries:** Verify timeout settings before production use
7. **Use query result cache:** Cache expensive query results

## Debugging steps {#debugging-steps}

1. **Check current timeout settings:**

   ```sql
   SELECT 
       name,
       value
   FROM system.settings
   WHERE name LIKE '%timeout%' OR name LIKE '%execution_time%';
   ```

2. **Find queries that timed out:**

   ```sql
   SELECT 
       query_id,
       user,
       query_duration_ms,
       exception,
       query
   FROM system.query_log
   WHERE exception_code = 159
     AND event_date >= today() - 1
   ORDER BY event_time DESC
   LIMIT 10;
   ```

3. **Check if query completed despite timeout:**

   ```sql
   -- Query might have finished after client timeout
   SELECT *
   FROM system.query_log
   WHERE query_id = 'your_query_id'
   ORDER BY event_time;
   ```

4. **Analyze query performance:**

   ```sql
   SELECT
       query_id,
       query_duration_ms / 1000 AS duration_sec,
       formatReadableSize(memory_usage) AS memory,
       formatReadableQuantity(read_rows) AS rows_read,
       formatReadableSize(read_bytes) AS bytes_read
   FROM system.query_log
   WHERE query_id = 'slow_query_id';
   ```

5. **Check for resource bottlenecks:**

   ```sql
   -- CPU usage
   SELECT 
       query_id,
       ProfileEvents['UserTimeMicroseconds'] / 1000000 AS cpu_sec
   FROM system.query_log
   WHERE query_id = 'your_query_id';
   
   -- I/O wait
   SELECT 
       query_id,
       ProfileEvents['OSReadChars'] AS read_chars,
       ProfileEvents['OSWriteChars'] AS write_chars
   FROM system.query_log
   WHERE query_id = 'your_query_id';
   ```

## Special considerations {#special-considerations}

**For HTTP/JDBC clients:**
- Client timeout and server `max_execution_time` are independent
- Query may continue running on server after client timeout
- Use `cancel_http_readonly_queries_on_client_close = 1` to auto-cancel

**For distributed queries:**
- Each shard has its own timeout
- Network latency adds to total execution time
- Use `distributed_connections_timeout` for shard communication

**For long-running analytical queries:**
- Consider using materialized views for pre-aggregation
- Break complex queries into smaller steps
- Use query result cache for repeated queries
- Schedule heavy queries during off-peak hours

**For aggregations with external sorting:**
- Large aggregations may spill to disk
- Merging temporary files can take significant time
- Monitor memory usage and `max_bytes_before_external_group_by`

## Timeout-related settings {#timeout-settings}

```sql
-- Main execution timeout (seconds)
max_execution_time = 0  -- 0 = unlimited

-- Timeout before speed checking starts (seconds)
timeout_before_checking_execution_speed = 10

-- Distributed query timeouts (seconds)
connect_timeout_with_failover_ms = 50
connect_timeout_with_failover_secure_ms = 100
hedged_connection_timeout_ms = 50
receive_timeout = 300
send_timeout = 300

-- HTTP-specific
http_connection_timeout = 1
http_send_timeout = 1800
http_receive_timeout = 1800

-- Cancel on disconnect
cancel_http_readonly_queries_on_client_close = 0
```

## Synchronizing client and server timeouts {#synchronizing-timeouts}

To ensure queries stop when client times out:

```sql
-- Set server timeout slightly less than client timeout
-- Client timeout: 120 seconds
-- Server setting:
SET timeout_before_checking_execution_speed = 0;
SET max_execution_time = 110;  -- 10 seconds less than client

-- Enable cancellation on client disconnect
SET cancel_http_readonly_queries_on_client_close = 1;
```

:::note
`cancel_http_readonly_queries_on_client_close` only works when `readonly > 0`, which is automatic for HTTP GET requests.
:::

If you're experiencing this error:
1. Check if timeout is due to query complexity or timeout configuration
2. Review `max_execution_time` setting and increase if needed
3. For HTTP/JDBC clients, ensure client timeout >= server timeout
4. Use `EXPLAIN` to analyze query plan and optimize
5. Monitor query performance in `system.query_log`
6. Consider breaking long queries into smaller batches
7. For production workloads, set appropriate timeout values based on query patterns

**Related documentation:**
- [ClickHouse settings reference](/operations/settings/settings)
- [Query execution limits](/operations/settings/query-complexity)