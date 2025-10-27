---
slug: /troubleshooting/error-codes/209_SOCKET_TIMEOUT
sidebar_label: '209 SOCKET_TIMEOUT'
doc_type: 'reference'
keywords: ['error codes', 'SOCKET_TIMEOUT', '209']
title: '209 SOCKET_TIMEOUT'
description: 'ClickHouse error code - 209 SOCKET_TIMEOUT'
---

# Error 209: SOCKET_TIMEOUT

:::tip
This error occurs when a network socket operation (reading or writing) exceeds the configured timeout period.
It indicates that data could not be sent to or received from a network connection within the allowed time, typically due to network issues, slow client response, or overloaded connections.
:::

## Most common causes {#most-common-causes}

1. **Network connectivity issues**
    - Network latency or packet loss
    - Unstable network connection
    - Firewall or network security appliance delays
    - Network congestion between client and server

2. **Client not reading data fast enough**
    - Client application blocked or frozen
    - Client receive buffer full
    - Client is processing slower than server sending
    - Client-side timeout shorter than data transfer time

3. **Large result sets**
    - Query returning huge amount of data
    - Client unable to consume data at required rate
    - Network bandwidth insufficient for data volume
    - No `LIMIT` clause on queries returning millions of rows

4. **Slow or overloaded client**
    - Client CPU or memory exhausted
    - Client garbage collection pauses
    - Client application not responsive
    - Too many concurrent connections on client

5. **TCP window exhaustion**
    - Client TCP receive window fills up (window size = 1)
    - Client not acknowledging packets fast enough
    - TCP backpressure from slow consumer

6. **Load balancer or proxy timeout**
    - Intermediate proxy timing out connection
    - Load balancer idle timeout
    - Service mesh timeout configuration

## Common solutions {#common-solutions}

**1. Increase timeout settings**

```sql
-- Server-side settings (in config.xml or user settings)
<send_timeout>300</send_timeout>
<receive_timeout>300</receive_timeout>

-- Or set per query
SET send_timeout = 600;
SET receive_timeout = 600;
```

**2. Reduce result set size**

```sql
-- Add LIMIT to queries
SELECT * FROM large_table
LIMIT 10000;

-- Use pagination
SELECT * FROM large_table
ORDER BY id
LIMIT 10000 OFFSET 0;

-- Filter data more aggressively
SELECT * FROM large_table
WHERE date >= today() - INTERVAL 1 DAY;
```

**3. Use compression**

```sql
-- Enable compression to reduce data transfer
SET enable_http_compression = 1;
SET http_zlib_compression_level = 3;
```

For client connections:

```python
# Python clickhouse-connect
client = clickhouse_connect.get_client(
    host='your-host',
    compress=True
)
```

**4. Optimize client data consumption**

```python
# Stream results instead of loading all into memory
# Python example
for row in client.query_rows_stream(query):
    process_row(row)  # Process immediately

# Don't do this for large results:
# result = client.query(query)  # Loads all into memory
```

**5. Check network connectivity**

```bash
# Test network latency
ping your-clickhouse-server

# Check for packet loss
mtr your-clickhouse-server

# Test bandwidth
iperf3 -c your-clickhouse-server

# Check TCP settings
netstat -an | grep ESTABLISHED
```

**6. Configure TCP keep-alive**

```xml
<!-- In ClickHouse config.xml -->
<tcp_keep_alive_timeout>300</tcp_keep_alive_timeout>
<tcp_keep_alive_interval>10</tcp_keep_alive_interval>
```

Client-side (Linux):

```bash
# Configure TCP keep-alive
sysctl -w net.ipv4.tcp_keepalive_time=300
sysctl -w net.ipv4.tcp_keepalive_intvl=60
sysctl -w net.ipv4.tcp_keepalive_probes=9
```

**7. Increase client buffer sizes**

```python
# JDBC example
Properties props = new Properties();
props.setProperty("socket_timeout", "300000");  // 5 minutes
props.setProperty("socket_rcvbuf", "524288");   // 512KB receive buffer
props.setProperty("socket_sndbuf", "524288");   // 512KB send buffer
```

## Common scenarios {#common-scenarios}

**Scenario 1: Timeout writing to socket**

```text
Error: Code: 209. DB: Timeout exceeded while writing to socket
```

**Cause:** Client not consuming data fast enough, TCP window exhausted.

**Solution:**
- Add `LIMIT` to reduce result size
- Enable compression
- Increase `send_timeout` setting
- Optimize client to consume data faster
- Check client isn't blocked or frozen

**Scenario 2: Distributed query socket timeout**

```text
Error: Timeout exceeded while writing to socket (distributed query)
```

**Cause:** Remote shard not responding or network issue between nodes.

**Solution:**

```sql
-- Increase distributed query timeouts
SET send_timeout = 600;
SET receive_timeout = 600;
SET connect_timeout_with_failover_ms = 5000;
```

**Scenario 3: Client receive window = 1**

```text
TCP window size drops to 1 byte, then timeout
```

**Cause:** Client application stopped reading from socket.

**Solution:**
- Check client application health
- Ensure client is actively consuming results
- Verify client has sufficient resources (CPU, memory)
- Add rate limiting on server side

**Scenario 4: Network problems**

```text
Error: Timeout exceeded (with network packet loss visible in tcpdump)
```

**Cause:** Network connectivity issues, packet loss, or routing problems.

**Solution:**
- Diagnose network with `ping`, `traceroute`, `mtr`
- Check firewall rules and network ACLs
- Verify network bandwidth is sufficient
- Check for network security appliances causing delays

**Scenario 5: External network problems**

```text
Error: Code 209 timeout writing to socket
```

