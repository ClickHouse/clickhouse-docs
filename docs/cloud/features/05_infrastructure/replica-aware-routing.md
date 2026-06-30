---
title: 'Replica-aware routing'
slug: /manage/replica-aware-routing
description: 'Route HTTP queries to the same ClickHouse Cloud replica using session_id for cache reuse and session state'
keywords: ['cloud', 'sticky routing', 'session affinity', 'session_id', 'replica aware routing', 'sticky endpoints', 'temporary tables', 'cache reuse']
doc_type: 'guide'
unlisted: true
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge/>

Replica-aware routing (also called sticky routing or session affinity) sends related queries to the same ClickHouse Cloud replica. You add a `session_id` query parameter to your HTTPS requests, and the proxy uses consistent hashing to route all requests with the same value to the same replica. The feature is best-effort: it improves cache reuse and keeps session-scoped objects reachable, but it does not guarantee isolation or a fixed replica forever.

:::warning Protocol support — HTTP/HTTPS only
Replica-aware routing runs at the proxy layer over the [HTTP/HTTPS interface](/interfaces/http). It uses the `session_id` query parameter described below. It is **not available over the native protocol** (native port, e.g. the `clickhouse-go` driver in its default native mode). If you need sticky routing from a native-protocol client, connect that workload over HTTP instead — for `clickhouse-go` (v2), set `Protocol: clickhouse.HTTP` on the connection.
:::

## Why use replica-aware routing? {#why-use-replica-aware-routing}

