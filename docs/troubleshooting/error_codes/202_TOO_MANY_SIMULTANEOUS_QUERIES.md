---
slug: /troubleshooting/error-codes/202_TOO_MANY_SIMULTANEOUS_QUERIES
sidebar_label: '202 TOO_MANY_SIMULTANEOUS_QUERIES'
doc_type: 'reference'
keywords: ['error codes', 'TOO_MANY_SIMULTANEOUS_QUERIES', '202']
title: '202 TOO_MANY_SIMULTANEOUS_QUERIES'
description: 'ClickHouse error code - 202 TOO_MANY_SIMULTANEOUS_QUERIES'
---

# Error 202: TOO_MANY_SIMULTANEOUS_QUERIES

:::tip
This error occurs when the number of concurrently executing queries exceeds the configured limit for the server or user.
It indicates that ClickHouse is protecting itself from overload by rejecting new queries until existing queries complete.
:::

## Most common causes {#most-common-causes}

1. **Exceeded global query limit**
    - More queries than [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries) setting allows
    - Default limit is typically 1000 concurrent queries
    - Query execution slower than query arrival rate

2. **Exceeded per-user query limit**
    - User exceeds [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user) limit
    - Multiple applications using the same user account
    - Query backlog from slow-running queries

3. **Query execution bottleneck**
    - Queries running slower than normal (cold cache, resource contention)
    - Increased query complexity or data volume
    - Insufficient server resources causing query queueing

4. **Traffic spike or load test**
    - Sudden increase in query rate
    - Load testing without appropriate limits
    - Retry storms from client applications

5. **Async insert backpressure**
    - Large number of async insert operations queueing
    - Inserts counted toward query limit
    - Async insert processing slower than arrival rate

6. **Poor connection management**
    - Client opening too many persistent connections
    - Connection pooling misconfigured
    - Each connection running queries simultaneously

## Common solutions {#common-solutions}

**1. Implement client-side retry with backoff**

This is the recommended approach rather than just increasing limits:

```python
# Python example with exponential backoff
import time
import random

def execute_with_retry(query, max_retries=5):
    for attempt in range(max_retries):
        try:
            return client.execute(query)
        except Exception as e:
            if 'TOO_MANY_SIMULTANEOUS_QUERIES' in str(e) or '202' in str(e):
                if attempt < max_retries - 1:
                    # Exponential backoff with jitter
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    time.sleep(wait_time)
                    continue
            raise
```

**2. Check current query limits**

```sql
-- View current settings
SELECT 
    name,
    value,
    description
FROM system.settings
WHERE name IN ('max_concurrent_queries', 'max_concurrent_queries_for_user')
FORMAT Vertical;
```

**3. Monitor concurrent query count**

```sql
-- Check current running queries
SELECT 
    user,
    count() AS concurrent_queries
FROM system.processes
GROUP BY user
ORDER BY concurrent_queries DESC;

-- Total concurrent queries
SELECT count() FROM system.processes;
```

**4. Increase query limits (if appropriate)**

```sql
-- Increase global limit (requires server restart in self-managed)
-- In config.xml:
<max_concurrent_queries>2000</max_concurrent_queries>

-- Increase per-user limit
ALTER USER your_user SETTINGS max_concurrent_queries_for_user = 200;

-- Or set at session level (won't help for the limit itself, but for testing)
SET max_concurrent_queries_for_user = 200;
```

:::note
In ClickHouse Cloud, changing `max_concurrent_queries` requires support assistance.
:::

**5. Optimize slow queries**

```sql
-- Find slow running queries
SELECT 
    query_id,
    user,
    elapsed,
    query
FROM system.processes
WHERE elapsed > 60
ORDER BY elapsed DESC;

-- Kill long-running queries if necessary
KILL QUERY WHERE query_id = 'slow_query_id';
```

**6. Implement connection pooling**

```python
# Use connection pooling to reuse connections
from clickhouse_connect import get_client

# Create client pool
client = get_client(
    host='your-host',
    pool_mgr=create_pool_manager(maxsize=20)  # Limit pool size
)
```

**7. Use query priorities**

```sql
-- Lower priority for less critical queries
SELECT * FROM large_table
SETTINGS priority = 10;  -- Higher number = lower priority

-- Higher priority for critical queries
SELECT * FROM important_table
SETTINGS priority = 1;
```

## Common scenarios {#common-scenarios}

**Scenario 1: Traffic spike**

```text
Error: Code: 202, message: Too many simultaneous queries. Maximum: 1000
```

**Cause:** Sudden increase in query rate from 200 to 1000+ queries/second.

**Solution:**
- Implement exponential backoff retries in client
- Scale horizontally (add more replicas)
- Optimize queries to complete faster
- If sustained load, increase `max_concurrent_queries`

**Scenario 2: Slow queries creating backlog**

```text
Error: Too many simultaneous queries
```

**Cause:** Queries taking 3-4 seconds instead of typical 7ms due to cold cache after restart.

**Solution:**
- Warm up cache after restarts with key queries
- Optimize slow queries
- Implement query timeout limits
- Use query result cache for repeated queries

**Scenario 3: Per-user limit exceeded**

```text
Error: Too many simultaneous queries for user 'app_user'
```

