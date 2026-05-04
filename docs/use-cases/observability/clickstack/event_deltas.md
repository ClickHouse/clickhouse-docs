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
import event_deltas_overview from '@site/static/images/clickstack/event-deltas/overview.png';
import event_deltas_anomaly_box from '@site/static/images/clickstack/event-deltas/anomaly-box.png';
import event_deltas_slow_vs_fast from '@site/static/images/clickstack/event-deltas/slow-vs-fast.png';
import event_deltas_drill_down from '@site/static/images/clickstack/event-deltas/drill-down.png';
import settings_drawer from '@site/static/images/clickstack/event-deltas/settings-drawer.png';

Event deltas pair a latency heatmap with automatic attribute analysis so you can see the shape of your trace data and find what makes the slow spans different, without writing queries. There are three ways to use it:

- **Distribution mode (always on)** — when no heatmap selection exists, every attribute's value distribution is shown for the current span population. Useful for spotting dominant or unusually rare values (cardinality outliers).
- **Comparison mode** — drag a rectangle on the heatmap to compare the spans inside (Selection) against everything outside (Background). Useful for isolating deviations.
- **Iterative drill-down** — click any bar to filter (or exclude) on that value. The heatmap re-renders against the filtered population, so you can keep narrowing until the cause is obvious.

<Image img={event_deltas_overview} alt="Event deltas overview: payment-service spans over the last hour. The latency heatmap shows a fast bulk near 1–10 ms and a sparse slow band 10–100 ms with a fresh cluster of slow events appearing on the right side of the timeline" size="lg"/>

## Prerequisites {#prerequisites}

Event deltas require a **Trace** data source with a duration expression. Any OpenTelemetry-instrumented service producing span data works. Available in all ClickStack deployments (Managed, Open Source, ClickHouse Cloud).

## Getting started {#getting-started}

1. From the **Data Source** dropdown, select a source that holds traces. Source names are arbitrary; what matters is that the source is configured as a Trace type. The **Event Deltas** tab is only enabled for such sources.
2. In the **Analysis Mode** section, click the **Event Deltas** tab.

Event deltas is a separate analysis mode alongside **Results Table** and **Event Patterns**. Switching to it swaps the view to a heatmap and an attribute analysis grid, but your search filters and time range are preserved and you can switch back at any time.

## The heatmap {#the-heatmap}

The heatmap plots spans across two dimensions:

- **X axis** — time
- **Y axis** — a numeric value, defaulting to span duration in milliseconds (logarithmic scale)

Color intensity indicates event count per bucket; brighter means more spans.

You can read patterns straight off the heatmap: bimodal latency, latency spikes at specific times, or a band of consistently slow spans. To investigate a region, click and drag a rectangle on it. That becomes your **Selection** and switches the analysis below into comparison mode.

## Distribution mode: cardinality outliers {#distribution-mode}

With no selection on the heatmap, the analysis panel shows one bar chart per attribute, computed across all matching spans. The legend reads **All spans** (visible in the overview screenshot above).

Attributes are ranked by how concentrated their values are: those dominated by a few values appear first; uniform, high-entropy attributes are deprioritized.

Use distribution mode when you want to understand the **cardinality shape** of your data:

- **Highs** — which services, endpoints, status codes, or hosts dominate your span population? Often surfaces a single tenant, version, or route doing most of the traffic.
- **Lows** — values that occur but rarely. A status code that appears in just `0.5%` of spans, or one host that barely shows up, can be the most interesting signal. The long tail is where regressions and bad actors hide.

Combine with the search bar to narrow the population first (e.g., only error spans, only client spans, only one endpoint), then read the distributions for that subset.

## Comparison mode: deviations from normal {#comparison-mode}

Click and drag a rectangle on the heatmap, then click **Filter by Selection** to enter comparison mode. The selected spans become the **Selection** (red bars); everything outside becomes the **Background** (green bars). Each attribute chart then shows both populations side by side, sorted so the attributes with the largest divergence appear first. A value present almost exclusively in one side, or absent from one side, is the strongest candidate for what differs.

The shape of the rectangle you draw changes the question you're asking. Two common shapes are described below.

### Use case 1: A specific cluster that feels off {#anomaly-cluster}

