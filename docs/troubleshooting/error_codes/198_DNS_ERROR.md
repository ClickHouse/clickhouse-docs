---
slug: /troubleshooting/error-codes/198_DNS_ERROR
sidebar_label: '198 DNS_ERROR'
doc_type: 'reference'
keywords: ['error codes', 'DNS_ERROR', '198']
title: '198 DNS_ERROR'
description: 'ClickHouse error code - 198 DNS_ERROR'
---

# Error 198: DNS_ERROR

:::tip
This error occurs when ClickHouse cannot resolve a hostname to an IP address through DNS lookup.
It indicates that DNS resolution failed for a hostname used in cluster configuration, distributed queries, or external connections.
:::

## Most common causes {#most-common-causes}

1. **Hostname does not exist**
    - Hostname is misspelled in configuration
    - Pod or service not yet created in Kubernetes
    - Server has been decommissioned or renamed
    - DNS record not created or has been deleted

2. **DNS server issues**
    - DNS server is unreachable or down
    - Network connectivity problems to DNS server
    - DNS server timeout or slow response
    - Incorrect DNS server configuration

3. **Kubernetes service discovery problems**
    - Pods not ready when DNS lookup occurs
    - Service endpoints are not yet available
    - Headless service DNS not propagated
    - CoreDNS or kube-dns issues in cluster

4. **Cluster configuration errors**
    - Wrong hostname in cluster configuration
    - Hostname referencing nodes that don't exist
    - Typo in `remote_servers` configuration
    - Stale configuration with old hostnames

5. **DNS cache issues**
    - Cached DNS entries for deleted hosts
    - DNS TTL expiration causing lookups for removed hosts
    - ClickHouse DNS cache not updated after infrastructure changes

6. **Network or firewall issues**
    - Firewall blocking DNS queries (port 53)
    - Network segmentation preventing DNS access
    - DNS resolution timeout too short

## Common solutions {#common-solutions}

**1. Verify hostname resolution manually**

```bash
# Test DNS resolution from ClickHouse server
nslookup hostname.domain.com

# Or using dig
dig hostname.domain.com

# Check from ClickHouse pod (Kubernetes)
kubectl exec -it clickhouse-pod -- nslookup service-name.namespace.svc.cluster.local
```

**2. Check cluster configuration**

```xml
<!-- Verify remote_servers configuration -->
<remote_servers>
    <cluster_name>
        <shard>
            <replica>
                <!-- Ensure hostname is correct -->
                <host>correct-hostname.domain.com</host>
                <port>9000</port>
            </replica>
        </shard>
    </remote_servers>
</remote_servers>
```

**3. Check ClickHouse DNS resolver logs**

```sql
-- View DNS resolution errors in logs
SELECT 
    event_time,
    logger_name,
    message
FROM system.text_log
WHERE logger_name = 'DNSResolver'
  AND level IN ('Error', 'Warning')
  AND event_date >= today() - 1
ORDER BY event_time DESC
LIMIT 100;
```

**4. Clear ClickHouse DNS cache**

ClickHouse caches DNS lookups. If hostnames have changed:

```sql
-- Force reload of cluster configuration
SYSTEM RELOAD CONFIG;

-- Or restart ClickHouse server
```

**5. Fix Kubernetes service issues**

```bash
# Check if pods are ready
kubectl get pods -n your-namespace

# Check service endpoints
kubectl get endpoints service-name -n your-namespace

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns

# Restart CoreDNS if needed
kubectl rollout restart deployment/coredns -n kube-system
```

**6. Verify DNS server configuration**

```bash
# Check /etc/resolv.conf
cat /etc/resolv.conf

# Test DNS server accessibility
ping dns-server-ip
```

**7. Update cluster configuration**

Remove non-existent hosts from configuration:

```xml
<remote_servers>
    <cluster_name>
        <shard>
            <!-- Remove or comment out hosts that don't exist -->
            <!--
            <replica>
                <host>old-hostname-that-does-not-exist</host>
                <port>9000</port>
            </replica>
            -->
        </shard>
    </cluster_name>
</remote_servers>
```

## Common scenarios {#common-scenarios}

**Scenario 1: Kubernetes pod not ready**

```text
Error: Cannot resolve host (pod-name.headless-service.namespace.svc.cluster.local), 
error 0: Host not found
```

**Cause:** Pod not yet started or service endpoints not available.

**Solution:**
- Wait for pods to become ready
- Check pod status: `kubectl get pods`
- Verify headless service has endpoints: `kubectl get endpoints`

**Scenario 2: Stale cluster configuration**

```text
DNSResolver: Cannot resolve host (old-server-name), error 0: Host not found
DNSResolver: Cached hosts dropped: old-server-name
DNSCacheUpdater: IPs of some hosts have been changed. Will reload cluster config
```

**Cause:** Configuration references servers that have been removed.

**Solution:**
- Update cluster configuration to remove old hosts
- Reload configuration: `SYSTEM RELOAD CONFIG`
- Or restart ClickHouse server

**Scenario 3: DNS server unreachable**

```text
Error: Cannot resolve host, error: Temporary failure in name resolution
```

**Cause:** DNS server is down or unreachable.

