---
slug: /use-cases/observability/clickstack/dashboards
title: 'Visualizations and dashboards with ClickStack'
sidebar_label: 'Dashboards'
pagination_prev: null
pagination_next: null
description: 'Visualizations and dashboards with ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'monitoring', 'observability']
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
import edit_filters from '@site/static/images/clickstack/dashboards/edit-filters.png';
import add_filter from '@site/static/images/clickstack/dashboards/add-filter.png';
import saved_filters from '@site/static/images/clickstack/dashboards/saved-filters.png';
import filtered_dashboard from '@site/static/images/clickstack/dashboards/filtered-dashboard.png';
import filter_dropdown from '@site/static/images/clickstack/dashboards/filter-dropdown.png';
import save_filter_values from '@site/static/images/clickstack/dashboards/save-filter-values.png';
import drilldown from '@site/static/images/clickstack/dashboards/drilldown.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack supports visualizing events, with built-in support for charting in ClickStack UI (HyperDX). These charts can be added to dashboards for sharing with other users.

Visualizations can be created from traces, metrics, logs, or any user-defined wide event schemas.

## Creating visualizations {#creating-visualizations}

The **Chart Explorer** interface in HyperDX allows you to visualize metrics, traces, and logs over time, making it easy to create quick visualizations for data analysis. This interface is also reused when creating dashboards. The following section walks through the process of creating a visualization using Chart Explorer.

Each visualization begins by selecting a **data source**, followed by a **metric**, with optional **filter expressions** and **group by** fields. Conceptually, visualizations in HyperDX map to a SQL `GROUP BY` query under the hood — users define metrics to aggregate across selected dimensions.

:::tip AI-powered chart generation
ClickStack also supports creating charts from natural language prompts using the [text-to-chart](/use-cases/observability/clickstack/text-to-chart) feature. Describe what you want to see, and ClickStack generates the visualization automatically.
:::

For example, you might chart the number of errors (`count()`) grouped by service name.

For the examples below, we use the remote dataset available at [sql.clickhouse.com](https://sql.clickhouse.com), described in the guide ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data). **You can also reproduce these examples by visiting [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com).**

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

Note that you can filter events using either a SQL `WHERE` clause or Lucene syntax and set the time frame over which events should be visualized. Multiple series are also supported.

For example, filter by the service `frontend` by adding the filter `ServiceName:"frontend"`. Add a second series for the count of events over time with the alias `Count` by clicking `Add Series`.

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
Visualizations can be created from any data source — metrics, traces, or logs. ClickStack treats all of these as wide events. Any **numeric column** can be charted over time, and **string**, **date**, or **numeric** columns can be used for groupings.

This unified approach allows you to build dashboards across telemetry types using a consistent, flexible model.
:::

</VerticalStepper>

## Creating dashboards {#creating-dashboards}

Dashboards provide a way to group related visualizations, enabling you to compare metrics and explore patterns side by side to identify potential root causes in your systems. These dashboards can be used for ad-hoc investigations or saved for ongoing monitoring.

Global filters can be applied at the dashboard level, automatically propagating to all visualizations within that dashboard. This allows for consistent drill-down across charts and simplifies correlation of events across services and telemetry types.

We create a dashboard with two visualizations below using the log and trace data sources. These steps can be reproduced on [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) or locally by connecting to the dataset hosted on [sql.clickhouse.com](https://sql.clickhouse.com), as described in the guide ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data).

<VerticalStepper headerLevel="h3">

### Navigate to Dashboards {#navigate-dashboards}

Select `Dashboards` from the left menu. Then click `New Dashboard` to create a temporary or saved dashboard.

<Image img={dashboard_1} alt="Create Dashboard" size="lg"/>

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

## Dashboards - Editing visualizations {#dashboards-editing-visualizations}

To remove, edit, or duplicate a visualization, hover over it and use the corresponding action buttons.

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## Dashboard - Listing and search {#dashboard-listing-search}

Dashboards are accessible on the dashboards page. They are organized by tag, with built-in search and filtering to quickly locate specific dashboards.

Dashboards can be favorited for easy access on the sidebar and at the top of the listing page. Favorites are individual to each user.

<Image img={dashboard_search} alt="Dashboard search" size="lg"/>

## Dashboards - Tagging {#tagging}
<Tagging />

## Custom filters {#custom-filters}

In addition to the [free-text filters](#filter-dashboards) available on all dashboards, saved dashboards support custom dropdown filters populated by data queried from ClickHouse. These provide reusable, point-and-click filter controls so that dashboard viewers can filter without writing expressions manually.

<Image img={filter_dropdown} alt="Services dropdown filter showing available service names" size="lg"/>

The following steps demonstrate adding a custom filter to the dashboard created in the ["Creating dashboards"](#creating-dashboards) section.

<VerticalStepper headerLevel="h3">

### Open the Edit Filters dialog {#open-edit-filters}

Open a saved dashboard and select **Edit Filters** from the toolbar.

<Image img={edit_filters} alt="Edit Filters button in the dashboard toolbar" size="lg"/>

### Add a new filter {#add-new-filter}

Click **Add new filter**. Configure the filter by providing a **Name**, selecting a **Data source**, and entering a **Filter expression** — a SQL column or expression whose distinct values will populate the dropdown. Click **Save filter**.

For example, to add a service filter for trace data, use `ServiceName` as the filter expression with the `Traces` data source. The "Dropdown values filter" is optional, and provides a way to restrict which values appear in the dropdown.

<Image img={add_filter} alt="Add filter dialog with Name, Data source, and Filter expression fields" size="md"/>

The Filters modal shows all configured filters for the dashboard. From here you can edit or delete existing filters, or add additional ones.

<Image img={saved_filters} alt="Filters modal showing a configured Services filter" size="md"/>

### Use the filter {#use-filter}

Close the Filters modal. The new dropdown filter appears below the search bar. Click it to see the available values, then select one to filter all visualizations on the dashboard.

<Image img={filtered_dashboard} alt="Dashboard filtered to the frontend service" size="lg"/>

### (Optional) Save filter values as default {#save-default-filters}

To persist a filter selection as the dashboard default, choose **Save Query & Filters as Default** from the dashboard menu. The dashboard will always open with the selected filters applied. To reset, select **Remove Default Query & Filters** from the same menu.

<Image img={save_filter_values} alt="Dashboard menu showing Save Query and Filters as Default option" size="lg"/>

</VerticalStepper>

:::note
Custom dropdown filters are available on saved dashboards. For an example of this pattern in action, see the [Kubernetes dashboard](#kubernetes-dashboard), which provides built-in dropdown filters for Pod, Deployment, Node name, Namespace, and Cluster.
:::

## Drilldown to search {#drilldown-to-search}

Dashboard tiles support drilldown to the Search page. Click on a data point in a visualization to open a context menu with the following options:

- **View All Events** — navigates to the Search page showing all events from the selected time window.
- **Filter by group** — navigates to the Search page filtered to a specific series.

<Image img={drilldown} alt="Drilldown context menu showing View All Events and Filter by group options" size="lg"/>

This is useful for investigating specific spikes or anomalies spotted in a dashboard — you can quickly pivot from an aggregated view to the underlying individual events.

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

This dashboard allows you to explore Kubernetes events collected via OpenTelemetry. It includes advanced filtering options, enabling you to filter by Kubernetes Pod, Deployment, Node name, Namespace, and Cluster, as well as perform free-text searches.

Kubernetes data is organized across three tabs for easy navigation: Pods, Nodes, and Namespaces.

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
