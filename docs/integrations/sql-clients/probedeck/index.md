---
slug: /integrations/probedeck
sidebar_label: 'ProbeDeck'
description: 'Connect ProbeDeck on iOS or iPadOS to ClickHouse Cloud or a self-hosted ClickHouse server.'
title: 'Connect ProbeDeck to ClickHouse'
doc_type: 'guide'
keywords: ['probedeck', 'sql client', 'ios', 'ipados', 'mobile', 'monitoring', 'on-call']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import probedeck_add_connection from '@site/static/images/integrations/sql-clients/probedeck-add-connection.png';
import probedeck_dashboard from '@site/static/images/integrations/sql-clients/probedeck-dashboard.png';
import probedeck_running_queries from '@site/static/images/integrations/sql-clients/probedeck-running-queries.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge/>

ProbeDeck is an iOS and iPadOS client for checking the health of a ClickHouse server, inspecting
the `system` tables, and running SQL. It connects to the ClickHouse HTTP interface over the device
network or through an SSH bastion; it doesn't require a relay server.

## Prerequisites {#prerequisites}

- ProbeDeck from the [App Store](https://apps.apple.com/app/id6791261174)
- iOS or iPadOS 17.0 or later
- network access from the device to the ClickHouse HTTP or HTTPS endpoint, directly, through a
  VPN, or through an SSH bastion
- a ClickHouse user with access to the databases you want to query
- `SELECT` access to the relevant `system` tables for monitoring

### Version matrix {#version-matrix}

| ProbeDeck | ClickHouse Cloud | Self-hosted ClickHouse | Notes |
|-----------|------------------|------------------------|-------|
| 1.1.7 or later | Current service | Not pinned to a minimum server version | Uses only the HTTP(S) interface; use **Test Connection** and verify the monitoring sections against your exact server version and grants |

Some monitoring sections depend on optional log tables or newer system tables. For example,
`system.server_settings`, used for the configured memory limit, is available in ClickHouse 22.10
and later. If a source is unavailable, ProbeDeck marks the affected section as limited instead of
treating the whole connection as unavailable.

## Gather your connection details {#gather-your-connection-details}

ProbeDeck uses the ClickHouse HTTP(S) interface. You need the endpoint host, HTTP port, username,
and password.

<ConnectionDetails />

## Connect to ClickHouse Cloud {#connect-to-clickhouse-cloud}

1. In the ClickHouse Cloud console, open your service and select **Connect**.
2. Choose **HTTPS** and copy the host, port, username, and password.
3. In ProbeDeck, tap **+** on the **Connections** screen.
4. Enter a connection name.
5. Enter the host without `https://`.
6. Set **Port** to `8443` and turn on **TLS**.
7. Enter the database username and password from the **Connect** dialog. The database name is
   optional.
8. Tap **Test Connection**. A successful check shows the server version and round-trip time.
9. Tap **Save**.

<Image img={probedeck_add_connection} size="lg" border alt="ProbeDeck connection form configured for HTTPS on port 8443 with a ClickHouse username" />

## Connect to self-hosted ClickHouse {#connect-to-self-hosted-clickhouse}

1. In ProbeDeck, tap **+** on the **Connections** screen.
2. Enter the server host without a URL scheme.
3. For the default unencrypted HTTP interface, use port `8123` and leave **TLS** off. For HTTPS,
   turn on **TLS** and use the port configured on your server; `8443` is a common choice.
4. Enter the ClickHouse username, password, and optional database.
5. Tap **Test Connection**, then **Save**.

:::note
Ports `9000` and `9440` belong to the native ClickHouse protocol. ProbeDeck uses the HTTP(S)
interface, so use the server's HTTP port instead.
:::

For a server on the local network, iOS may ask for Local Network permission. If the endpoint is
reachable only over a corporate network, connect the device to its VPN first or configure an SSH
bastion.

### Connect through an SSH bastion {#connect-through-an-ssh-bastion}

Turn on **SSH Tunnel** in the connection form and enter:

1. the bastion host and SSH port (`22` by default)
2. the SSH username
3. either an SSH password or a private key

ProbeDeck opens an SSH `direct-tcpip` channel from the bastion to the ClickHouse host and HTTP(S)
port configured in the **Server** section. On the first connection, verify the bastion's SHA-256
host-key fingerprint before accepting it.

## Authentication and TLS {#authentication-and-tls}

ProbeDeck sends the database username and password in the `X-ClickHouse-User` and
`X-ClickHouse-Key` request headers. It doesn't put credentials in the URL.

For mutual TLS, turn on **TLS Client Certificate** and import a PKCS#12 (`.p12`) file containing
the client certificate and private key, then enter its passphrase.

When a self-hosted endpoint presents a self-signed certificate or a certificate from a private
CA, ProbeDeck shows its SHA-256 fingerprint, issuer, subject, and validity period. Accept it only
after comparing the fingerprint with the value from the server administrator. The decision is
pinned to that connection; a later certificate change stops the connection until it is reviewed.

ProbeDeck stores connection secrets and imported key material in the iOS Keychain on the device.

## Monitor ClickHouse {#monitor-clickhouse}

Open the saved connection and select **Monitor**. The dashboard summarizes the following sources:

| Area | ClickHouse source |
|------|-------------------|
| Running queries, elapsed time, memory, and rows read | `system.processes` |
| Replication state and queue | `system.replicas`, `system.replication_queue` |
| Disks, parts, and merges | `system.disks`, `system.parts`, `system.merges` |
| Mutations | `system.mutations` |
| Memory and server metrics | `system.metrics`, `system.asynchronous_metrics`, `system.server_settings` |
| Historical query and disk rates, when enabled | `system.metric_log`, `system.asynchronous_metric_log` |

<Image img={probedeck_dashboard} size="lg" border alt="ProbeDeck monitoring dashboard showing running queries, replication, disks, parts, mutations, merges, query rate, and memory" />

Tap **Running queries** to sort active queries by elapsed time and inspect memory and rows read.

<Image img={probedeck_running_queries} size="lg" border alt="ProbeDeck running queries list sorted by elapsed time" />

## Example: query the UK property price dataset {#example-query-uk-property-price-dataset}

This example uses the [UK property price paid dataset](/getting-started/example-datasets/uk-price-paid).
Load the dataset into `uk_price_paid`, then:

1. Open the connection and select **Data**.
2. Open the SQL editor.
3. Run this bounded, read-only query:

```sql
SELECT
    town,
    count() AS sales,
    round(avg(price)) AS average_price
FROM uk_price_paid
GROUP BY town
ORDER BY sales DESC
LIMIT 10
```

4. Check that the result contains ten towns with their transaction counts and average prices.

## Known limits {#known-limits}

- ProbeDeck is available only on iOS and iPadOS 17.0 or later.
- It supports the ClickHouse HTTP(S) interface, not the native protocol.
- ProbeDeck loads SQL results in pages of 200 rows and caps each request at 10,000 rows. Use a
  selective `WHERE` clause and `LIMIT` for large tables.
- Monitoring visibility depends on the ClickHouse user's grants and on optional log tables being
  enabled. Missing access can limit individual dashboard sections.
- The device must be able to reach the endpoint directly, through a VPN, or through the built-in
  SSH tunnel.
- Monitoring and read-only SQL are available without an in-app purchase. `KILL QUERY`,
  `KILL MUTATION`, write and DDL statements, and other operational actions require ProbeDeck Pro.

## Troubleshooting {#troubleshooting}

### Authentication failed {#authentication-failed}

Copy the database username and password again. For ClickHouse Cloud, use the database credentials
from the service's **Connect** dialog, not a Cloud management API key.

### Connection refused or timed out {#connection-refused-or-timed-out}

Confirm that the device can reach the host and the HTTP(S) port. Check the Cloud IP access list,
VPN, firewall, and port mapping. Don't use the native protocol ports `9000` or `9440`.

### Monitoring shows limited permissions {#monitoring-shows-limited-permissions}

The connection is working, but the ClickHouse user can't read one or more required `system`
tables. Ask the server administrator for the minimum `SELECT` grants required for the monitoring
areas you intend to use, then reconnect.

### TLS fingerprint changed {#tls-fingerprint-changed}

Don't accept the new fingerprint until the server administrator confirms that the certificate
was rotated. An unexpected change can indicate that the endpoint or TLS interception path has
changed.

## Next steps {#next-steps}

See the [ProbeDeck documentation](https://probedeck.app) for product-specific details, and the
[ClickHouse HTTP interface documentation](/interfaces/http) for server-side configuration.
