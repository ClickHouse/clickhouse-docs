---
slug: /use-cases/observability/clickstack/dashboards/row-click-drilldowns
title: 'Table row-click drilldowns'
sidebar_label: 'Row-click drilldowns'
pagination_prev: null
pagination_next: null
description: 'Turn a table tile into an inspection workflow: click a row to drill into a focused dashboard or the underlying logs and traces, scoped to the clicked row'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'drilldown', 'table', 'row click', 'inspection', 'observability']
---

import Image from '@theme/IdealImage';
import row_click_drawer from '@site/static/images/clickstack/dashboards/row-click-drawer.png';
import row_click_drilldown from '@site/static/images/clickstack/dashboards/row-click-drilldown.png';
import row_click_search_drilldown from '@site/static/images/clickstack/dashboards/row-click-search-drilldown.png';
import row_click_catalog from '@site/static/images/clickstack/dashboards/row-click-catalog.png';

A table tile is often a **catalog**: one row per service, host, endpoint, or error group, with a few columns that score each one. Row-click actions turn that catalog into an inspection workflow. You scan the catalog to find the row that matters, click it, and ClickStack carries the clicked row's values through as filters, so the destination opens already scoped to that one item with no query to rebuild by hand.

A click can land in one of two places:

- **another dashboard**, for a focused view of the one item, such as a per-service detail dashboard, or
- **the underlying events** in [Search](/use-cases/observability/clickstack/search), for the logs or traces behind the row.

