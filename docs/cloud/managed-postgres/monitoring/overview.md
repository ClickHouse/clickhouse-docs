---
slug: /cloud/managed-postgres/monitoring/overview
sidebar_label: 'Overview'
title: 'Managed Postgres monitoring'
description: 'Overview of monitoring and observability options for ClickHouse Managed Postgres'
keywords: ['managed postgres', 'monitoring', 'observability', 'metrics', 'dashboard', 'prometheus']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Managed Postgres monitoring

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-overview" />

You can monitor your Managed Postgres services with the following
methods:

| Section                                                                          | Description                                                                                | Setup required          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------- |
| [Dashboard](/cloud/managed-postgres/monitoring/dashboard)                        | Built-in cloud console charts for resource usage and database activity                     | None                    |
| [Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus)             | Scrape metrics into Prometheus, Grafana, Datadog, or any OpenMetrics-compatible collector  | API key + scraper config |
| [Metrics reference](/cloud/managed-postgres/monitoring/metrics)                  | Full list of metrics exposed by the Prometheus endpoint, with types, labels, and meanings  | N/A                     |

## Quick start {#quick-start}

Open the cloud console and navigate to the **Monitoring** tab of any
Managed Postgres instance to see live charts for CPU, memory, IOPS,
connections, transactions, cache hit ratio, and deadlocks. No
configuration required.

To pipe the same metrics into your own observability stack, use the
[Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus).
