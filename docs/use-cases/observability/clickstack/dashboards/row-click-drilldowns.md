---
slug: /use-cases/observability/clickstack/dashboards/row-click-drilldowns
title: 'Table row-click drilldowns'
sidebar_label: 'Row-click drilldowns'
pagination_prev: null
pagination_next: null
description: 'Configure table tile row clicks to drill into Search or another dashboard, carrying the clicked row values through as filters'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'drilldown', 'table', 'row click', 'observability']
---

import Image from '@theme/IdealImage';
import row_click_drawer from '@site/static/images/clickstack/dashboards/row-click-drawer.png';
import row_click_drilldown from '@site/static/images/clickstack/dashboards/row-click-drilldown.png';

A table tile can be configured with a row-click action. When a viewer clicks a row, ClickStack opens either the [Search](/use-cases/observability/clickstack/search) page or another dashboard, carrying the values from the clicked row through as filters.

This is how you build sequenced workflows across dashboards. An overview table with one row per service answers "which service is unhealthy?", and a row click opens a focused search or a per-service dashboard that answers "what is happening inside it?". The viewer moves from the aggregate to the detail in one click, without rebuilding the query by hand.

Row-click actions apply to table tiles only. They are distinct from the chart [drilldown to search](/use-cases/observability/clickstack/dashboards#drilldown-to-search), which opens a context menu when you click a point on a line or bar chart.

## The two actions {#the-two-actions}

A row-click action opens one of two destinations:

- **Search** opens the Search page for a log or trace source. Metric and session sources are not searchable, so they cannot be search targets.
- **Dashboard** opens another dashboard owned by your team.

For both, you template a set of filters (and, optionally, a global `WHERE` condition) from the clicked row's columns. The rendered filters are applied at the destination, scoping it to the row you clicked.

## Configure a row-click action {#configure}

Row-click actions are configured from the tile editor. There is no separate page for them: you set the action on the table tile itself.

<VerticalStepper headerLevel="h3">

### Open a table tile for editing {#open-table-tile}

Add a new tile or edit an existing one, and set the visualization type to **Table**. A **Row Click Action** button appears in the editor toolbar, next to **Display Settings**. The button is shown for table tiles only, and its label reflects the current action: `Row Click Action: Default`, `Row Click Action: Search`, or `Row Click Action: Dashboard`.

### Open the row-click action drawer {#open-drawer}

Click **Row Click Action** to open the drawer. A segmented control at the top selects the action:

- **Default** keeps the built-in behavior: clicking a row opens the Search page, filtered by the row's group-by column values and the selected time range. This is the action used when no custom action is set.
- **Search** and **Dashboard** configure a custom drilldown, described below.

<Image img={row_click_drawer} alt="Row Click Action drawer in Dashboard mode, with a Service Detail template target and a ServiceName filter templated from the clicked row" size="lg"/>

### Choose the destination {#choose-destination}

Select **Search** or **Dashboard**, then choose where the click lands:

- For **Search**, choose a **Source**. Only log and trace sources are listed; metric and session sources are filtered out because the Search page cannot render them.
- For **Dashboard**, choose a **Dashboard** from your team's dashboards.
- In either mode you can instead choose **Template** and enter a [Handlebars](https://handlebarsjs.com/) template that is matched by name to an available source or dashboard. Use a constant name to always resolve the same target (for example `Service Detail`), or reference a row column to pick the target per row (for example `Errors-{{ServiceName}}`).

### Add filters {#add-filters}

Under **Filters**, click **Add filter** and provide:

- an **Expression**: a column or expression on the destination, for example `ServiceName`.
- a **Template**: a Handlebars template for its value, for example `{{ServiceName}}`.

Templates reference the clicked row's columns by name with `{{columnName}}`. When the row is clicked, each filter renders to an `expression IN (value)` condition on the destination. Filters that share an expression are merged into a single condition.

When you choose a destination dashboard, ClickStack pre-fills one empty filter for each filter that dashboard already declares, so you only need to fill in the templates.

### Set a global WHERE condition (optional) {#set-where}

The **WHERE** field takes a Handlebars template rendered into the destination's global filter, in addition to the per-filter conditions above. Set the query language to SQL or Lucene so the destination parses it correctly. For example, an SQL template `ServiceName = '{{ServiceName}}'` scopes the destination to the clicked row's service.

### Apply {#apply}

Click **Apply**. ClickStack validates the templates and reports any with invalid syntax. Save the dashboard to persist the action.

</VerticalStepper>

## How the destination and filters resolve {#how-it-resolves}

When a viewer clicks a row, ClickStack resolves the action against that row:

- **Destination.** Choosing a specific source or dashboard pins it by ID. A **Template** target renders against the clicked row and is then matched by name against your team's sources or dashboards. A name must be unique to resolve: if two sources or two dashboards share the rendered name, the link cannot resolve to one of them. An empty rendered name, or a name with no match, also fails to resolve.
- **Filters.** Each filter template renders against the row and becomes an `expression IN (value)` condition at the destination. A `Search` action opens `/search` scoped to the chosen source; a `Dashboard` action opens that dashboard. The clicked row's time range carries over in both cases.

:::note Dashboard targets need a matching filter declared
A filter carried into a dashboard only takes effect if the destination dashboard declares a top-level [custom filter](/use-cases/observability/clickstack/dashboards#custom-filters) whose expression matches the filter's **Expression**. If no declared filter matches, that value is dropped at click time and the destination opens unfiltered for that expression. This is why the dashboard mode pre-fills the destination's declared filters: match the expression, and the destination dropdown auto-populates with the clicked row's value.
:::

## Example: a service inventory that drills into a service detail dashboard {#example}

A common pairing is a service inventory (one row per service) that drills into a per-service detail dashboard. Clicking a service row opens the detail dashboard scoped to that service.

<VerticalStepper headerLevel="h3">

### Build the detail dashboard {#example-detail}

Create a dashboard named `Service Detail` and add a [custom filter](/use-cases/observability/clickstack/dashboards#custom-filters) with the expression `ServiceName` on your traces source. The dashboard-level filter re-scopes every tile to a single service, so the tiles themselves do not hardcode a service in their queries. Add the per-service tiles you want, such as request and error counts, latency percentiles, a span-duration heatmap, and top error messages.

Save this dashboard first. A template target is resolved by name at click time, so the detail dashboard must exist when a viewer clicks. If you later rename it, update the row-click action to match.

### Build the inventory table {#example-inventory}

On an overview dashboard, add a **Table** tile on your traces source grouped by `ServiceName`, with the columns you want per service. For example:

- `Requests`: count of spans.
- `Errors`: count of spans where `StatusCode` is `STATUS_CODE_ERROR`.
- `P95 Duration`: the 95th percentile of `Duration`.

Order by `Requests` descending so the busiest services sort to the top.

### Wire up the row click {#example-wire}

On the table tile, open **Row Click Action**, select **Dashboard**, and choose **Template** with the value `Service Detail`. Add one filter:

- **Expression**: `ServiceName`
- **Template**: `{{ServiceName}}`

Click **Apply** and save. The expression `ServiceName` matches the custom filter declared on the `Service Detail` dashboard, so the clicked row's service flows straight into that filter.

### Click a row {#example-click}

Hovering a row reveals a link affordance on the right edge of the table, with a hint describing the action (`Open dashboard`). Clicking the row opens the `Service Detail` dashboard scoped to that service, with the `ServiceName` filter set to the clicked value.

<Image img={row_click_drilldown} alt="Service Detail dashboard opened after a row click, with the Service Name filter populated to the clicked service" size="lg"/>

</VerticalStepper>

To drill into Search instead, set the action to **Search**, choose your traces source, and add the same `ServiceName` filter with template `{{ServiceName}}`. Clicking a row then opens the Search page scoped to that source and filtered to the row's service.

## Validation and limitations {#validation}

- **Table tiles only.** The **Row Click Action** button appears for table tiles, both the chart-builder table and a [SQL-based](/use-cases/observability/clickstack/dashboards/sql-visualizations) table. Other tile types do not have a row-click action.
- **Search targets must be log or trace sources.** Metric and session sources are not offered, and are rejected if set through the API.
- **Template names must be unique.** A template target resolves by name, so two sources or two dashboards with the same name cannot be used as a template target.
- **Dashboard targets need a matching declared filter** for a carried value to take effect (see the note above).
- **Map-attribute group-by needs a SQL alias.** A chart-builder group-by on a map attribute such as `SpanAttributes['http.route']` produces a result column whose name is the raw expression, which cannot be referenced as `{{...}}` in a template. To drill down from such a column, author the tile as a [SQL-based](/use-cases/observability/clickstack/dashboards/sql-visualizations) table and give the column an explicit `AS` alias, then reference that alias in the template. A group-by on a plain column such as `ServiceName` needs no alias.