**Cause:** Issues with internet connectivity or cloud provider network.

**Solution:**
- Check cloud provider status page
- Verify VPC/network configuration
- Test connectivity from multiple locations
- Contact network or cloud support

## Prevention tips {#prevention-tips}

1. **Set appropriate timeouts:** Match client and server timeout settings
2. **Use LIMIT clauses:** Prevent queries from returning too much data
3. **Enable compression:** Reduce network bandwidth requirements
4. **Monitor network health:** Track latency and packet loss
5. **Optimize queries:** Return only needed data
6. **Stream results:** Process data as it arrives, don't buffer all
7. **Configure TCP properly:** Set appropriate keep-alive and buffer sizes

## Debugging steps {#debugging-steps}

1. **Check recent socket timeout errors:**

   ```sql
   SELECT 
       event_time,
       query_id,
       user,
       exception,
       query
   FROM system.query_log
   WHERE exception_code = 209
     AND event_date >= today() - 1
   ORDER BY event_time DESC
   LIMIT 10;
   ```

2. **Check current timeout settings:**

   ```sql
   SELECT 
       name,
       value
   FROM system.settings
   WHERE name LIKE '%timeout%' OR name LIKE '%send%' OR name LIKE '%receive%';
   ```

3. **Monitor active connections:**

   ```sql
   SELECT 
       user,
       address,
       elapsed,
       formatReadableSize(memory_usage) AS memory,
       query
   FROM system.processes
   WHERE elapsed > 60
   ORDER BY elapsed DESC;
   ```

4. **Check network statistics:**

   ```bash
   # On server
   netstat -s | grep -i timeout
   netstat -s | grep -i retrans
   
   # Check TCP connections
   ss -tn | grep ESTAB
   ```

5. **Capture network traffic (if needed):**

   ```bash
   # Capture packets for analysis
   tcpdump -i any -w socket_timeout.pcap host client-ip
   
   # Analyze with wireshark or tcpdump
   tcpdump -r socket_timeout.pcap -nn
   ```

6. **Check query result size:**

   ```sql
   SELECT 
       query_id,
       formatReadableSize(result_bytes) AS result_size,
       result_rows,
       query_duration_ms,
       query
   FROM system.query_log
   WHERE query_id = 'your_query_id';
   ```

## Special considerations {#special-considerations}

**For HTTP interface:**
- HTTP connections can be affected by load balancer timeouts
- Check `http_send_timeout` and `http_receive_timeout` settings
- Load balancers may have their own timeout configurations

**For distributed queries:**
- Timeout can occur when sending results between nodes
- Each hop adds latency
- Use `send_timeout` and `receive_timeout` for inter-node communication

**For large result sets:**
- Consider using `LIMIT` and pagination
- Use `SELECT` only needed columns, not `SELECT *`
- Apply filters to reduce data volume
- Consider materialized views for aggregations

**TCP window size = 1:**
- This is a strong indicator that the client stopped reading
- The server has data to send, but the client buffer is full
- Usually client-side issue, not ClickHouse issue

## Timeout-related settings {#timeout-settings}

```xml
<!-- Server configuration -->
<clickhouse>
    <!-- TCP socket timeouts (seconds) -->
    <send_timeout>300</send_timeout>
    <receive_timeout>300</receive_timeout>
    
    <!-- HTTP timeouts (seconds) -->
    <http_send_timeout>1800</http_send_timeout>
    <http_receive_timeout>1800</http_receive_timeout>
    
    <!-- TCP keep-alive (seconds) -->
    <tcp_keep_alive_timeout>300</tcp_keep_alive_timeout>
    
    <!-- Connection timeouts (seconds) -->
    <connect_timeout>10</connect_timeout>
    <connect_timeout_with_failover_ms>50</connect_timeout_with_failover_ms>
</clickhouse>
```

Query-level settings:

```sql
SET send_timeout = 600;          -- Timeout for sending data (seconds)
SET receive_timeout = 600;       -- Timeout for receiving data (seconds)
SET tcp_keep_alive_timeout = 300; -- TCP keep-alive timeout (seconds)
```

## Client-side configuration {#client-configuration}

**Python (clickhouse-connect):**

```python
client = clickhouse_connect.get_client(
    host='your-host',
    send_receive_timeout=300,  # Seconds
    compress=True
)
```

**JDBC:**

```java
Properties props = new Properties();
props.setProperty("socket_timeout", "300000");  // Milliseconds
props.setProperty("connect_timeout", "10000");
```

**HTTP:**

```bash
# Set timeout in curl
curl --max-time 300 'http://clickhouse:8123/?query=SELECT...'
```

## Distinguishing from `TIMEOUT_EXCEEDED (159)` {#vs-timeout-exceeded}

- **`SOCKET_TIMEOUT (209)`:** Network-level timeout during data transfer
- **`TIMEOUT_EXCEEDED (159)`:** Query execution time limit exceeded

`SOCKET_TIMEOUT` is about network I/O, while `TIMEOUT_EXCEEDED` is about query execution time.

If you're experiencing this error:
1. Check if client is actively consuming results
2. Verify network connectivity and latency
3. Add `LIMIT` to queries returning large results
4. Enable compression to reduce bandwidth usage
5. Increase `send_timeout` and `receive_timeout` if appropriate
6. Monitor client application health and resource usage
7. Check for TCP window size dropping to 1 (indicates client not reading)
8. Verify no intermediate proxies or load balancers timing out
9. Test with simpler/smaller queries to isolate the issue

**Related documentation:**
- [ClickHouse settings](/operations/settings/settings)
- [Server configuration parameters](/operations/server-configuration-parameters/settings)