---
slug: /troubleshooting/error-codes/735_QUERY_WAS_CANCELLED_BY_CLIENT
sidebar_label: '735 QUERY_WAS_CANCELLED_BY_CLIENT'
doc_type: 'reference'
keywords: ['error codes', 'QUERY_WAS_CANCELLED_BY_CLIENT', '735']
title: '735 QUERY_WAS_CANCELLED_BY_CLIENT'
description: 'ClickHouse error code - 735 QUERY_WAS_CANCELLED_BY_CLIENT'
---

# Error 735: QUERY_WAS_CANCELLED_BY_CLIENT

:::tip
This error occurs when your query was stopped because the client application that sent it cancelled the request.
This is a **client-side cancellation**, not a ClickHouse server issue - it means your application, driver, or tool explicitly told ClickHouse to stop executing the query.
:::

## What this error means {#what-it-means}

When a client connects to ClickHouse and sends a query, it can later send a "Cancel" packet to stop that query mid-execution.
ClickHouse receives this cancellation signal and immediately stops processing the query, throwing error 735.
This is the expected behavior when:

- A user clicks "Stop" in a query tool
- An application has a timeout and cancels the query
- A connection is closed or lost
- A client explicitly calls a cancel/interrupt method

## Potential causes {#potential-causes}

1. **Client timeouts** - Your application or driver has a query timeout shorter than the query execution time
2. **User cancellation** - A user manually stopped the query in a UI tool (SQL Console, DBeaver, etc.)
3. **Connection issues** - Network problems causing the client to disconnect and cancel queries
4. **Application logic** - Your code explicitly cancels queries based on business logic
5. **Load balancer/proxy timeouts** - Intermediate infrastructure timing out before the query completes
6. **Resource exhaustion** - Client running out of memory or resources while processing results

## When you'll see it {#when-youll-see-it}

### Common scenarios from production {#common-scenarios}

```sql
-- Long-running query cancelled by user
SELECT * FROM large_table WHERE timestamp > now() - INTERVAL 1 YEAR;
-- User clicks "Stop" button after 30 seconds

-- Query cancelled by client timeout
Code: 735. DB::Exception: Received 'Cancel' packet from the client, canceling the query.
(QUERY_WAS_CANCELLED_BY_CLIENT) (version 24.12.1.18350)
```

### Real-world examples {#real-world-examples}

**Example 1: Grafana dashboard timeout**

```text
event_time: 2025-05-09 19:52:51
initial_user: grafana_ro
exception_code: 735
exception: Code: 735. DB::Exception: Received 'Cancel' packet from the client, 
canceling the query. (QUERY_WAS_CANCELLED_BY_CLIENT)
```

**Example 2: Application driver timeout**

```text
error: write: write tcp 172.30.103.188:51408->18.225.29.123:9440: i/o timeout
err: driver: bad connection
```

## Quick fixes {#quick-fixes}

### 1. **Increase client timeout settings** {#increase-client-timeout}

**Go driver (clickhouse-go):**

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{"host:9000"},
    Settings: clickhouse.Settings{
        "max_execution_time": 300, // 5 minutes server-side
    },
    DialTimeout:  30 * time.Second,
    ReadTimeout:  5 * time.Minute,  // Increase this
    WriteTimeout: 5 * time.Minute,
})
```

**Python driver (clickhouse-driver):**

```python
from clickhouse_driver import Client

client = Client(
    host='hostname',
    send_receive_timeout=300,  # 5 minutes
    sync_request_timeout=300
)
```

**JDBC driver:**

```java
Properties properties = new Properties();
properties.setProperty("socket_timeout", "300000"); // 5 minutes in milliseconds
Connection conn = DriverManager.getConnection(url, properties);
```

### 2. **Check for query timeout settings** {#check-for-query-timeout}

```sql
-- Check your current timeout settings
SELECT 
    name, 
    value 
FROM system.settings 
WHERE name LIKE '%timeout%' OR name LIKE '%execution_time%';

-- Set longer timeout for your session
SET max_execution_time = 300; -- 5 minutes

-- Or in your query
SELECT * FROM large_table 
SETTINGS max_execution_time = 600;
```

### 3. **Optimize slow queries** {#optimize-slow-queries}

If queries are timing out because they're too slow:

```sql
-- Add LIMIT for testing
SELECT * FROM large_table LIMIT 1000;

-- Use EXPLAIN to understand query plan
EXPLAIN SELECT * FROM large_table WHERE condition;

-- Check query progress
SELECT 
    query_id,
    elapsed,
    read_rows,
    total_rows_approx
FROM system.processes
WHERE query NOT LIKE '%system.processes%';
```

### 4. **Handle cancellations gracefully in your application** {#handle-cancellations}

```go
// Go example with context
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
defer cancel()

rows, err := conn.QueryContext(ctx, "SELECT * FROM large_table")
if err != nil {
    if errors.Is(err, context.DeadlineExceeded) {
        // Handle timeout
        log.Println("Query timed out, consider optimization")
    }
}
```

### 5. **Check for infrastructure timeouts** {#check-infrastructure-timeouts}

- **Load balancers**: AWS ALB has 60s default timeout, increase to 300s+
- **Proxies**: Check HAProxy, Nginx timeouts
- **Cloud providers**: Check cloud-specific connection limits

## Understanding the root cause {#understanding-the-root-cause}

This error is **informational** from ClickHouse's perspective—it's telling you that it successfully cancelled the query as requested by the client. The actual problem is:

1. **Why did the client cancel?** (timeout, user action, connection loss)
2. **Is the query too slow?** (needs optimization)
3. **Are timeout settings too aggressive?** (need tuning)

## Related errors {#related-errors}

- **Error 159: `TIMEOUT_EXCEEDED`** - Server-side timeout (set by `max_execution_time`)
- **Error 210: `NETWORK_ERROR`** - Network connection problems
- **Error 394: `QUERY_WAS_CANCELLED`** - Server-side cancellation (vs client-side 735)

## Troubleshooting steps {#troubleshooting-steps}

1. **Check query logs** to see how long queries ran before cancellation:

   ```sql
   SELECT 
       query_id,
       query_duration_ms,
       exception_code,
       exception,
       query
   FROM system.query_log
   WHERE exception_code = 735
   ORDER BY event_time DESC
   LIMIT 10;
   ```

2. **Monitor client connection metrics**:

   ```sql
   SELECT 
       user,
       client_hostname,
       client_name,
       elapsed,
       read_rows,
       memory_usage
   FROM system.processes;
   ```

3. **Check for patterns**: Are cancellations happening at a specific time threshold? This indicates a timeout setting somewhere in your stack.