Both use cases below start from the same catalog, a service inventory, and drill from it into each destination. Row-click actions apply to table tiles only. They are distinct from the chart [drilldown to search](/use-cases/observability/clickstack/dashboards#drilldown-to-search), which opens a context menu when you click a point on a line or bar chart.

## Inspect a service in its own dashboard {#inspect-in-dashboard}

An overview table with one row per service answers "which service is unhealthy?". A row click can open a per-service dashboard that answers "what is happening inside it?", scoped to the service you clicked. The pattern below pairs a service inventory table with a `Service Detail` dashboard.

<VerticalStepper headerLevel="h3">

### Build the detail dashboard {#detail-dashboard}

Create a dashboard named `Service Detail` and add a [custom filter](/use-cases/observability/clickstack/dashboards#custom-filters) with the expression `ServiceName` on your traces source. The dashboard-level filter re-scopes every tile to a single service, so the tiles themselves do not hardcode a service in their queries. Add the per-service views you want: RED key figures (requests, errors, P95 duration), a latency-percentile chart (P50, P95, P99), request rate over time, and a per-endpoint breakdown grouped by `SpanName`.

Save this dashboard first. A template target is resolved by name at click time, so the detail dashboard must exist when a viewer clicks. If you later rename it, update the row-click action to match.

### Build the service inventory {#service-inventory}

On an overview dashboard, add a **Table** tile on your traces source grouped by `ServiceName`. Give it the RED columns that score each service, each one an aliased series:

- `Requests`: count of spans (rate).
- `Errors`: count of spans with an error status.
- `P95 Duration`: the 95th percentile of `Duration`. Set the column's number format to a duration so it reads as `288ms`, not raw nanoseconds.

Order by `Requests` descending so the busiest services sort to the top. This table is the catalog: one row per service, scored by RED.

<Image img={row_click_catalog} alt="Service inventory table with RED columns (Requests, Errors, P95 Duration) for each service, ordered by request volume, above a requests-over-time trend" size="lg"/>

### Wire up the row click {#wire-dashboard}

On the inventory table, open **Row Click Action**, select **Dashboard**, and choose **Template** with the value `Service Detail`. Add one filter:

- **Expression**: `ServiceName`
- **Template**: `{{ServiceName}}`

Click **Apply** and save. The expression `ServiceName` matches the custom filter declared on the `Service Detail` dashboard, so the clicked row's service flows straight into that filter. For what each control in the drawer does, see [Set up a row-click action](#set-up).

### Click a row {#click-dashboard}

Hovering a row reveals a link affordance on the right edge of the table, with a hint describing the action (`Open dashboard`). Clicking the row opens the `Service Detail` dashboard with its `Service` filter set to the clicked value, so every tile (the RED key figures, the latency percentiles, the per-endpoint breakdown) re-scopes to that one service in a single click.

<Image img={row_click_drilldown} alt="Service Detail dashboard after a row click, with the Service filter set to the clicked service and the RED key figures, latency percentiles, and per-endpoint breakdown all scoped to it" size="lg"/>

</VerticalStepper>

## Jump from a service to its traces {#jump-to-traces}

Sometimes you do not want another aggregate view, you want the raw events. A **Search** action sends the click to the [Search](/use-cases/observability/clickstack/search) page instead of a dashboard, opening the logs or traces behind the row, already filtered to it.

Starting from the same service inventory table, point its row click at the traces themselves rather than the detail dashboard.

<VerticalStepper headerLevel="h3">

### Point the row click at Search {#wire-search}

On the inventory table, open **Row Click Action** and select **Search**. Choose your traces source (only log and trace sources are listed). Add one filter:

- **Expression**: `ServiceName`
- **Template**: `{{ServiceName}}`

Click **Apply** and save.

### Click a row {#click-search}

Clicking a service row now opens the Search page on that traces source, filtered to `ServiceName = <service>`, so you land on the spans for just that service over the same time range.

<Image img={row_click_search_drilldown} alt="Search page opened on the traces source after a row click, filtered to the clicked service" size="lg"/>

</VerticalStepper>

The same shape works for any catalog of items. Group the table by an operation (`SpanName`) or an endpoint attribute instead of `ServiceName`, template the filter from that column, and each row click opens the events for that one operation or endpoint. For a group-by on a map attribute, see the alias note under [Validation and limitations](#validation).

## Set up a row-click action {#set-up}

Row-click actions are configured on the table tile itself; there is no separate page for them. Add or edit a tile and set its visualization type to **Table**. A **Row Click Action** button then appears in the editor toolbar, next to **Display Settings**. The button is shown for table tiles only, and its label reflects the current action: `Row Click Action: Default`, `Row Click Action: Search`, or `Row Click Action: Dashboard`. Click it to open the drawer.

<Image img={row_click_drawer} alt="Row Click Action drawer in Dashboard mode, with a Service Detail template target and a ServiceName filter templated from the clicked row" size="lg"/>

The drawer offers three actions:

- **Default**: the built-in behavior. Clicking a row opens the Search page, filtered by the row's group-by column values and the selected time range. This is what you get when no custom action is set.
- **Search**: send the click to the Search page for a source you choose.
- **Dashboard**: send the click to another dashboard owned by your team.

For **Search** and **Dashboard**, you choose where the click lands and template the filters carried into it:

- **Destination**: pick a specific source or dashboard, or choose **Template** and enter a [Handlebars](https://handlebarsjs.com/) template that is matched by name to an available source or dashboard. Use a constant name to always resolve the same target (for example `Service Detail`), or reference a row column to pick the target per row (for example `Errors-{{ServiceName}}`).
- **Filters**: click **Add filter** and provide an **Expression** (a column or expression on the destination, for example `ServiceName`) and a **Template** for its value (for example `{{ServiceName}}`). Templates reference the clicked row's columns with `{{columnName}}`. Each filter renders to an `expression IN (value)` condition at the destination, and filters that share an expression are merged. When the destination is a dashboard, the drawer pre-fills one empty filter for each filter that dashboard already declares, so you only fill in the templates.
- **WHERE** (optional): a Handlebars template rendered into the destination's global filter, in addition to the per-filter conditions above. Set its query language to SQL or Lucene so the destination parses it. For example, the SQL template `ServiceName = '{{ServiceName}}'` scopes the destination to the clicked row's service.

Click **Apply** to validate the templates (ClickStack reports any with invalid syntax), then save the dashboard to persist the action.

## How the destination and filters resolve {#how-it-resolves}

When a viewer clicks a row, ClickStack resolves the action against that row:

- **Destination.** Choosing a specific source or dashboard pins it by ID. A **Template** target renders against the clicked row and is then matched by name against your team's sources or dashboards. A name must be unique to resolve: if two sources or two dashboards share the rendered name, the link cannot resolve to one of them. An empty rendered name, or a name with no match, also fails to resolve.
- **Filters.** Each filter template renders against the row and becomes an `expression IN (value)` condition at the destination. A `Search` action opens `/search` scoped to the chosen source; a `Dashboard` action opens that dashboard. The clicked row's time range carries over in both cases.

:::note Dashboard targets need a matching filter declared
A filter carried into a dashboard only takes effect if the destination dashboard declares a top-level [custom filter](/use-cases/observability/clickstack/dashboards#custom-filters) whose expression matches the filter's **Expression**. If no declared filter matches, that value is dropped at click time and the destination opens unfiltered for that expression. This is why the dashboard mode pre-fills the destination's declared filters: match the expression, and the destination dropdown auto-populates with the clicked row's value.
:::

## Validation and limitations {#validation}

- **Table tiles only.** The **Row Click Action** button appears for table tiles, both the chart-builder table and a [SQL-based](/use-cases/observability/clickstack/dashboards/sql-visualizations) table. Other tile types do not have a row-click action.
- **Search targets must be log or trace sources.** Metric and session sources are not offered, and are rejected if set through the API.
- **Template names must be unique.** A template target resolves by name, so two sources or two dashboards with the same name cannot be used as a template target.
- **Dashboard targets need a matching declared filter** for a carried value to take effect (see the note above).
- **Map-attribute group-by needs a SQL alias.** A chart-builder group-by on a map attribute such as `SpanAttributes['http.route']` produces a result column whose name is the raw expression, which cannot be referenced as `{{...}}` in a template. To drill down from such a column, author the tile as a [SQL-based](/use-cases/observability/clickstack/dashboards/sql-visualizations) table and give the column an explicit `AS` alias, then reference that alias in the template. A group-by on a plain column such as `ServiceName` needs no alias.
