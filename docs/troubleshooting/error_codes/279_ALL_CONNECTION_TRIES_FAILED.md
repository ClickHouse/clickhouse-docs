---
slug: /troubleshooting/error-codes/279_ALL_CONNECTION_TRIES_FAILED
sidebar_label: '279 ALL_CONNECTION_TRIES_FAILED'
doc_type: 'reference'
keywords: ['error codes', 'ALL_CONNECTION_TRIES_FAILED', '279']
title: '279 ALL_CONNECTION_TRIES_FAILED'
description: 'ClickHouse error code - 279 ALL_CONNECTION_TRIES_FAILED'
---

# Error 279: ALL_CONNECTION_TRIES_FAILED

:::tip
This error occurs when ClickHouse cannot establish a connection to any of the available replicas or shards after exhausting all connection attempts. 
It indicates a complete failure to connect to remote nodes needed for distributed query execution, parallel replicas, or cluster operations.
:::

## Most common causes {#most-common-causes}

1. **All replicas unavailable or unreachable**
    - All remote servers down or restarting
    - Network partition isolating all replicas
    - All connection attempts timing out
    - DNS resolution failing for all hosts

2. **Parallel replicas with stale connections**
    - First query after idle period using stale connection pool
    - Connection pool contains dead connections to replicas
    - Network configuration causing connections to timeout after inactivity (typically 1+ hour)
    - Known issue in versions before 24.5.1.22937 and 24.7.1.5426

3. **Pod restarts during rolling updates**
    - Load balancer routing new connections to terminating pods
    - Replicas marked as `ready: true, terminating: true` still receiving traffic
    - Delay between pod termination and load balancer deregistration (can be 15-20 seconds)
    - Multiple replicas restarting simultaneously

4. **Distributed query to offline cluster nodes**
    - Remote shard servers not running
    - Network connectivity issues to cluster nodes
    - Firewall blocking inter-node communication
    - Wrong hostnames in cluster configuration

5. **Connection refused errors**
    - ClickHouse server not listening on port
    - Server crashed or killed
    - Port not open in firewall
    - Service not started yet after deployment