**Temporary tables and session state.** [Temporary tables](/sql-reference/statements/create/table#temporary-table) and named [ClickHouse sessions](/interfaces/http#using-clickhouse-sessions-in-the-http-protocol) exist only on the server that created them. If your next query lands on a different replica, the temporary table is gone. Replica-aware routing keeps related queries on the same server so session-scoped objects stay accessible.

**Faster repeated queries through cache reuse.** When the same replica handles your queries repeatedly, its local caches (file data, metadata, decompressed blocks) stay warm for your workload. Without replica-aware routing, each query might hit a different replica with a cold cache. For broader cache sharing across replicas, see the [query cache](/operations/query-cache) and distributed cache in ClickHouse Cloud.

## Route queries with session_id {#http-based-routing}

Once replica-aware routing is enabled on your service, add a `session_id` query parameter to your ClickHouse HTTPS URL. The value can be any string you choose — the server does not assign it. All requests that share the same `session_id` route to the same replica.

Without replica-aware routing, each request may land on a different replica:

```bash
# Each request could hit a different replica.
echo 'SELECT hostName()' | curl \
  -H 'X-ClickHouse-User: default' -H 'X-ClickHouse-Key: <password>' \
  'https://abc123.us-west-2.aws.clickhouse.cloud:8443' -d @-
```

With replica-aware routing, requests that share a `session_id` go to the same replica:

```bash
echo 'SELECT hostName()' | curl \
  -H 'X-ClickHouse-User: default' -H 'X-ClickHouse-Key: <password>' \
  'https://abc123.us-west-2.aws.clickhouse.cloud:8443/?session_id=my-analytics' -d @-
```

Use different `session_id` values to group workloads independently. Each value hashes to a replica on its own — you do not choose which replica a given value maps to, but the mapping stays consistent until the cluster topology changes.

```bash
# session_id=dashboard-queries → routes to one replica
echo 'SELECT hostName()' | curl \
  -H 'X-ClickHouse-User: default' -H 'X-ClickHouse-Key: <password>' \
  'https://abc123.us-west-2.aws.clickhouse.cloud:8443/?session_id=dashboard-queries' -d @-

# session_id=etl-pipeline → may route to a different replica
echo 'SELECT hostName()' | curl \
  -H 'X-ClickHouse-User: default' -H 'X-ClickHouse-Key: <password>' \
  'https://abc123.us-west-2.aws.clickhouse.cloud:8443/?session_id=etl-pipeline' -d @-
```

This approach has a few practical properties:

- The `session_id` is any string you choose — an application name, user identifier, workload category, or other grouping key.
- Requests without a `session_id` are unaffected and continue to use normal load balancing.
- You use your existing service URL. No special hostnames or DNS changes are required.
- Any HTTP client that can add a query parameter works: `curl`, [clickhouse-connect](/integrations/language-clients/python/driver-api), JDBC/ODBC drivers, and others.

### Verify which replica handles your queries {#verify-replica-routing}

Run `hostName()` with your `session_id` to see which replica handles the request:

```bash
echo 'SELECT hostName()' | curl \
  'https://<your-service-host>:8443/?session_id=my-session' \
  -H 'X-ClickHouse-User: default' \
  -H 'X-ClickHouse-Key: <password>' -d @-
```

After scaling or a restart, check when the replica started to confirm whether your session moved:

```bash
echo "SELECT now() - toIntervalSecond(uptime()) AS server_start_time" | curl \
  'https://<your-service-host>:8443/?session_id=my-session' \
  -H 'X-ClickHouse-User: default' \
  -H 'X-ClickHouse-Key: <password>' -d @-
```

### Use session_id from client libraries {#client-libraries}

**Python (clickhouse-connect).** Pass `session_id` when creating the client or per query. See [Driver API — session_id](/integrations/language-clients/python/driver-api#core-parameters).

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host='<your-service-host>',
    username='default',
    password='<password>',
    secure=True,
    session_id='my-analytics',
)
client.query('SELECT hostName()')
```

**Go (clickhouse-go over HTTP).** Switch to HTTP and pass `session_id` as a setting. See [TCP vs HTTP](/integrations/language-clients/go/configuration#tcp-vs-http).

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:     []string{"<your-service-host>:8443"},
    Protocol: clickhouse.HTTP,
    Auth: clickhouse.Auth{
        Username: "default",
        Password: "<password>",
    },
    Settings: clickhouse.Settings{
        "session_id": "my-analytics",
    },
})
```

**Java (clickhouse-java).** `session_id` is a ClickHouse server setting. Pass it with `serverSetting()` on the client or per query. See [Java client — serverSetting](/integrations/language-clients/java/client/client).

```java
QuerySettings querySettings = new QuerySettings()
    .serverSetting("session_id", "my-analytics");

try (Records response = client.query("SELECT hostName()", querySettings)
        .get(10, TimeUnit.SECONDS)) {
    // handle data
}
```

## Prerequisites {#prerequisites}

Replica-aware routing requires:

- **Two or more replicas.** On a single-replica service, every request already goes to the same server.
- **A running service.** Idle services do not currently support replica-aware routing.
- **A supported deployment.** Standard ClickHouse Cloud services are supported. [Bring Your Own Cloud (BYOC)](/cloud/reference/byoc/overview) is not yet supported.
- **An eligible plan.** Replica-aware routing is available on Enterprise tier by default. Scale tier customers can request access through their account team or [support](https://clickhouse.com/support/program).

## Enable replica-aware routing {#configuring-replica-aware-routing}

Replica-aware routing is enabled per service through a data plane feature flag. To turn it on:

1. Open a [support ticket](https://clickhouse.com/support/program).
2. Ask to enable HTTP-based replica-aware routing on your service.
3. Include your service ID and why you need it (cache reuse, temporary tables, session state, and so on).

The ClickHouse team typically enables the feature within one business day. Once enabled, add `?session_id=<value>` to your queries immediately — no restart or downtime is required.

## Test replica-aware routing {#test-replica-aware-routing}

After the feature is enabled, confirm that the same `session_id` consistently hits the same replica:

```bash
for i in {1..5}; do
  echo 'SELECT hostName()' | curl -s \
    'https://<your-service-host>:8443/?session_id=test-123' \
    -H 'X-ClickHouse-User: default' \
    -H 'X-ClickHouse-Key: <password>' -d @-
done
```

Then try a different `session_id` and confirm it may route elsewhere:

```bash
for i in {1..5}; do
  echo 'SELECT hostName()' | curl -s \
    'https://<your-service-host>:8443/?session_id=different-session' \
    -H 'X-ClickHouse-User: default' \
    -H 'X-ClickHouse-Key: <password>' -d @-
done
```

There can be a short delay (usually under a minute) between when the feature is enabled and when routing takes effect.

## Migrate from sticky subdomains {#migrate-from-sticky-subdomains}

If you use the older `.sticky.` subdomain method, you can switch to `session_id` with zero downtime — both methods can run at the same time during the transition.

### Step 1: Validate on a secondary service {#migration-step-1-sandbox}

Create a read-only [secondary service](/cloud/reference/warehouses) that shares data with your primary service. This gives you a safe environment to test the new approach against real data without affecting production. The secondary service can have replica-aware routing enabled with the `session_id` method while you validate.

### Step 2: Test the session_id parameter {#migration-step-2-validate}

Point a test instance of your application at the secondary service and switch from the `.sticky.` subdomain to the `session_id` parameter:

Before (subdomain):

```text
https://my-label.sticky.abc123.us-west-2.aws.clickhouse.cloud:8443
```

After (`session_id`):

```text
https://<sandbox-host>:8443/?session_id=my-label
```

Verify that queries with the same `session_id` consistently hit the same replica, your application works with query parameters, and any temporary-table workflows still function.

### Step 3: Switch production {#migration-step-3-production}

Once validation passes, contact [support](https://clickhouse.com/support/program) to enable `session_id` routing on your primary service. Both methods work simultaneously during the transition, so you can update production URLs at your own pace:

```text
https://abc123.us-west-2.aws.clickhouse.cloud:8443/?session_id=my-label
```

You can reuse your old subdomain label as the new `session_id` value to keep routing intuitive.

### Step 4: Clean up {#migration-step-4-cleanup}

After your application is fully switched over, let support know so they can disable the old subdomain-based routing on your service. Tear down the secondary service when you no longer need it.

## Subdomain-based routing (deprecated) {#subdomain-based-routing-deprecated}

:::danger Deprecated
The subdomain-based mechanism below is **deprecated** and is no longer enabled on new services. It does not scale (each sticky endpoint requires its own TLS certificate). Use the [HTTP-based `session_id` method](#http-based-routing) instead.
:::

Previously, replica-aware routing used a wildcard subdomain on top of the service hostname. For a service with the host name `abcxyz123.us-west-2.aws.clickhouse.cloud`, any hostname matching `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` (e.g. `aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`) was hashed by the proxy to a consistent replica. The original hostname continued to use `LEAST_CONNECTION` load balancing.

This approach required extra DNS configuration for customers using [Private Link](/cloud/security/aws-privatelink), and certificate limits constrained how many sticky hostnames could be provisioned. The `session_id` method avoids both problems.

## Limitations {#limitations-of-replica-aware-routing}

### Stickiness breaks during service changes {#replica-aware-routing-does-not-guarantee-isolation}

Replica-aware routing uses a mapping algorithm that is recalculated when the number of replicas changes. Scaling up or down, server restarts (version upgrades, maintenance, or crash recovery), and vertical scaling can all shift which replica handles a given `session_id`.

Design your application to handle occasional replica changes. If you rely on temporary tables, be prepared to recreate them when your session moves to a new replica.

### Subdomain routing required Private Link DNS setup {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

The deprecated subdomain method required customers to add DNS entries for the `*.sticky.*` hostname pattern, especially with Private Link. The `session_id` method uses your normal service URL and works without additional DNS configuration.

### Behavior difference when migrating from subdomains {#subdomain-vs-session-id-behavior}

With the old subdomain method, all requests over the same network connection went to the same replica because routing happened at the network level. With `session_id`, routing happens per HTTP request.

In practice:

- Without a `session_id`, two queries on the same connection might hit different replicas.
- With a `session_id`, stickiness works regardless of connection reuse.
- If you use [`SET`](/sql-reference/statements/set) commands for session-level settings, include a `session_id` so those settings persist on subsequent queries to the same replica.

### Replica-aware routing is not workload isolation {#replica-aware-routing-is-not-isolation}

Replica-aware routing controls which replica handles your request. It does not dedicate compute or prevent other workloads from using the same replica. For dedicated read compute, use [compute-compute separation](/cloud/reference/warehouses) to create a separate service with its own resources.

### HTTP protocol required {#replica-aware-routing-requires-http}

Sticky routing is keyed on the `session_id` query parameter, which exists only on the HTTP/HTTPS interface. The native binary protocol carries no such parameter for the proxy to hash on. Native-protocol clients must move the relevant workload to HTTP to use this feature.

## Troubleshooting {#troubleshooting}

### Queries hit different replicas despite using session_id {#troubleshooting-different-replicas}

- Confirm the URL format. `session_id` must be a query parameter: `?session_id=my-value`. It is not an HTTP header.
- Wait briefly after enablement. Routing can take up to a minute to take effect.
- Check for recent scaling events. If replicas were added or removed, the mapping changed. Run `SELECT hostName()` with each `session_id` to discover the new mapping.

### A different replica after scaling {#troubleshooting-after-scaling}

This is expected. After scaling, use `SELECT hostName()` with each of your `session_id` values to learn the new mapping. If cache warmth matters, shift traffic gradually to let caches warm on the new replica.

### I need guaranteed isolation {#troubleshooting-isolation}

Replica-aware routing and workload isolation are different concerns. If you need dedicated compute that does not share resources with other queries, look at [compute-compute separation](/cloud/reference/warehouses) instead.

### My .sticky. subdomain stopped working {#troubleshooting-sticky-subdomain}

Contact [support](https://clickhouse.com/support/program). If you are mid-migration, both subdomain and `session_id` routing should be active at the same time. Support can verify the configuration on your service.

## Old vs. new approach {#comparison-old-vs-new}

| | Subdomain-based (deprecated) | Session ID (recommended) |
|:---|:---|:---|
| How you use it | Connect to a `*.sticky.*` hostname | Add `?session_id=<value>` to your normal URL |
| DNS changes | Required, especially for Private Link | None |
| Private Link | Manual DNS setup | Works with your existing endpoint |
| Client changes | Change the hostname | Add a query parameter |
| BYOC support | Yes | Not yet |
| Status | Being deprecated | Recommended |
