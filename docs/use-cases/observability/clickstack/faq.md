---
slug: /use-cases/observability/clickstack/faq
title: 'ClickStack FAQ'
sidebar_label: 'FAQ'
pagination_prev: null
pagination_next: null
description: 'Frequently asked questions about ClickStack alerting, dashboards, drill-downs, and metrics discovery.'
doc_type: 'guide'
keywords: ['ClickStack', 'FAQ', 'alerting', 'dashboards', 'drill-downs', 'metrics discovery']
---

This page answers frequently asked questions about ClickStack capabilities, including alerting, dashboards and drill-downs, and metrics discovery.

## Alerting {#alerting}

<details>
<summary><strong>What types of alerts does ClickStack support?</strong></summary>

ClickStack supports two types of alerts:

- [Search alerts](/use-cases/observability/clickstack/alerts#search-alerts) — trigger notifications when the count of matching log or trace results within a time window exceeds or falls below a threshold.
- [Dashboard chart alerts](/use-cases/observability/clickstack/alerts#dashboard-alerts) — trigger notifications when a metric plotted on a dashboard tile crosses a defined threshold.

Both alert types use static threshold conditions. For full details, see [Alerts](/use-cases/observability/clickstack/alerts).

</details>

<details>
<summary><strong>Can I alert on complex metric conditions such as ratios, p95/p99, or multi-metric formulas?</strong></summary>

Ratios of two metrics, p95, and p99 values can be plotted on a dashboard tile using the [chart builder](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) UI. You can then create threshold-based alerts on those tiles.

However, ClickStack does not currently support:

- Alerting on custom SQL queries for metrics.
- Multi-condition or multi-metric alert rules combined into a single alert.
- Dynamic or anomaly-detection-based alert conditions (anomaly detection is planned).

If you need to alert on a complex metric, the recommended approach is to build the visualization as a dashboard chart first, then attach a threshold alert to that chart.

</details>

<details>
<summary><strong>Can I use materialized views for alerting use cases?</strong></summary>

Materialized views in ClickStack do not currently support metrics-based alerting use cases. For metrics, ClickStack works best with the default [ClickHouse OpenTelemetry metrics schema](/use-cases/observability/clickstack/ingesting-data/schemas). For log-based materialized view use cases, see [Materialized views](/use-cases/observability/clickstack/materialized_views).

</details>

## Dashboards and drill-downs {#dashboards-and-drill-downs}

<details>
<summary><strong>Does ClickStack support parameterized dashboards or dashboard variables?</strong></summary>

ClickStack supports custom dropdown filters on dashboards, populated by data queried from ClickHouse. These filters allow you to dynamically scope all tiles on a dashboard to a specific value (e.g., a service name, environment, or host).

ClickStack does not currently support reusable dashboard variables in the style of Grafana template variables. Because ClickStack works exclusively with ClickHouse as its data source, drill-down and filtering capabilities can be provided natively without requiring a variable abstraction layer.

For details on creating dashboards and applying filters, see [Dashboards](/use-cases/observability/clickstack/dashboards).

</details>

<details>
<summary><strong>What drill-down capabilities are available?</strong></summary>

ClickStack supports the following drill-down workflows:

- [Dashboard-level filtering](/use-cases/observability/clickstack/dashboards#filter-dashboards) — Lucene or SQL filters and time range adjustments applied at the dashboard level propagate to all tiles.
- Click-to-view events — clicking on data in a dashboard tile and selecting **View Events** navigates to the [Search](/use-cases/observability/clickstack/search) page with relevant filters for log and trace data.
- [Prebuilt dashboard drill-downs](/use-cases/observability/clickstack/dashboards#presets) — the [Services](/use-cases/observability/clickstack/dashboards#services-dashboard), [ClickHouse](/use-cases/observability/clickstack/dashboards#clickhouse-dashboard), and [Kubernetes](/use-cases/observability/clickstack/dashboards#kubernetes-dashboard) dashboards include richer, built-in drill-down navigation across tabs.

Multi-level drill-downs from one custom dashboard to another (dashboard → dashboard → detail view) are not currently supported.

:::note
The **View Events** drill-down works best with log and trace data. Because metrics data cannot be viewed on the [Search](/use-cases/observability/clickstack/search) page, drilling down from a metrics tile will link to logs from around the selected time frame instead.
:::

</details>

## Metrics discovery {#metrics-discovery}

<details>
<summary><strong>Is there a UI for browsing and searching metrics?</strong></summary>

Metric names are discoverable via the metric name dropdown in the [chart builder](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer). ClickStack also displays the attributes present for a selected metric to assist with discovery.

There is not currently a dedicated metrics search page similar to the log search experience. Improving metric discovery is an active area of development.

</details>

<details>
<summary><strong>Is SQL-based discovery the intended long-term approach for metrics?</strong></summary>

No. While SQL queries can be used to discover metrics today, this is not the intended long-term approach. Improved metrics discovery tooling is actively being developed.

</details>

## Further reading {#further-reading}

- [Alerts](/use-cases/observability/clickstack/alerts) — search alerts, dashboard chart alerts, and webhook integrations.
- [Dashboards](/use-cases/observability/clickstack/dashboards) — creating visualizations, building dashboards, and applying filters.
- [Search](/use-cases/observability/clickstack/search) — querying logs and traces with Lucene and SQL syntax.
- [Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) — OpenTelemetry data schemas for logs, traces, and metrics.
- [Architecture](/use-cases/observability/clickstack/architecture) — ClickStack components and how they fit together.
