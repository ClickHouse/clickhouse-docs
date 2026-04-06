---
title: 'Querying system tables'
slug: /cloud/monitoring/system-tables
description: 'Monitor ClickHouse Cloud by querying system tables directly'
keywords: ['cloud', 'monitoring', 'system tables', 'query_log', 'clusterAllReplicas', 'observability dashboard']
sidebar_label: 'System tables'
sidebar_position: 5
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

# Querying ClickHouse's system database

All ClickHouse instances come with a set of [system tables](/operations/system-tables/overview) contained in the `system` database that contain information about:

- Server states, processes, and environment.
- Server's internal processes.
- Options used when the ClickHouse binary was built.

Directly querying these tables is useful for monitoring ClickHouse deployments, especially for deep introspection and debugging.

## Using the ClickHouse Cloud Console {#using-cloud-console}

The ClickHouse Cloud console comes with a [SQL console](/cloud/get-started/sql-console) and [dashboarding tools](/cloud/manage/dashboards) that can be used for querying system tables. For example, the query below reviews how many (and how often) new parts are created during the last two hours:

```sql
SELECT
    count() AS new_parts,
    toStartOfMinute(event_time) AS modification_time_m,
    table,
    sum(rows) AS total_written_rows,
    formatReadableSize(sum(size_in_bytes)) AS total_bytes_on_disk
FROM clusterAllReplicas(default, system.part_log)
WHERE (event_type = 'NewPart') AND (event_time > (now() - toIntervalHour(2)))
GROUP BY
    modification_time_m,
    table
ORDER BY
    modification_time_m ASC,
    table DESC
```

:::tip[More example queries]
For additional monitoring queries, see the following resources:
- [Useful queries for troubleshooting](/knowledgebase/useful-queries-for-troubleshooting)
- [Monitoring and troubleshooting insert queries](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- [Monitoring and troubleshooting select queries](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)

You can also use these queries to [create a custom dashboard](https://clickhouse.com/blog/essential-monitoring-queries-creating-a-dashboard-in-clickHouse-cloud) in the Cloud Console.
:::

## Built-in advanced observability dashboard {#built-in-advanced-observability-dashboard}

ClickHouse comes with a built-in advanced observability dashboard feature which can be accessed by `$HOST:$PORT/dashboard` (requires user and password) that shows Cloud Overview metrics contained in `system.dashboards`.

<Image img={NativeAdvancedDashboard} size="lg" alt="Native advanced observability dashboard" border/>

:::note
This dashboard requires direct authentication to the ClickHouse instance and is separate from the [Cloud Console Advanced Dashboard](/cloud/monitoring/cloud-console#advanced-dashboard), which is accessible through the Cloud Console UI without additional authentication.
:::

For more information on the available visualizations and how to use them for troubleshooting, see the [advanced dashboard documentation](/cloud/manage/monitor/advanced-dashboard).

## Querying across nodes and versions {#querying-across-nodes}

To comprehensively view the entire cluster, users can leverage the `clusterAllReplicas` function in combination with the `merge` function. The `clusterAllReplicas` function allows querying system tables across all replicas within the "default" cluster, consolidating node-specific data into a unified result. When combined with the `merge` function, this can be used to target all system data for a specific table in a cluster.

For example, to find the top 5 longest-running queries across all replicas in the last hour:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

This approach is particularly valuable for monitoring and debugging cluster-wide operations, ensuring users can effectively analyze the health and performance of their ClickHouse Cloud deployment.

For more details, see [querying across nodes](/operations/system-tables/overview#querying-across-nodes).

## System considerations {#system-considerations}

:::warning
Querying system tables directly adds query load to your production service, prevents ClickHouse Cloud instances from idling (which can impact costs), and couples monitoring availability to production system health. If the production system fails, monitoring may also be affected.
:::

For real-time production monitoring with operational separation, consider using the [Prometheus-compatible metrics endpoint](/integrations/prometheus) or the [Cloud Console dashboards](/cloud/monitoring/cloud-console), both of which use pre-scraped metrics and do not issue queries to the underlying service.

## Related pages {#related}

- [System tables reference](/operations/system-tables/overview) — Full reference for all available system tables
- [Cloud Console monitoring](/cloud/monitoring/cloud-console) — Zero-setup dashboards that don't impact service performance
- [Prometheus endpoint](/integrations/prometheus) — Export metrics to external monitoring tools
- [Advanced dashboard](/cloud/manage/monitor/advanced-dashboard) — Detailed reference for dashboard visualizations