When you see a localized burst of slow spans on the heatmap (a cluster forming on the right edge of the timeline, the onset of a visible regression, or a tight knot of spans that doesn't fit the rest), draw a small rectangle around just that cluster. The Selection is the cluster, the Background is everything else.

<Image img={event_deltas_anomaly_box} alt="Comparison mode on the payment service with a small anomaly box selected on the right edge of the heatmap, capturing a fresh cluster of slow spans. The bars below surface fees.type, payment.card_level, security.mfa_verified, infra.circuit_breaker_state and webhook.status as candidate divergent attributes" size="lg"/>

In the example above, the selection covers a fresh cluster of slow spans around the right edge of the timeline (the most recent few minutes). The bars below surface payment-domain attributes that diverge between this cluster and the rest of the population: `fees.type`, `payment.card_level`, `security.mfa_verified`, `infra.circuit_breaker_state`, `webhook.status`. Each is a candidate explanation for what makes this specific cluster slower than the rest.

This is the right shape to use when something in the heatmap already looks suspicious and you want to investigate it specifically.

### Use case 2: Slow versus fast (vertical split) {#slow-vs-fast}

When the heatmap shows two distinct latency bands (for example, a dense fast bulk and a sparser slow tail) but no obvious time-localized anomaly, drag a rectangle that spans the entire time range but covers only the upper latency band. The slow tail becomes the Selection; the fast bulk becomes the Background.

<Image img={event_deltas_slow_vs_fast} alt="Comparison mode on the payment service with a full-width selection across the slow latency band, leaving the fast bulk as Background. The bars below show circuit_breaker_state, fees.type, mfa_verified, acquirer_bank, transaction.installments and authorization_response splitting between Selection and Background" size="lg"/>

In the example above, the Selection rectangle spans the full hour but covers only the 10–100 ms band. Comparison surfaces `infra.circuit_breaker_state` (with `closed` strongly Selection-biased), `fees.type` (`gateway` Selection-biased), `payment.acquirer_bank` (one acquirer biased toward slow), `transaction.installments`, and `payment.authorization_response` as the attributes most associated with the slow tail.

This is the right shape when you want to ask "what makes the slow spans different from the fast ones?" rather than chasing a specific anomaly.

### Other selection shapes {#other-shapes}

- **Full-height horizontal split (before vs after)** — drag a rectangle covering the full latency axis but only the time window after a suspected change, leaving the earlier period as Background. Compares what changed between the two time windows, independent of latency. Useful when a regression has a clear onset moment.

The full-range splits (vertical and horizontal) are especially useful when nothing in the heatmap jumps out visually; they let the attribute analysis do the work of finding the deviation rather than relying on the eye.

## Iterative drill-down {#drill-down}

Comparison and distribution modes are most powerful when chained. Click any bar to open a popover with three actions:

- **Filter** — keep only spans with this value
- **Exclude** — remove spans with this value
- **Copy** — copy the value to the clipboard

<Image img={event_deltas_drill_down} alt="Click popover on the fees.type = gateway bar showing Selection 19.8% / Background 17.4%, with filter, exclude and copy actions" size="lg"/>

After applying a filter or exclude, the heatmap selection is cleared, the heatmap re-renders against the new population, and distribution mode resumes against that filtered set. Watch how the heatmap reshapes; a successful filter visibly removes the slow band or collapses the bimodal split. Repeat: spot the next suspicious value, filter, look at the new heatmap, look at the new distributions. A few iterations usually narrow a regression to one or two attributes.

:::note
Aggregated **Other (N)** buckets that collapse low-frequency values aren't clickable. To filter for a specific value within that bucket, use the [search bar](/use-cases/observability/clickstack/search) directly.
:::

When the population is small enough, switch to the **Results Table** tab to inspect individual traces; your filters carry over.

## Customize the heatmap {#customize}

The gear icon in the top-right of the heatmap opens the **Heatmap Settings** drawer.

<Image img={settings_drawer} alt="Heatmap Settings drawer with Scale, Value and Count fields" size="lg"/>

| Parameter | Default          | Description                                                                                                              |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Scale** | Log              | Log handles wide latency ranges; Linear is better for narrow, uniform distributions.                                     |
| **Value** | `(Duration)/1e6` | Any numeric expression: response size, error rate, a custom span attribute.                                              |
| **Count** | `count()`        | Aggregation for color. Switch to `avg()`, `sum()`, `p95()`, or expressions like `countDistinct(field)`.                  |

Click **Apply** to update the heatmap; the attribute analysis below follows.

Common scenarios where you'd change these defaults:

- **Switch Scale to Linear** when the latency band is narrow (for example, a service whose spans all run between 5 and 50 ms). Log scale wastes vertical range on the upper end where there is no data.
- **Plot something other than duration on the Y axis.** Setting **Value** to `SpanAttributes.http.response.size` lets you investigate slow *large* responses; an expression like `if(StatusCode = 'Error', 1, 0)` plots error frequency over time across services.
- **Color by something other than count.** Setting **Count** to `p95(Duration)` colors each bucket by tail latency rather than volume, surfacing rare-but-slow pockets that a count-based view washes out. `countDistinct(TraceId)` distinguishes trace volume from span volume when one trace produces many spans.

## Tips for effective use {#tips}

A few practices make Event deltas substantially more useful:

- **Filter to a single service first.** Latency varies widely across services and mixing them obscures the signal. Use the search bar to narrow to one `ServiceName` (or one endpoint) before you start, so the heatmap and distributions reflect a comparable population.
- **Pick selections with clear visual contrast.** Comparison mode works best when the Selection band is visibly distinct from the Background, for example a slow band that begins at a recognizable moment, or a high-latency tail clearly separated from the bulk. Selections that overlap with the rest of the data tend to surface noise rather than the actual deviation.
- **Iterate filter, heatmap, filter.** A single selection rarely identifies the cause. Treat the first comparison as a hypothesis, filter on the most divergent value, and re-read the new heatmap and distributions. Two or three iterations usually narrow a regression to one or two attributes.
- **Use distribution mode without a selection** when no contrast is yet visible (you know there is an issue but the heatmap looks uniform). Apply a hypothesis filter such as only error spans, only client spans, or only one endpoint, and let the attribute distributions point you at the highest-impact values before you draw any rectangle.

## Troubleshooting {#troubleshooting}

### Event Deltas tab isn't visible {#tab-not-visible}

The **Event Deltas** tab under **Analysis Mode** only appears when a **Trace** source with a duration expression is selected. Verify that your data source is configured as a Trace type and has span data with duration information.

### Attribute charts show few or no results {#few-results}

If the sample is too small (fewer than a few dozen spans), distributions may not be statistically meaningful. Widen the time range or relax your search filters.
