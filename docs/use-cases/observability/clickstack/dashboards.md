---
slug: /use-cases/observability/clickstack/dashboards
title: 'Visualizations and Dashboards with ClickStack'
sidebar_label: 'Dashboards'
pagination_prev: null
pagination_next: null
description: 'Visualizations and Dashboards with ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/use-cases/observability/hyperdx-visualization-1.png';
import visualization_2 from '@site/static/images/use-cases/observability/hyperdx-visualization-2.png';
import visualization_3 from '@site/static/images/use-cases/observability/hyperdx-visualization-3.png';
import dashboard_1 from '@site/static/images/use-cases/observability/hyperdx-dashboard-1.png';
import dashboard_2 from '@site/static/images/use-cases/observability/hyperdx-dashboard-2.png';
import dashboard_3 from '@site/static/images/use-cases/observability/hyperdx-dashboard-3.png';
import dashboard_4 from '@site/static/images/use-cases/observability/hyperdx-dashboard-4.png';
import dashboard_5 from '@site/static/images/use-cases/observability/hyperdx-dashboard-5.png';
import dashboard_filter from '@site/static/images/use-cases/observability/hyperdx-dashboard-filter.png';
import dashboard_save from '@site/static/images/use-cases/observability/hyperdx-dashboard-save.png';
import dashboard_search from '@site/static/images/use-cases/observability/hyperdx-dashboard-search.png';
import dashboard_edit from '@site/static/images/use-cases/observability/hyperdx-dashboard-edit.png';
import dashboard_clickhouse from '@site/static/images/use-cases/observability/hyperdx-dashboard-clickhouse.png';
import dashboard_services from '@site/static/images/use-cases/observability/hyperdx-dashboard-services.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

ClickStack supports visualizing events, with built-in support for charting in HyperDX. These charts can be added to dashboards for sharing with other users.

Visualizations can be created from traces, metrics, logs, or any user-defined wide event schemas.

## Creating visualizations {#creating-visualizations}

The **Chart Explorer** interface in HyperDX allows users to visualize metrics, traces, and logs over time, making it easy to create quick visualizations for data analysis. This interface is also reused when creating dashboards. The following section walks through the process of creating a visualization using Chart Explorer.

Each visualization begins by selecting a **data source**, followed by a **metric**, with optional **filter expressions** and **group by** fields. Conceptually, visualizations in HyperDX map to a SQL `GROUP BY` query under the hood — users define metrics to aggregate across selected dimensions.

For example, you might chart the number of errors (`count()`) grouped by service name.