**Cause:** Single user running too many concurrent queries.

**Solution:**

```sql
-- Increase user-specific limit
ALTER USER app_user SETTINGS max_concurrent_queries_for_user = 500;

-- Or create separate users for different applications
CREATE USER app1_user IDENTIFIED BY 'password'
SETTINGS max_concurrent_queries_for_user = 200;
```

**Scenario 4: Async inserts causing limit**

```text
Error: Too many simultaneous queries (mostly async inserts)
```

**Cause:** High volume async inserts filling query slots.

**Solution:**

```sql
-- Adjust async insert settings
SET async_insert = 1;
SET async_insert_max_data_size = 10485760;  -- 10MB
SET async_insert_busy_timeout_ms = 1000;    -- Flush more frequently

-- Or batch inserts on client side
```

**Scenario 5: Connection pool misconfiguration**

```text
Error: Too many simultaneous queries
```

**Cause:** Each client connection running queries, with 1000 open connections.

**Solution:**
- Reduce connection pool size
- Reuse connections for multiple queries
- Close idle connections

## Prevention tips {#prevention-tips}

1. **Implement retry logic:** Always retry with exponential backoff for error 202
2. **Monitor query concurrency:** Set up alerts for approaching limits
3. **Optimize query performance:** Faster queries = lower concurrency
4. **Use appropriate connection pools:** Don't create excessive connections
5. **Set query timeouts:** Prevent queries from running indefinitely
6. **Use query priorities:** Differentiate critical from non-critical queries
7. **Scale horizontally:** Add replicas to distribute load

## Debugging steps {#debugging-steps}

1. **Check current concurrent queries:**

   ```sql
   SELECT 
       count() AS total_queries,
       countIf(query_kind = 'Select') AS selects,
       countIf(query_kind = 'Insert') AS inserts
   FROM system.processes;
   ```

2. **Identify query patterns:**

   ```sql
   SELECT 
       user,
       query_kind,
       count() AS query_count,
       avg(elapsed) AS avg_duration
   FROM system.processes
   GROUP BY user, query_kind
   ORDER BY query_count DESC;
   ```

3. **Check recent error occurrences:**

   ```sql
   SELECT 
       toStartOfMinute(event_time) AS minute,
       count() AS error_count
   FROM system.query_log
   WHERE exception_code = 202
     AND event_date >= today() - 1
   GROUP BY minute
   ORDER BY minute DESC
   LIMIT 50;
   ```

4. **Analyze query rate trends:**

   ```sql
   SELECT 
       toStartOfHour(event_time) AS hour,
       user,
       count() AS query_count,
       countIf(exception_code = 202) AS rejected_queries
   FROM system.query_log
   WHERE event_date >= today() - 1
     AND type != 'QueryStart'
   GROUP BY hour, user
   ORDER BY hour DESC, query_count DESC;
   ```

5. **Find slow queries causing backlog:**

   ```sql
   SELECT 
       query_id,
       user,
       elapsed,
       formatReadableSize(memory_usage) AS memory,
       query
   FROM system.processes
   WHERE elapsed > 30
   ORDER BY elapsed DESC;
   ```

6. **Check connection distribution (for clusters):**

   ```sql
   SELECT 
       hostname() AS host,
       user,
       count() AS connection_count
   FROM clusterAllReplicas('default', system.processes)
   GROUP BY host, user
   ORDER BY host, connection_count DESC;
   ```

## Query limit settings {#query-limit-settings}

```sql
-- Global limit for all users (server-level setting)
max_concurrent_queries = 1000

-- Per-user limit
max_concurrent_queries_for_user = 100

-- For specific query types
max_concurrent_insert_queries = 100
max_concurrent_select_queries = 100

-- Related settings
queue_max_wait_ms = 5000  -- Max time to wait in queue
```

## Best practices for high-concurrency workloads {#best-practices}

1. **Scale horizontally:**
    - Add more replicas to distribute load
    - Use load balancing across replicas
    - Better than just increasing limits on single instance

2. **Optimize queries:**
    - Use appropriate indexes and primary keys
    - Avoid full table scans
    - Use materialized views for aggregations
    - Add `LIMIT` clauses where appropriate

3. **Batch operations:**
    - Combine multiple small queries into fewer large ones
    - Use `IN` clauses instead of multiple queries
    - Batch inserts instead of row-by-row

4. **Use result caching:**
   ```sql
   -- Enable query cache for repeated queries
   SET use_query_cache = 1;
   SET query_cache_ttl = 300;  -- 5 minutes
   ```

5. **Implement rate limiting:**
    - Limit query rate on client side
    - Use queuing systems (e.g., RabbitMQ, Kafka) for request management
    - Implement circuit breakers

If you're experiencing this error:
1. Check if this is a traffic spike or sustained high load
2. Monitor concurrent query count in `system.processes`
3. Implement exponential backoff retries in your client
4. Identify and optimize slow queries causing backlog
5. Consider horizontal scaling before increasing limits
6. If sustained high concurrency needed, request limit increase (Cloud) or update config (self-managed)
7. Review connection pooling configuration

**Related documentation:**
- [Query complexity settings](/operations/settings/query-complexity)
- [Server settings](/operations/server-configuration-parameters/settings)
- [Session settings](/operations/settings/settings)