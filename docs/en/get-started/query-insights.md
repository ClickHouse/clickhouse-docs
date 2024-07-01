---
sidebar_title: Query Insights
slug: /en/get-started/query-insights
description: Visualize system.query_log data to simplify query debugging and performance optimization
keywords: [query insights, query log, query log ui, system.query_log insights]
---

# Query Insights

The **Query Insights** feature makes ClickHouse's built-in query log a lot easier to use. ClickHouse's `system.query_log` table is a key source of information for query optimization, debugging, and monitoring overall cluster health and performance.

## Query Overview

After selecting a service, the monitoring navigation item in the left sidebar should expand to reveal a new ‘Query insights’ sub-item. Clicking on this option opens the new Query insights page:

![Query Insights UI Overview](@site/docs/en/cloud/images/sqlconsole/insights_overview.png)

## Top-level metrics

The stat boxes at the top represent some basic top-level query metrics over the selected period of time. Beneath it, we’ve exposed three time-series charts representing query volume, latency, and error rate broken down by query kind (select, insert, other) over a selected time window. The latency chart can be further adjusted to display p50, p90, and p99 latencies:

![Query Insights UI Latency Chart](@site/docs/en/cloud/images/sqlconsole/insights_latency.png)

## Recent queries

Beneath the top-level metrics, a table displays query log entries (grouped by normalized query hash and user) over the selected time window:

![Query Insights UI Recent Queries Table](@site/docs/en/cloud/images/sqlconsole/insights_recent.png)

Recent queries can be filtered and sorted by any available field, and the table can be configured to display/hide additional fields (tables, p90 and p99 latencies).

## Query drill-down

Selecting a query from the recent queries table will open a flyout containing metrics and information specific to the selected query

![Query Insights UI Query Drilldown](@site/docs/en/cloud/images/sqlconsole/insights_drilldown.png)

As we can see from the flyout, this particular query has been run more than 3000 times in the last 24 hours. All metrics in the ‘query info’ tab are aggregate, but we can also view metrics from individual runs by selecting the ‘Query history’ tab:

![Query Insights UI Query Information](@site/docs/en/cloud/images/sqlconsole/insights_query_info.png)

From this pane, the `Settings` and `Profile Events` items for each query run can be expanded to reveal additional information.
