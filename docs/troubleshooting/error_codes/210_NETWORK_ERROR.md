---
slug: /troubleshooting/error-codes/210_NETWORK_ERROR
sidebar_label: '210 NETWORK_ERROR'
doc_type: 'reference'
keywords: ['error codes', 'NETWORK_ERROR', '210']
title: '210 NETWORK_ERROR'
description: 'ClickHouse error code - 210 NETWORK_ERROR'
---

# Error 210: NETWORK_ERROR

:::tip
This error occurs when network communication fails due to connection issues, broken connections, or other I/O problems.
It indicates that data could not be sent or received over the network, typically because the connection was closed, refused, or reset.
:::

## Most common causes {#most-common-causes}

1. **Broken pipe (client disconnected)**
    - Client closed connection while the server was sending data
    - Client crashed or was terminated during query execution
    - Client timeout shorter than query duration
    - Client application restarted or connection pool recycled connection

2. **Connection refused**
    - Target server not listening on specified port
    - Server pod not ready or being restarted
    - Firewall blocking connection
    - Wrong hostname or port in configuration

3. **Socket not connected**
    - Client disconnected prematurely
    - Connection closed before response could be sent
    - Network interruption during data transfer
    - Client-side connection timeout

4. **Connection reset by peer**
    - Remote side forcibly closed connection (TCP RST)
    - Network equipment reset connection
    - Remote server crashed or restarted
    - Firewall or security device dropped connection

5. **Distributed query failures**
    - Cannot connect to remote shard in cluster
    - Network partition between cluster nodes
    - Remote node down or unreachable
    - All connection attempts to replicas failed

6. **Network infrastructure issues**
    - Load balancer health check failures
    - Pod restarts or rolling updates
    - Network policy blocking traffic
    - DNS resolution followed by connection failure

## Common solutions {#common-solutions}

**1. Check if client disconnected early**

For "broken pipe" errors:

```sql
-- Check query duration and when error occurred
SELECT 
    query_id,
    query_start_time,
    event_time,
    query_duration_ms / 1000 AS duration_seconds,
    exception,
    query
FROM system.query_log
WHERE exception_code = 210
    AND exception LIKE '%Broken pipe%'
ORDER BY event_time DESC
LIMIT 10;
```

**Cause:** Query took longer than client timeout.

**Solution:**
- Increase client-side timeout
- Optimize query to run faster
- Add `LIMIT` to reduce result size

**2. Verify server availability**

For "connection refused" errors:

```bash
# Test if server is listening
telnet server-hostname 9000

# Or using nc
nc -zv server-hostname 9000

# Check pod status (Kubernetes)
kubectl get pods -n your-namespace

# Check service endpoints
kubectl get endpoints service-name -n your-namespace
```

**3. Check cluster connectivity**

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

**4. Increase client timeout**

```python
# Python clickhouse-connect
client = clickhouse_connect.get_client(
    host='your-host',
    send_receive_timeout=3600,  # 1 hour
    connect_timeout=30
)

# JDBC
Properties props = new Properties();
props.setProperty("socket_timeout", "3600000");  # 1 hour in ms
```

**5. Check for pod restarts**

```bash
# Check pod restart history (Kubernetes)
kubectl get pods -n your-namespace

# Check events for issues
kubectl get events -n your-namespace --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs -n your-namespace pod-name --previous
```

**6. Verify network policies and firewall**

```bash
# Test connectivity between nodes
ping remote-server

# Check port accessibility
telnet remote-server 9000

# Verify firewall rules (self-managed)
iptables -L -n | grep 9000
```

**7. Handle gracefully in application**

```python
# Implement retry logic for network errors
def execute_with_retry(query, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.execute(query)
        except Exception as e:
            if 'NETWORK_ERROR' in str(e) or '210' in str(e):
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
            raise
```

## Common scenarios {#common-scenarios}

**Scenario 1: Broken pipe during long query**

```text
Error: I/O error: Broken pipe, while writing to socket
```

**Cause:** Client disconnected after 3+ hours; query completed on server but client was gone.

**Solution:**
- Increase client timeout to match expected query duration
- Set realistic timeout expectations
- For very long queries (>1 hour), consider using `INSERT INTO ... SELECT` to materialize results
- ClickHouse Cloud gracefully terminates connections with 1-hour timeout during drains

**Scenario 2: Connection refused in distributed query**

```text
Error: Connection refused (server-name:9000)
Code: 279. ALL_CONNECTION_TRIES_FAILED
```