For the examples below, we use the remote dataset available at [sql.clickhouse.com](https://sql.clickhouse.com), described in the guide ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **Users can also reproduce these examples by visiting [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

<VerticalStepper headerLevel="h3">

### Navigate to Chart Explorer {#navigate-chart-explorer}

Select `Chart Explorer` from the left menu.

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### Create visualization {#create-visualization}

In the example below, we chart the average request duration over time per service name. This requires the user to specify a metric, a column (which can be a SQL expression), and an aggregation field.

Select the `Line/Bar` visualization type from the top menu, followed by the `Traces` (or `Demo Traces` if using [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)) dataset. Complete the following values:

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="Simple visualization" size="lg"/>

Note that users can filter events using either a SQL `WHERE` clause or Lucene syntax and set the time frame over which events should be visualized. Multiple series are also supported.

For example, filter by the service `frontend` by adding the filter `ServiceName:"frontend"`. Add a second series for the count of events over time with the alias `Count` by clicking `Add Series`.

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
Visualizations can be created from any data source — metrics, traces, or logs. ClickStack treats all of these as wide events. Any **numeric column** can be charted over time, and **string**, **date**, or **numeric** columns can be used for groupings.

This unified approach allows users to build dashboards across telemetry types using a consistent, flexible model.
:::

</VerticalStepper>

## Creating dashboards {#creating-dashboards}

Dashboards provide a way to group related visualizations, enabling users to compare metrics and explore patterns side by side to identify potential root causes in their systems. These dashboards can be used for ad-hoc investigations or saved for ongoing monitoring.

Global filters can be applied at the dashboard level, automatically propagating to all visualizations within that dashboard. This allows for consistent drill-down across charts and simplifies correlation of events across services and telemetry types.

We create a dashboard with two visualizations below using the log and trace data sources. These steps can be reproduced on [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) or locally by connecting to the dataset hosted on [sql.clickhouse.com](https://sql.clickhouse.com), as described in the guide ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Navigate to Dashboards {#navigate-dashboards}

Select `Dashboards` from the left menu.

<Image img={dashboard_1} alt="Create Dashboard" size="lg"/>

By default, dashboards are temporary to support ad-hoc investigations. 

If using your own HyperDX instance you can ensure this dashboard can later be saved, by clicking `Create New Saved Dashboard`. This option will not be available if using the read-only environment [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).

### Create a visualization – average request time by service {#create-a-tile}

Select `Add New Tile` to open the visualization creation panel.

Select the `Line/Bar` visualization type from the top menu, followed by the `Traces` (or `Demo Traces` if using [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)) dataset. Complete the following values to create a chart showing the average request duration over time per service name:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

Click the **play** button before clicking `Save`.

<Image img={dashboard_2} alt="Create Dashboard Visualization" size="lg"/>

Resize the visualization to occupy the full width of the dashboard.

<Image img={dashboard_3} alt="Dashboard with visuals" size="lg"/>

### Create a visualization – events over time by service {#create-a-tile-2}

Select `Add New Tile` to open the visualization creation panel.

Select the `Line/Bar` visualization type from the top menu, followed by the `Logs` (or `Demo Logs` if using [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)) dataset. Complete the following values to create a chart showing the count of events over time per service name:

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

Click the **play** button before clicking `Save`.

<Image img={dashboard_4} alt="Dashboard Visualization 2" size="lg"/>

Resize the visualization to occupy the full width of the dashboard.

<Image img={dashboard_5} alt="Dashboard with visuals 2" size="lg"/>

### Filter dashboard {#filter-dashboards}

Lucene or SQL filters, along with the time range, can be applied at the dashboard level and will automatically propagate to all visualizations.

<Image img={dashboard_filter} alt="Dashboard with filtering" size="lg"/>

To demonstrate, apply the Lucene filter `ServiceName:"frontend"` to the dashboard and modify the time window to cover the Last 3 hours. Note how the visualizations now reflect data only from the `frontend` service.

The dashboard will be auto-saved. To set the dashboard name, select the title and modify it before clicking `Save Name`. 

<Image img={dashboard_save} alt="Dashboard save" size="lg"/>

</VerticalStepper>

## Dashboards - editing visualizations {#dashboards-editing-visualizations}

To remove, edit, or duplicate a visualization, hover over it and use the corresponding action buttons.

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## Dashboard listing and search {#dashboard-listing-search}

Dashboards are accessible from the left-hand menu, with built-in search to quickly locate specific dashboards.

<Image img={dashboard_search} alt="Dashboard search" size="sm"/>

## Presets {#presets}

HyperDX is deployed with out-of-the-box dashboards.

### ClickHouse dashboard {#clickhouse-dashboard}

This dashboard provides visualizations for monitoring ClickHouse. To navigate to this dashboard, select it from the left menu.

<Image img={dashboard_clickhouse} alt="ClickHouse dashboard" size="lg"/>

This dashboard uses tabs to separate monitoring of **Selects**, **Inserts**, and **ClickHouse Infrastructure**.

:::note Required system table access
This dashboard queries the ClickHouse [system tables](/operations/system-tables) to expose key metrics. The following grants are required:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Services dashboard {#services-dashboard}

The Services dashboard displays currently active services based on trace data. This requires users to have collected traces and configured a valid Traces data source.

Service names are auto-detected from the trace data, with a series of prebuilt visualizations organized across three tabs: HTTP Services, Database, and Errors.

Visualizations can be filtered using Lucene or SQL syntax, and the time window can be adjusted for focused analysis.

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes dashboard {#kubernetes-dashboard}

This dashboard allows users to explore Kubernetes events collected via OpenTelemetry. It includes advanced filtering options, enabling users to filter by Kubernetes Pod, Deployment, Node name, Namespace, and Cluster, as well as perform free-text searches.

Kubernetes data is organized across three tabs for easy navigation: Pods, Nodes, and Namespaces.

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