**Solution:**
- Check DNS server status
- Verify network connectivity
- Test DNS resolution manually: `nslookup hostname`
- Check `/etc/resolv.conf` for correct DNS servers

**Scenario 4: Embedded Keeper quorum issues**

```text
DNSResolver: Cannot resolve host (node-3.cluster.local), error 0: Host not found
```

**Cause:** Keeper nodes not yet available or wrong hostname.

**Solution:**
- Ensure all Keeper nodes are started
- Verify Keeper configuration has correct hostnames
- Check Keeper logs for connectivity issues

## Prevention tips {#prevention-tips}

1. **Use valid hostnames:** Verify hostnames exist before adding to configuration
2. **Test DNS resolution:** Use `nslookup` or `dig` to test hostnames before configuring
3. **Monitor DNS health:** Set up monitoring for DNS server availability
4. **Use DNS caching wisely:** Consider DNS TTL settings for dynamic environments
5. **Keep configuration current:** Remove decommissioned servers from cluster config
6. **Kubernetes readiness:** Ensure pods are ready before ClickHouse tries to connect
7. **Use StatefulSets:** In Kubernetes, use StatefulSets for predictable DNS names

## Debugging steps {#debugging-steps}

1. **Identify failing hostname:**

   ```sql
   SELECT message
   FROM system.text_log
   WHERE message LIKE '%Cannot resolve host%'
     AND event_date >= today()
   ORDER BY event_time DESC
   LIMIT 10;
   ```

2. **Test DNS resolution:**

   ```bash
   # From ClickHouse server
   nslookup failing-hostname
   
   # Check if DNS server responds
   dig @dns-server-ip failing-hostname
   ```

3. **Check cluster configuration:**

   ```sql
   -- View cluster configuration
   SELECT *
   FROM system.clusters
   WHERE cluster = 'your_cluster';
   ```

4. **Monitor DNS cache updates:**

   ```sql
   SELECT 
       event_time,
       message
   FROM system.text_log
   WHERE logger_name = 'DNSCacheUpdater'
     AND event_date >= today()
   ORDER BY event_time DESC
   LIMIT 20;
   ```

5. **Check network connectivity:**

   ```bash
   # Ping DNS server
   ping dns-server-ip
   
   # Check DNS port accessibility
   nc -zv dns-server-ip 53
   
   # Test from specific pod (Kubernetes)
   kubectl exec -it pod-name -- ping dns-server-ip
   ```

6. **Review Kubernetes events (if applicable):**

   ```bash
   kubectl get events -n your-namespace --sort-by='.lastTimestamp'
   ```

## Special considerations {#special-considerations}

**For Kubernetes deployments:**
- Headless services create DNS entries for each pod
- StatefulSet pods have predictable DNS names: `pod-name-0.service-name.namespace.svc.cluster.local`
- DNS may not be immediately available when pods are starting
- CoreDNS issues can affect entire cluster

**For distributed clusters:**
- All nodes must be able to resolve each other's hostnames
- DNS failures on one node can affect distributed queries
- Consider using IP addresses for critical internal connections (though less flexible)

**For ClickHouse Keeper:**
- All Keeper nodes must be resolvable by name
- Keeper quorum formation requires DNS resolution
- Wrong hostname in Keeper config prevents cluster formation

**DNS cache behavior:**
- ClickHouse caches DNS lookups to reduce DNS queries
- Cache is updated periodically (default: every 15 seconds)
- Failed lookups are also cached temporarily
- `SYSTEM RELOAD CONFIG` forces DNS cache refresh

## Configuration settings {#configuration-settings}

DNS-related settings in ClickHouse configuration:

```xml
<clickhouse>
    <!-- DNS cache update period in seconds -->
    <dns_cache_update_period>15</dns_cache_update_period>
    
    <!-- Disable DNS cache (not recommended for production) -->
    <disable_internal_dns_cache>0</disable_internal_dns_cache>
</clickhouse>
```

## When DNS errors persist {#when-errors-persist}

If DNS errors continue after basic troubleshooting:

1. **Use IP addresses temporarily:**
   ```xml
   <remote_servers>
       <cluster>
           <shard>
               <replica>
                   <!-- Use IP instead of hostname as temporary workaround -->
                   <host>192.168.1.10</host>
                   <port>9000</port>
               </replica>
           </shard>
       </cluster>
   </remote_servers>
   ```

2. **Add entries to /etc/hosts:**
   ```bash
   # Add static DNS entries
   echo "192.168.1.10 server-name.domain.com" >> /etc/hosts
   ```

3. **Configure alternative DNS servers:**
   ```bash
   # Edit /etc/resolv.conf
   nameserver 8.8.8.8
   nameserver 8.8.4.4
   ```

4. **Increase DNS timeout:**
    - Check system DNS resolver timeout settings
    - Consider increasing if network latency is high

If you're experiencing this error:
1. Identify which hostname is failing from error logs
2. Test DNS resolution manually with `nslookup` or `dig`
3. Verify the hostname exists and is spelled correctly
4. Check DNS server availability and accessibility
5. For Kubernetes: ensure pods are ready and service endpoints exist
6. Update cluster configuration to remove non-existent hosts
7. Reload ClickHouse configuration or restart server
8. Monitor DNS cache updates in ClickHouse logs