6. **`clusterAllReplicas()` queries during disruption**
    - Queries using [`clusterAllReplicas()`](/sql-reference/table-functions/cluster) function
    - Some replicas unavailable during query execution
    - Not using [`skip_unavailable_shards`](/operations/settings/settings#skip_unavailable_shards) setting

## Common solutions {#common-solutions}

**1. For parallel replicas stale connection issue**

Workaround (until fixed in newer versions):

```sql
-- Periodically execute query to refresh connection pool
SELECT 1 FROM your_table
SETTINGS 
    max_parallel_replicas = 60,  -- >= cluster size
    allow_experimental_parallel_reading_from_replicas = 1,
    cluster_for_parallel_replicas = 'default';

-- Or execute as retry after ALL_CONNECTION_TRIES_FAILED error
```

**Permanent fix:** Upgrade to ClickHouse 24.5.1.22937, 24.7.1.5426, or later.

**2. Skip unavailable shards/replicas**

```sql
-- Allow query to proceed even if some replicas unavailable
SET skip_unavailable_shards = 1;

-- For clusterAllReplicas queries
SELECT * FROM clusterAllReplicas('default', system.tables)
SETTINGS skip_unavailable_shards = 1;
```

**3. Verify cluster connectivity**

```sql
-- Test connection to all cluster nodes
SELECT 
    hostName() AS host,
    count() AS test
FROM clusterAllReplicas('your_cluster', system.one);

-- Check cluster configuration
SELECT *
FROM system.clusters
WHERE cluster = 'your_cluster';
```

**4. Check replica status**

```sql
-- For replicated tables, check replica health
SELECT 
    database,
    table,
    is_leader,
    is_readonly,
    total_replicas,
    active_replicas
FROM system.replicas;

-- Check for replication lag
SELECT 
    database,
    table,
    absolute_delay,
    queue_size
FROM system.replicas
WHERE absolute_delay > 60 OR queue_size > 100;
```

**5. Verify servers are running**

```bash
# Check if ClickHouse is listening on port
telnet server-hostname 9000

# Or using nc
nc -zv server-hostname 9000

# Kubernetes - check pod status
kubectl get pods -n your-namespace
kubectl get endpoints -n your-namespace
```

**6. Configure connection retry settings**

```sql
-- Increase connection attempt count
SET connections_with_failover_max_tries = 5;

-- Increase timeout for failover connections
SET connect_timeout_with_failover_ms = 3000;

-- For distributed queries
SET distributed_connections_pool_size = 1024;
```

**7. Implement client-side retry logic**

```python
# Python example
import time

def execute_with_retry(query, max_retries=3):
    for attempt in range(max_retries):
        try:
            # For parallel replicas workaround
            if attempt > 0:
                # Refresh connection pool
                client.query(
                    "SELECT 1",
                    settings={
                        'max_parallel_replicas': 60,
                        'allow_experimental_parallel_reading_from_replicas': 1
                    }
                )
            return client.query(query)
        except Exception as e:
            if 'ALL_CONNECTION_TRIES_FAILED' in str(e) or '279' in str(e):
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
            raise
```

## Common scenarios {#common-scenarios}

**Scenario 1: Parallel replicas stale connections**

```
Error: Code: 279. DB::Exception: Can't connect to any replica chosen 
for query execution: While executing Remote. (ALL_CONNECTION_TRIES_FAILED)
```

**Cause:** First query after idle period; connection pool has stale connections (bug in versions < 24.5.1.22937).

**Solution:**
- Upgrade to 24.5.1.22937 / 24.7.1.5426 or later (permanent fix)
- Execute dummy query with `max_parallel_replicas >= cluster_size` to refresh pool
- Implement retry logic that refreshes connection pool

**Scenario 2: All replicas down**

```
Error: Code: 279. All connection tries failed. Log:
Code: 210. Connection refused (server:9000)
Code: 210. Connection refused (server:9000)
Code: 210. Connection refused (server:9000)
```

**Cause:** All replicas in cluster are down or not accepting connections.

**Solution:**
- Check if ClickHouse servers are running
- Verify services are accessible on port 9000
- Check for pod/server restarts
- Review cluster configuration

**Scenario 3: Rolling restart with load balancer delay**

```
Error: Connection failures during rolling restart
Multiple failed attempts to same terminating replica
```

**Cause:** Load balancer still routing to pods marked `ready: true, terminating: true` (15-20 second delay before marked `ready: false`).

**Solution:**
- Implement retry logic with exponential backoff
- Use connection pooling that handles connection failures
- Wait for fix to prestop hooks (ongoing work)
- Design applications to tolerate temporary connection failures

**Scenario 4: clusterAllReplicas() with unavailable replicas**

```
Error: ALL_CONNECTION_TRIES_FAILED in clusterAllReplicas query
```

**Cause:** Using `clusterAllReplicas()` when one or more replicas unavailable.

**Solution:**

```sql
-- Enable skip_unavailable_shards
SELECT * FROM clusterAllReplicas('default', system.tables)
SETTINGS skip_unavailable_shards = 1;

-- Or use cluster() with proper shard selection
SELECT * FROM cluster('default', system.tables)
WHERE shard_num = 1;
```

**Scenario 5: Distributed table with dead shards**

```
Error: All connection tries failed during distributed query
```

**Cause:** Distributed table references shard that is down.

**Solution:**

```sql
-- Skip unavailable shards
SELECT * FROM distributed_table
SETTINGS skip_unavailable_shards = 1;

-- Check which shards are unreachable
SELECT * FROM system.clusters WHERE cluster = 'your_cluster';

-- Fix cluster configuration to remove dead nodes
```

## Prevention tips {#prevention-tips}

1. **Keep ClickHouse updated:** Upgrade to 24.5+ for parallel replicas fix
2. **Use skip_unavailable_shards:** Allow queries to proceed with partial data
3. **Monitor cluster health:** Track replica availability and connectivity
4. **Implement retry logic:** Handle transient connection failures gracefully
5. **Test failover:** Regularly verify cluster failover mechanisms work
6. **Configure appropriate timeouts:** Match connection timeouts to network conditions
7. **Plan for rolling updates:** Design applications to handle temporary unavailability

## Debugging steps {#debugging-steps}

1. **Identify which replicas failed:**

   ```sql
   SELECT 
       event_time,
       query_id,
       exception
   FROM system.query_log
   WHERE exception_code = 279
       AND event_date >= today() - 1
   ORDER BY event_time DESC
   LIMIT 10;
   ```

2. **Check cluster connectivity:**

   ```sql
   -- Test each shard/replica
   SELECT 
       cluster,
       shard_num,
       replica_num,
       host_name,
       port,
       is_local
   FROM system.clusters
   WHERE cluster = 'default';
   
   -- Try to query each node
   SELECT * FROM clusterAllReplicas('default', system.one);
   ```

3. **Check for parallel replicas settings:**

   ```sql
   SELECT 
       query_id,
       Settings['allow_experimental_parallel_reading_from_replicas'] AS parallel_replicas,
       Settings['max_parallel_replicas'] AS max_replicas,
       exception
   FROM system.query_log
   WHERE exception_code = 279
   ORDER BY event_time DESC
   LIMIT 5;
   ```

4. **Test individual replica connections:**

   ```bash
   # Test each replica manually
   telnet replica1-hostname 9000
   telnet replica2-hostname 9000
   
   # Or with clickhouse-client
   clickhouse-client --host replica1-hostname --query "SELECT 1"
   ```

5. **Check for pod restarts (Kubernetes):**

   ```bash
   # Check pod status and restarts
   kubectl get pods -n your-namespace
   
   # Check events during error timeframe
   kubectl get events -n your-namespace \
       --sort-by='.lastTimestamp' | grep Killing
   ```

6. **Review error_log for connection details:**

   ```sql
   SELECT 
       event_time,
       name,
       value,
       last_error_message
   FROM system.errors
   WHERE name = 'ALL_CONNECTION_TRIES_FAILED'
   ORDER BY last_error_time DESC;
   ```

## Special considerations {#special-considerations}

**For parallel replicas (experimental feature):**
- Known bug in versions before 24.5.1.22937 / 24.7.1.5426
- Stale connections in pool after inactivity
- First query after idle period likely to fail
- Subsequent queries succeed after pool refresh
- Settings [`skip_unavailable_shards`](/operations/settings/settings#skip_unavailable_shards) and [`use_hedged_requests`](/operations/settings/settings#use_hedged_requests) not needed anymore

**For distributed queries:**
- Error means ALL configured replicas failed
- Each replica has multiple connection attempts
- Full error message shows individual NETWORK_ERROR (210) attempts
- Check both network and server availability

**For `clusterAllReplicas()`:**
- Queries all replicas in cluster
- Failure expected if any replica unavailable
- Use `skip_unavailable_shards = 1` to proceed with available replicas
- Common during rolling updates or maintenance

**For ClickHouse Cloud rolling updates:**
- Pods marked as terminating can still show `ready: true` for 15-20 seconds
- Load balancer may route new connections to terminating pods during this window
- Graceful shutdown waits up to 1 hour for running queries
- Design clients to retry connection failures

**Load balancer behavior:**
- Connection established to load balancer, not directly to replica
- Each query may route to different replica
- Terminating pods remain in load balancer briefly after shutdown starts
- Client retry may succeed if routed to healthy replica

## Parallel replicas specific fix {#parallel-replicas-fix}

**Problem:** Stale connections in cluster connection pools cause first query after inactivity to fail.

**Affected versions:** Before 24.5.1.22937 and 24.7.1.5426

**Fix:** [PR 67389](https://github.com/ClickHouse/ClickHouse/pull/67389)

**Workaround until upgraded:**

```sql
-- Execute this periodically or as retry after error
SELECT 1
SETTINGS 
    max_parallel_replicas = 100,  -- >= number of replicas
    allow_experimental_parallel_reading_from_replicas = 1,
    cluster_for_parallel_replicas = 'default';
```

## Connection retry settings {#connection-retry-settings}

```sql
-- Maximum connection attempts per replica
SET connections_with_failover_max_tries = 3;

-- Timeout for each connection attempt (milliseconds)
SET connect_timeout_with_failover_ms = 1000;
SET connect_timeout_with_failover_secure_ms = 1000;

-- Connection timeout (seconds)
SET connect_timeout = 10;

-- For hedged requests (parallel connection attempts)
SET use_hedged_requests = 1;  -- Not needed for parallel replicas
SET hedged_connection_timeout_ms = 100;
```

## Cluster configuration best practices {#cluster-best-practices}

1. **Remove dead nodes from configuration:**

   ```xml
   <!-- Don't include offline servers -->
   <remote_servers>
       <cluster_name>
           <shard>
               <replica>
                   <host>active-server.domain.com</host>
                   <port>9000</port>
               </replica>
               <!-- Remove or comment out dead servers -->
           </shard>
       </cluster_name>
   </remote_servers>
   ```

2. **Use internal_replication:**

   ```xml
   <shard>
       <internal_replication>true</internal_replication>
       <replica>...</replica>
   </shard>
   ```

3. **Configure failover properly:**
    - Ensure cluster has multiple replicas per shard
    - Use appropriate `load_balancing` strategy
    - Test failover by stopping one replica

## Client implementation recommendations {#client-recommendations}

**For JDBC clients:**

```java
// Use connection pooling
ClickHouseDataSource dataSource = new ClickHouseDataSource(url, properties);

// Implement retry logic
public void executeWithRetry(String query, int maxRetries) {
    for (int attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Get new connection on each retry
            try (Connection conn = dataSource.getConnection()) {
                // Execute query
            }
            return; // Success
        } catch (SQLException e) {
            if (e.getMessage().contains("ALL_CONNECTION_TRIES_FAILED") 
                && attempt < maxRetries - 1) {
                Thread.sleep(1000 * (long)Math.pow(2, attempt));
                continue;
            }
            throw e;
        }
    }
}
```

**For distributed queries:**
- Expect temporary failures during rolling updates
- Implement exponential backoff retry
- Use `skip_unavailable_shards` for non-critical queries
- Monitor cluster health before sending queries

## Distinguishing scenarios {#distinguishing-scenarios}

**Parallel replicas issue:**
- First query after idle period
- Subsequent queries succeed
- Versions before 24.5.1 / 24.7.1
- Error mentions "replica chosen for query execution"

**Actual connectivity issue:**
- Consistent failures, not just first query
- Network or server problems
- Individual 210 errors show "Connection refused" or "Timeout"

**Rolling restart:**
- Errors during known maintenance window
- Transient, resolves after restarts complete
- Correlation with pod restart events

**Cluster misconfiguration:**
- Persistent errors
- Same replicas always failing
- Wrong hostnames or dead nodes in config

## When using `clusterAllReplicas()` {#clusterallreplicas-usage}

```sql
-- Will fail if ANY replica unavailable (without skip setting)
SELECT * FROM clusterAllReplicas('default', system.tables);

-- Recommended: Skip unavailable replicas
SELECT * FROM clusterAllReplicas('default', system.tables)
SETTINGS skip_unavailable_shards = 1;

-- Check which queries are derived from clusterAllReplicas
SELECT 
    query_id,
    initial_query_id,
    is_initial_query,
    exception
FROM system.query_log
WHERE exception_code = 210
    AND is_initial_query = 0  -- Derived queries
ORDER BY event_time DESC;
```

## Monitoring and alerting {#monitoring}

```sql
-- Track ALL_CONNECTION_TRIES_FAILED errors
SELECT 
    toStartOfHour(event_time) AS hour,
    count() AS error_count,
    uniqExact(initial_query_id) AS unique_queries
FROM system.query_log
WHERE exception_code = 279
    AND event_date >= today() - 7
GROUP BY hour
ORDER BY hour DESC;

-- Check error_log for pattern
SELECT 
    last_error_time,
    last_error_message,
    value AS error_count
FROM system.errors
WHERE name = 'ALL_CONNECTION_TRIES_FAILED'
ORDER BY last_error_time DESC;
```

## Known issues and fixes {#known-issues}

**Issue 1: Parallel replicas stale connections**
- **Affected:** Versions before 24.5.1.22937 / 24.7.1.5426
- **Fix:** [PR 67389](https://github.com/ClickHouse/ClickHouse/pull/67389)
- **Workaround:** Execute dummy query to refresh pool or retry

**Issue 2: Load balancer routing to terminating pods**
- **Affected:** ClickHouse Cloud during rolling updates
- **Symptom:** 15-20 second window where terminating pods receive new connections
- **Status:** Ongoing work on pre-stop hooks
- **Workaround:** Implement client retry logic

**Issue 3: Round-robin replica selection**
- **Affected:** Parallel replicas queries
- **Symptom:** Forcibly uses ROUND_ROBIN even if replicas unavailable
- **Impact:** If 1/60 replicas dead, 1/60 requests fail consistently

If you're experiencing this error:
1. Check ClickHouse version - upgrade if using parallel replicas on version \< 24.5.1 / 24.7.1
2. Verify all cluster nodes are running and accessible
3. Test connectivity to each replica manually
4. For parallel replicas: try executing dummy query to refresh connection pool
5. Use `skip_unavailable_shards = 1` for queries that can tolerate partial data
6. Check for correlation with pod restarts or maintenance windows
7. Implement exponential backoff retry logic in client
8. Review cluster configuration for dead or incorrect nodes
9. Check individual connection errors in full exception message (usually 210 errors)
10. For persistent issues, check network connectivity between nodes

**Related documentation:**
- [Parallel replicas](/operations/settings/settings#allow-experimental-parallel-reading-from-replicas)
- [Distributed queries](/engines/table-engines/special/distributed)
- [Cluster functions](/sql-reference/table-functions/cluster)
