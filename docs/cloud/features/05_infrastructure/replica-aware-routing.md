---
title: 'Replica-aware routing'
slug: /manage/replica-aware-routing
description: 'How to use Replica-aware routing to increase cache re-use'
keywords: ['cloud', 'sticky endpoints', 'sticky', 'endpoints', 'sticky routing', 'routing', 'replica aware routing', 'session_id']
doc_type: 'guide'
unlisted: true
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge/>

Replica-aware routing (also known as sticky sessions, sticky routing, or session affinity) increases the chance of cache reuse by consistently routing related requests to the same ClickHouse replica. It's best-effort and doesn't guarantee isolation.

:::warning Protocol support — HTTP/HTTPS only
Replica-aware routing is applied at the proxy layer over the **HTTP/HTTPS interface**, using the `session_id` query parameter (see below). It's **not available over the native protocol** (native port, e.g. the `clickhouse-go` driver).
:::

## HTTP-based routing (session_id) {#http-based-routing}

To route a workload to a replica, set the `session_id` query parameter on the HTTPS interface. The proxy parses the request and uses consistent hashing on the `session_id` to select a replica, so all requests sharing the same `session_id` are routed to the same server — until the cluster topology changes. The `session_id` can be any string you choose.

```bash
echo 'SELECT hostName()' | curl \
  -H 'X-ClickHouse-User: default' -H 'X-ClickHouse-Key: <password>' \
  'https://<host>:8443/?session_id=my-workload-1' -d @-
```

Every request carrying `session_id=my-workload-1` lands on the same replica. A different `session_id` value hashes independently and may land on the same or a different replica. You don't choose *which* replica a given value maps to.

## Subdomain-based routing {#subdomain-based-routing}

:::note
We no longer onboard new services to the subdomain-based routing flow. Use the [HTTP-based `session_id` method](#http-based-routing) instead.
:::

Previously, enabling replica-aware routing allowed a wildcard subdomain on top of the service hostname. For a service with the host name `abcxyz123.us-west-2.aws.clickhouse.cloud`, any hostname matching `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` (e.g. `aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`) was hashed by Envoy to a consistent replica. This is no longer available, and the feature won't be enabled on new services because it doesn't scale. Each sticky endpoint requires its own TLS certificate, and there's a limit to how many certificates are available.

## Limitations of replica-aware routing {#limitations-of-replica-aware-routing}

### Replica-aware routing doesn't guarantee isolation {#replica-aware-routing-does-not-guarantee-isolation}

Any disruption to the service — server pod restarts (version upgrade, crash, vertical scaling), or scale out / in — changes the routing hash ring. This could cause requests sharing the same `session_id` to land on a different server pod.

### Replica-aware routing requires the HTTP protocol {#replica-aware-routing-requires-http}

Sticky routing is keyed on the `session_id` query parameter, which only exists on the HTTP/HTTPS interface. The native binary protocol carries no such parameter for the proxy to hash on, so replica-aware routing is not available over the native protocol. Native-protocol clients must move the relevant workload to the HTTP interface to use this feature.

## Configuring replica-aware routing {#configuring-replica-aware-routing}

To enable replica-aware routing, contact [our support team](https://clickhouse.com/support/program).