**Cause:** Cannot connect to remote shard; pod may be restarting.

**Solution:**

```sql
-- Check if nodes are accessible
SELECT *
FROM clusterAllReplicas('default', system.one);

-- Verify all replicas are up
SELECT 
    shard_num,
    replica_num,
    host_name,
    port
FROM system.clusters
WHERE cluster = 'default';
```

**Scenario 3: Socket not connected after query completes**

```text
Error: Poco::Exception. Code: 1000, e.code() = 107
Net Exception: Socket is not connected
```

**Cause:** Client closed connection before server could send response.

**Solution:**
- This often appears in logs after successful query completion
- Usually harmless - query already processed successfully
- Client may have closed connection early due to timeout or crash
- Check client logs for why disconnect occurred

**Scenario 4: Connection reset by peer**

```text
Error: Connection reset by peer (code: 104)
```

**Cause:** Remote side forcibly terminated connection.

**Solution:**
- Check if remote server crashed or restarted
- Verify network stability
- Check firewall or security appliance logs
- Test with simpler queries

**Scenario 5: All connection tries failed**

```text
Error: Code: 279. All connection tries failed
Multiple Code: 210. Connection refused attempts
```

**Cause:** Cannot establish connection to any replica.

**Solution:**
- Check if all cluster nodes are down
- Verify network connectivity
- Check ClickHouse server status
- Review cluster configuration

## Prevention tips {#prevention-tips}

1. **Set appropriate client timeouts:** Match client timeout to expected query duration
2. **Handle connection errors:** Implement retry logic with exponential backoff
3. **Monitor network health:** Track connection failures and latency
4. **Use connection pooling:** Maintain healthy connection pools
5. **Plan for restarts:** Design applications to handle temporary connection failures
6. **Keep connections alive:** Configure TCP keep-alive appropriately
7. **Optimize queries:** Reduce query execution time to avoid timeout issues

## Debugging steps {#debugging-steps}

1. **Identify error type:**

   ```sql
   SELECT 
       event_time,
       query_id,
       exception,
       query_duration_ms
   FROM system.query_log
   WHERE exception_code = 210
       AND event_date >= today() - 1
   ORDER BY event_time DESC
   LIMIT 20;
   ```

2. **Check for specific error patterns:**

   ```sql
   SELECT 
       countIf(exception LIKE '%Broken pipe%') AS broken_pipe,
       countIf(exception LIKE '%Connection refused%') AS conn_refused,
       countIf(exception LIKE '%Socket is not connected%') AS socket_not_conn,
       countIf(exception LIKE '%Connection reset%') AS conn_reset
   FROM system.query_log
   WHERE exception_code = 210
       AND event_date >= today() - 1;
   ```

3. **Check for pod restarts (Kubernetes):**

   ```bash
   # Check restart count
   kubectl get pods -n your-namespace
   
   # Check recent events
   kubectl get events -n your-namespace \
       --sort-by='.lastTimestamp' | grep -i restart
   ```

4. **Monitor distributed query failures:**

   ```sql
   SELECT 
       event_time,
       query_id,
       exception
   FROM system.query_log
   WHERE exception LIKE '%ALL_CONNECTION_TRIES_FAILED%'
       AND event_date >= today() - 1
   ORDER BY event_time DESC;
   ```

5. **Check network connectivity:**

   ```bash
   # Test connection to ClickHouse
   telnet your-server 9000
   
   # Check for packet loss
   ping -c 100 your-server
   
   # Trace network route
   traceroute your-server
   ```

6. **Review query duration vs client timeout:**

   ```sql
   SELECT 
       query_id,
       query_duration_ms / 1000 AS duration_sec,
       exception
   FROM system.query_log
   WHERE query_id = 'your_query_id';
   ```

## Special considerations {#special-considerations}

**For "broken pipe" errors:**
- Usually indicates client disconnected
- Query may have completed successfully before disconnect
- Common with long-running queries and short client timeouts
- Often not a server-side issue

**For "connection refused" errors:**
- Server not ready to accept connections
- Common during pod restarts or scaling
- Temporary and usually resolved by retry
- Check if server is actually running

**For "socket not connected" errors:**
- Appears in `ServerErrorHandler` logs
- Often logged after query already completed
- Client disconnected before server could send final response
- Usually benign if query completed successfully

**For distributed queries:**
- Each shard connection can fail independently
- `ALL_CONNECTION_TRIES_FAILED` means no replicas are accessible
- Check network between cluster nodes
- Verify all nodes are running

