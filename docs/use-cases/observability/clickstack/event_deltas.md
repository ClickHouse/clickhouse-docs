---
slug: /use-cases/observability/clickstack/event_deltas
title: 'Event deltas with ClickStack'
sidebar_label: 'Event deltas'
pagination_prev: null
pagination_next: null
description: 'Analyze trace attribute distributions and compare outlier spans with Event deltas in ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'event deltas', 'heatmap', 'attribute distribution', 'trace analysis', 'observability']
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import distribution_mode from '@site/static/images/clickstack/event-deltas/distribution-mode.png';
import settings_drawer from '@site/static/images/clickstack/event-deltas/settings-drawer.png';

Event deltas pair a latency heatmap with automatic attribute analysis so you can see the shape of your trace data and find what makes the slow spans different — without writing queries. There are three ways to use it:

- **Distribution mode (always on)** — when no heatmap selection exists, every attribute's value distribution is shown for the current span population. Useful for spotting dominant or unusually rare values (cardinality outliers).
- **Comparison mode** — drag a rectangle on the heatmap to compare the spans inside (Selection) against everything outside (Background). Useful for isolating deviations.
- **Iterative drill-down** — click any bar to filter (or exclude) on that value. The heatmap re-renders against the filtered population, so you can keep narrowing until the cause is obvious.

<Image img={event_deltas} alt="Event deltas overview" size="lg"/>

## Prerequisites {#prerequisites}

Event deltas require a **Trace** data source with a duration expression. Any OpenTelemetry-instrumented service producing span data works. Available in all ClickStack deployments (Managed, Open Source, ClickHouse Cloud).

## Getting started {#getting-started}

1. From the **Data Source** dropdown, select a source that holds traces. Source names are arbitrary — what matters is that the source is configured as a Trace type. The **Event Deltas** tab is only enabled for such sources.
2. In the **Analysis Mode** section, click the **Event Deltas** tab.

Event deltas is a separate analysis mode alongside **Results Table** and **Event Patterns** — switching to it swaps the view to a heatmap and an attribute analysis grid, but your search filters and time range are preserved and you can switch back at any time.

## The heatmap {#the-heatmap}

The heatmap plots spans across two dimensions:

- **X axis** — time
- **Y axis** — a numeric value, defaulting to span duration in milliseconds (logarithmic scale)

Color intensity indicates event count per bucket — brighter means more spans.

You can read patterns straight off the heatmap: bimodal latency, latency spikes at specific times, or a band of consistently slow spans. To investigate a region, click and drag a rectangle on it — that becomes your **Selection** and switches the analysis below into comparison mode.

## Distribution mode: cardinality outliers {#distribution-mode}

With no selection on the heatmap, the analysis panel shows one bar chart per attribute, computed across all matching spans. The legend reads **All spans**.

<Image img={distribution_mode} alt="Distribution mode showing per-attribute value distributions across all spans" size="lg"/>

Attributes are ranked by how concentrated their values are — those dominated by a few values appear first; uniform, high-entropy attributes are deprioritized.

Use distribution mode when you want to understand the **cardinality shape** of your data:

- **Highs** — which services, endpoints, status codes, or hosts dominate your span population? Often surfaces a single tenant, version, or route doing most of the traffic.
- **Lows** — values that occur but rarely. A status code that appears in just `0.5%` of spans, or one host that barely shows up, can be the most interesting signal — the long tail is where regressions and bad actors hide.

Combine with the search bar to narrow the population first (e.g., only error spans, only client spans, only one endpoint), then read the distributions for that subset.

## Comparison mode: deviations from normal {#comparison-mode}

Click and drag a rectangle on the heatmap, then click **Filter by Selection** to enter comparison mode. The selected spans become the **Selection** (red bars); everything outside becomes the **Background** (green bars). Each attribute chart then shows both populations side by side, sorted so the attributes with the largest divergence appear first — a value present almost exclusively in one side (or absent from one side) is the strongest candidate for what differs.

<Image img={event_deltas_separation} alt="Heatmap selection over a slow band starting at a specific time, with comparison bars below" size="lg"/>

Any rectangle works, but three kinds of selection answer different questions:

- **A region that feels off** — a band of higher latency confined to a particular time window, the onset of a visible regression, a cluster of spans that doesn't fit the rest. Use this when something in the heatmap already looks suspicious.
- **Full-width vertical split (slow vs fast)** — drag a rectangle covering the entire time range but only the upper latency band (slow tail), leaving the bulk of fast spans as Background. Compares what makes the slow spans different from the fast ones.
- **Full-height horizontal split (before vs after)** — drag a rectangle covering the full latency axis but only the time window after a suspected change, leaving the earlier period as Background. Compares what changed between the two time windows, independent of latency.

Vertical and horizontal full-range splits are especially useful when nothing in the heatmap jumps out visually — they let the attribute analysis do the work of finding the deviation rather than relying on the eye.

## Iterative drill-down {#drill-down}

Comparison and distribution modes are most powerful when chained. Click any bar to open a popover with three actions:

- **Filter** — keep only spans with this value
- **Exclude** — remove spans with this value
- **Copy** — copy the value to the clipboard

<Image img={event_deltas_issue} alt="Bar popover showing filter, exclude and copy actions over a value isolated to one population" size="lg"/>

After applying a filter or exclude, the heatmap selection is cleared, the heatmap re-renders against the new population, and distribution mode resumes against that filtered set. Watch how the heatmap reshapes — a successful filter visibly removes the slow band or collapses the bimodal split. Repeat: spot the next suspicious value, filter, look at the new heatmap, look at the new distributions. A few iterations usually narrow a regression to one or two attributes.

:::note
Aggregated **Other (N)** buckets that collapse low-frequency values aren't clickable. To filter for a specific value within that bucket, use the [search bar](/use-cases/observability/clickstack/search) directly.
:::

When the population is small enough, switch to the **Results Table** tab to inspect individual traces — your filters carry over.

## Customize the heatmap {#customize}

The gear icon in the top-right of the heatmap opens the **Heatmap Settings** drawer.

<Image img={settings_drawer} alt="Heatmap Settings drawer with Scale, Value and Count fields" size="lg"/>

| Parameter | Default          | Description                                                                                                              |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Scale** | Log              | Log handles wide latency ranges; Linear is better for narrow, uniform distributions.                                     |
| **Value** | `(Duration)/1e6` | Any numeric expression — e.g., response size, error rate, a custom span attribute.                                       |
| **Count** | `count()`        | Aggregation for color — switch to `avg()`, `sum()`, `p95()`, or expressions like `countDistinct(field)`.                 |

Click **Apply** to update the heatmap; the attribute analysis below follows.

:::tip Heatmap on dashboards
The same heatmap is also available as a [dashboard tile](/use-cases/observability/clickstack/dashboards#create-a-tile-heatmap), which is useful when you want to monitor the distribution shape over time outside the Event Deltas drill-down flow.
:::

## Troubleshooting {#troubleshooting}

### Event Deltas tab isn't visible {#tab-not-visible}

The **Event Deltas** tab under **Analysis Mode** only appears when a **Trace** source with a duration expression is selected. Verify that your data source is configured as a Trace type and has span data with duration information.

### Attribute charts show few or no results {#few-results}

If the sample is too small (fewer than a few dozen spans), distributions may not be statistically meaningful. Widen the time range or relax your search filters.
