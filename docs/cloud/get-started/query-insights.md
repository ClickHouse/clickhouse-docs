---
sidebar_title: 'Query Insights'
slug: /cloud/get-started/query-insights
description: 'Visualize system.query_log data to simplify query debugging and performance optimization'
keywords: ['query insights', 'query log', 'query log ui', 'system.query_log insights']
title: 'Query Insights'
doc_type: explanation
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';

# Query Insights

The **Query Insights** feature makes ClickHouse's built-in query log easier to use through various visualizations and tables. ClickHouse's `system.query_log` table is a key source of information for query optimization, debugging, and monitoring overall cluster health and performance.

## Query overview {#query-overview}

After selecting a service, the **Monitoring** navigation item in the left sidebar should expand to reveal a new **Query insights** sub-item. Clicking on this option opens the new Query insights page:

<Image img={insights_overview} size="md" alt="Query Insights UI Overview" border/>

## Top-level metrics {#top-level-metrics}

The stat boxes at the top represent some basic top-level query metrics over the selected period of time. Beneath it, we've exposed three time-series charts representing query volume, latency, and error rate broken down by query kind (select, insert, other) over a selected time window. The latency chart can be further adjusted to display p50, p90, and p99 latencies:

<Image img={insights_latency} size="md" alt="Query Insights UI Latency Chart" border/>

## Recent queries {#recent-queries}

Beneath the top-level metrics, a table displays query log entries (grouped by normalized query hash and user) over the selected time window:

<Image img={insights_recent} size="md" alt="Query Insights UI Recent Queries Table" border/>

Recent queries can be filtered and sorted by any available field. The table can also be configured to display or hide additional fields such as tables, p90, and p99 latencies.

## Query drill-down {#query-drill-down}

Selecting a query from the recent queries table will open a flyout containing metrics and information specific to the selected query:

<Image img={insights_drilldown} size="md" alt="Query Insights UI Query Drill down" border/>

As we can see from the flyout, this particular query has been run more than 3000 times in the last 24 hours. All metrics in the **Query info** tab are aggregated metrics, but we can also view metrics from individual runs by selecting the **Query history** tab:

<Image img={insights_query_info} size="sm" alt="Query Insights UI Query Information" border/>

<br />

From this pane, the `Settings` and `Profile Events` items for each query run can be expanded to reveal additional information.