## Common error subcategories {#error-subcategories}

**Broken pipe (errno 32):**
- Client closed write end of connection
- Server trying to send data to closed socket
- Usually client-side timeout or crash

**Connection refused (errno 111):**
- No process listening on target port
- Server not started or port closed
- Firewall blocking connection
- Wrong hostname or port

**Socket not connected (errno 107):**
- Operation on socket that isn't connected
- Client disconnected before operation
- Premature connection close

**Connection reset by peer (errno 104):**
- Remote side sent TCP RST
- Forceful connection termination
- Often due to firewall or remote crash

## Network error settings {#network-settings}

```xml
<!-- Server configuration -->
<clickhouse>
    <!-- Connection timeouts -->
    <connect_timeout>10</connect_timeout>
    <connect_timeout_with_failover_ms>50</connect_timeout_with_failover_ms>
    
    <!-- Send/receive timeouts -->
    <send_timeout>300</send_timeout>
    <receive_timeout>300</receive_timeout>
    
    <!-- TCP keep-alive -->
    <tcp_keep_alive_timeout>300</tcp_keep_alive_timeout>
    
    <!-- Retry settings for distributed queries -->
    <distributed_connections_pool_size>1024</distributed_connections_pool_size>
</clickhouse>
```

## Handling in distributed queries {#distributed-queries}

For distributed queries with failover:

```sql
-- Use max_replica_delay_for_distributed_queries for fallback
SET max_replica_delay_for_distributed_queries = 300;

-- Configure connection attempts
SET connect_timeout_with_failover_ms = 1000;
SET connections_with_failover_max_tries = 3;

-- Skip unavailable shards
SET skip_unavailable_shards = 1;
```

## Client-side best practices {#client-best-practices}

1. **Set realistic timeouts:**
   ```python
   # Match timeout to expected query duration
   client = get_client(
       send_receive_timeout=query_expected_duration + 60
   )
   ```

2. **Implement retry logic:**
   ```python
   # Retry on network errors
   @retry(stop=stop_after_attempt(3), 
          wait=wait_exponential(multiplier=1, min=2, max=10),
          retry=retry_if_exception_type(NetworkError))
   def execute_query(query):
       return client.execute(query)
   ```

3. **Handle long-running queries:**
   ```sql
   -- For queries > 1 hour, materialize results
   CREATE TABLE result_table ENGINE = MergeTree() ORDER BY id AS
   SELECT * FROM long_running_query;
   
   -- Then query the result table
   SELECT * FROM result_table;
   ```

4. **Monitor connection health:**
    - Log connection errors on client side
    - Track retry counts
    - Alert on sustained network errors

## Distinguishing from other errors {#distinguishing-errors}

- **`NETWORK_ERROR (210)`:** Network/socket I/O failure
- **`SOCKET_TIMEOUT (209)`:** Timeout during socket operation
- **`TIMEOUT_EXCEEDED (159)`:** Query execution time limit
- **`ALL_CONNECTION_TRIES_FAILED (279)`:** All connection attempts failed

`NETWORK_ERROR` is specifically about connection failures and broken sockets.

## Query patterns that commonly trigger this {#common-patterns}

1. **Long-running `SELECT` queries:**
    - Query duration exceeds client timeout
    - Results in broken pipe when server tries to send results

2. **Large data transfers:**
    - Client buffer overflows
    - Client application can't keep up with data rate

3. **`INSERT INTO ... SELECT FROM s3()`:**
    - Long-running imports from S3
    - Client timeout during multi-hour operations

4. **Distributed queries:**
    - Connection to remote shards fails
    - Network issues between cluster nodes

If you're experiencing this error:
1. Check the specific error message (broken pipe, connection refused, etc.)
2. For "broken pipe": verify client timeout settings and query duration
3. For "connection refused": check if the server is running and accessible
4. For "socket not connected": usually harmless if query completed
5. Test network connectivity between client and server
6. Check for pod restarts or infrastructure changes (Cloud/Kubernetes)
7. Implement retry logic for transient network failures
8. For very long queries (>1 hour), consider alternative patterns
9. Monitor frequency - occasional errors are normal, sustained errors need investigation

**Related documentation:**
- [ClickHouse server settings](https://clickhouse.com/docs/operations/server-configuration-parameters/settings)
- [Distributed query settings](https://clickhouse.com/docs/operations/settings/settings#distributed-queries)
