---
slug: /cloud/managed-postgres/monitoring/overview
sidebar_label: 'Overview'
title: 'Managed Postgres monitoring'
description: 'Overview of monitoring and observability options for ClickHouse Managed Postgres'
keywords: ['managed postgres', 'monitoring', 'observability', 'metrics', 'dashboard', 'prometheus', 'query insights', 'pg_stat_ch']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-overview-beta" />

You can monitor your Managed Postgres services with the following
methods:

| Section                                                                          | Description                                                                                | Setup required          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------- |
| [Dashboard](/cloud/managed-postgres/monitoring/dashboard)                        | Built-in cloud console charts for resource usage and database activity                     | None                    |
| [Query Insights](/cloud/managed-postgres/monitoring/query-insights)              | Per-statement telemetry: every query pattern ranked by impact, with diagnostic counters    | None                    |
| [Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus)             | Scrape metrics into Prometheus, Grafana, Datadog, or any OpenMetrics-compatible collector  | API key + scraper config |
| [Metrics reference](/cloud/managed-postgres/monitoring/metrics)                  | Full list of metrics exposed by the Prometheus endpoint, with types, labels, and meanings  | N/A                     |

## Quick start {#quick-start}

Open the cloud console and navigate to the **Monitoring** tab of any
Managed Postgres instance to see live charts for CPU, memory, IOPS,
connections, transactions, cache hit ratio, and deadlocks. No
configuration required.

For per-query telemetry — latency percentiles, cache vs. disk reads,
temp spills, parallel worker utilization, and WAL volume — open the
[Query Insights](/cloud/managed-postgres/monitoring/query-insights) tab
on the same instance. To pipe host-level metrics into your own
observability stack, use the
[Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus).
