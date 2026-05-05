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
import event_deltas_before_after from '@site/static/images/clickstack/event-deltas/before-after.png';
import event_deltas_slow_vs_fast from '@site/static/images/clickstack/event-deltas/slow-vs-fast.png';
import event_deltas_drill_down from '@site/static/images/clickstack/event-deltas/drill-down.png';
import settings_drawer from '@site/static/images/clickstack/event-deltas/settings-drawer.png';

Event deltas pair a latency heatmap with automatic attribute analysis so you can see the shape of your trace data and find what makes the slow spans different, without writing queries. There are three ways to use it:

- **Distribution mode (always on)**: when no heatmap selection exists, every attribute's value distribution is shown for the current span population. Useful for spotting dominant or unusually rare values (cardinality outliers).
- **Comparison mode**: drag a rectangle on the heatmap to compare the spans inside (Selection) against everything outside (Background). Useful for isolating deviations.
- **Iterative drill-down**: click any bar to filter (or exclude) on that value. The heatmap re-renders against the filtered population, so you can keep narrowing until the cause is obvious.

<Image img={event_deltas_overview} alt="Event deltas overview in dark theme on a single payment service over twenty-four hours. The latency heatmap is steady through the morning with a dense bright band around 1 to 10 ms, and visibly drifts upward through the afternoon and evening so that by midnight the bulk of spans sit around 10 to 100 ms with a longer slow tail. Below the heatmap, a grid of distribution-mode bars (legend reads All spans) covers payment-domain attributes including transaction.decline_reason, payment.card_type, payment.card_is_international, transaction.cross_border, risk.3ds_enrolled, security.mfa_verified, infra.circuit_breaker_state, risk.3ds_authenticated, and payment.authorization_code" size="lg"/>

The screenshot above shows a single service over a twenty-four hour window with no selection drawn. The heatmap reveals that latency isn't flat: the bright band drifts upward through the day, so spans that took 1 to 10 ms in the morning are taking 10 to 100 ms by evening. That progressive degradation is exactly the kind of pattern Event deltas is built to investigate.

## Prerequisites {#prerequisites}

Event deltas require a **Trace** data source with a duration expression. Any OpenTelemetry-instrumented service producing span data works. Available in all ClickStack deployments (Managed, Open Source, ClickHouse Cloud).

## Getting started {#getting-started}

1. From the **Data Source** dropdown, select a source that holds traces. Source names are arbitrary; what matters is that the source is configured as a Trace type. The **Event Deltas** tab is only enabled for such sources.
2. In the **Analysis Mode** section, click the **Event Deltas** tab.

Event deltas is a separate analysis mode alongside **Results Table** and **Event Patterns**. Switching to it swaps the view to a heatmap and an attribute analysis grid, but your search filters and time range are preserved and you can switch back at any time.

## The heatmap {#the-heatmap}

The heatmap plots spans across two dimensions:

- **X axis**: time
- **Y axis**: a numeric value, defaulting to span duration in milliseconds (logarithmic scale)

Color intensity indicates event count per bucket; brighter means more spans.

You can read patterns straight off the heatmap: bimodal latency, latency spikes at specific times, a band of consistently slow spans, or a slow band that drifts upward over time (a creeping regression). To investigate a region, click and drag a rectangle on it. That becomes your **Selection** and switches the analysis below into comparison mode.

## Distribution mode: cardinality outliers {#distribution-mode}

With no selection on the heatmap, the analysis panel shows one bar chart per attribute, computed across all matching spans. The legend reads **All spans** (visible in the overview screenshot above).

Attributes are ranked by how concentrated their values are: those dominated by a few values appear first; uniform, high-entropy attributes are deprioritized.

Use distribution mode when you want to understand the **cardinality shape** of your data:

- **Highs**: which services, endpoints, status codes, or hosts dominate your span population? Often surfaces a single tenant, version, or route doing most of the traffic.
- **Lows**: values that occur but rarely. A status code that appears in just `0.5%` of spans, or one host that barely shows up, can be the most interesting signal. The long tail is where regressions and bad actors hide.

Combine with the search bar to narrow the population first (e.g., only error spans, only client spans, only one endpoint), then read the distributions for that subset.

## Comparison mode: deviations from normal {#comparison-mode}

Click and drag a rectangle on the heatmap to enter comparison mode. The selected spans become the **Selection** (orange bars); everything outside becomes the **Background** (green bars). Each attribute chart then shows both populations side by side, sorted so the attributes with the largest divergence appear first. A value present almost exclusively in one side, or absent from one side, is the strongest candidate for what differs.

The shape of the rectangle you draw changes the question you're asking. Two common shapes are described below; a third is covered under [Other selection shapes](#other-shapes).

### Use case 1: Before vs after a regression {#before-vs-after}

When the heatmap shows latency drifting upward over the timeline (the slow band thickens, the bright band climbs, or a clear inflection point separates a healthy period from a degraded one), drag a tall rectangle that covers the full latency axis but only the time window after the change. The degraded period becomes the Selection; the healthy period becomes the Background.

<Image img={event_deltas_before_after} alt="Comparison mode on the payment service in dark theme over twenty-four hours after dragging a full-height vertical strip over the right portion of the timeline (roughly 4pm to midnight). The Selection covers the period where latency was visibly creeping upward; the Background covers the earlier healthy period. The bars below surface ScopeName (payment more frequent in the Selection), ScopeVersion (0.57.2 strongly Selection-biased, 0.1.0 Background-biased), payment.tokenization_method (apple-pay-token Selection-biased), and transaction.installments (1 Selection-biased, 12 Background-biased) as the most divergent attributes" size="lg"/>

In the example above, the Selection covers roughly the second half of the day, where the bright band has climbed from a 1 to 10 ms range into a 10 to 100 ms range. The bars below surface attributes that diverge between the degraded period and the earlier healthy one: `ScopeVersion` (`0.57.2` strongly Selection-biased, `0.1.0` Background-biased), `ScopeName` (`payment` more frequent in the Selection), `SpanAttributes.app.payment.tokenization_method` (`apple-pay-token` Selection-biased), and `SpanAttributes.app.transaction.installments` (`1` Selection-biased, `12` Background-biased). Read together, these are the fingerprint of a deployment: a new instrumentation library version came out alongside a code change that altered which payment paths the service is exercising.

This is the right shape when the heatmap shows a time-localized change in latency and you want to ask "what changed?" The comparison answers that question without you needing to correlate deploy logs by hand.

### Use case 2: Slow versus fast {#slow-vs-fast}

When the heatmap shows two distinct latency bands but no obvious time-localized anomaly, drag a wide rectangle that spans the entire time range but covers only the upper latency band. The slow tail becomes the Selection; the fast bulk becomes the Background.

<Image img={event_deltas_slow_vs_fast} alt="Slow versus fast comparison on the accounting service in dark theme over twenty-four hours. The heatmap shows two distinct latency bands: a dense slow band in green and yellow at 1 to 100 ms and a sparser fast band in purple at 10 microseconds to 1 ms. The Selection (orange) and Background (green) bars below are nearly identical for every tracked attribute (TraceState, SpanName, SpanKind, ServiceName, k8s pod metadata, container.id, host.name, OS build), indicating no application attribute explains the latency difference" size="lg"/>

The example above is a different service whose heatmap separates cleanly into two horizontal bands: a dense slow band at 1 to 100 ms sits above a sparser fast band at 10 µs to 1 ms. The Selection covers the full time range but only the slow band; the fast band is the Background. What's interesting here is what the comparison _doesn't_ surface: every tracked attribute (`SpanName`, `SpanKind`, `ServiceName`, k8s pod metadata, `container.id`, `host.name`, OS build) shows nearly identical Selection and Background distributions. The slow and fast populations are systemically identical from the application's point of view.

When no attribute on the span explains the divergence, the cause is usually below the application: GC pauses, I/O contention, scheduler latency, cold-cache effects, noisy neighbors. The next step is to inspect host- and runtime-level metrics for the same pod over the same time window. Comparison mode reaching this verdict ("nothing on the span differs") is itself a useful result; it tells you to stop looking at span attributes and start looking at infrastructure.

This is the right shape when you want to ask "what makes the slow spans different from the fast ones?" rather than chasing a specific anomaly. A divergent attribute points at a code-path or input cause; a flat comparison points at a systemic one.

### Other selection shapes {#other-shapes}

- **A small focused rectangle around a localized cluster**: when a tight knot of slow spans doesn't fit the rest of the heatmap (a brief burst on the right edge, a knot in the middle of an otherwise quiet band), draw a small box around just that cluster. The Selection is the cluster, the Background is everything else, and the bars surface what makes that specific cluster different. Use this when you've already spotted the anomaly visually and want to investigate its specific shape.

The choice of shape determines the question. A vertical strip asks _what changed_; a horizontal band asks _what's slower_; a small focused box asks _what's special about this cluster_.

## Iterative drill-down {#drill-down}

Comparison and distribution modes are most powerful when chained. Click any bar to open a popover with three actions:

- **Filter**: keep only spans with this value
- **Exclude**: remove spans with this value
- **Copy**: copy the value to the clipboard

<Image img={event_deltas_drill_down} alt="Click popover in dark theme on the ScopeVersion 0.57.2 bar, showing Selection 53.9% versus Background 49.5% and three action icons (filter, exclude, copy)" size="lg"/>

After applying a filter or exclude, the heatmap selection is cleared, the heatmap re-renders against the new population, and distribution mode resumes against that filtered set. Watch how the heatmap reshapes; a successful filter visibly removes the slow band, collapses the bimodal split, or flattens the upward drift. Repeat: spot the next suspicious value, filter, look at the new heatmap, look at the new distributions. A few iterations usually narrow a regression to one or two attributes.

:::note
Aggregated **Other (N)** buckets that collapse low-frequency values aren't clickable. To filter for a specific value within that bucket, use the [search bar](/use-cases/observability/clickstack/search) directly.
:::

When the population is small enough, switch to the **Results Table** tab to inspect individual traces; your filters carry over.

## Customize the heatmap {#customize}

The gear icon in the top-right of the heatmap opens the **Display Settings** drawer.

<Image img={settings_drawer} alt="Display Settings drawer in dark theme with Scale (Log/Linear toggle), Value expression, and Count expression fields, plus Cancel and Apply buttons" size="lg"/>

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
- **Pick selections with clear visual contrast.** Comparison mode works best when the Selection band is visibly distinct from the Background, for example a degraded period that begins at a recognizable moment, or a slow tail clearly separated from the bulk. Selections that overlap heavily with the rest of the data tend to surface noise rather than the actual deviation.
- **Iterate filter, heatmap, filter.** A single selection rarely identifies the cause. Treat the first comparison as a hypothesis, filter on the most divergent value, and re-read the new heatmap and distributions. Two or three iterations usually narrow a regression to one or two attributes.
- **Use distribution mode without a selection** when no contrast is yet visible (you know there is an issue but the heatmap looks uniform). Apply a hypothesis filter such as only error spans, only client spans, or only one endpoint, and let the attribute distributions point you at the highest-impact values before you draw any rectangle.

## Troubleshooting {#troubleshooting}

### Event Deltas tab isn't visible {#tab-not-visible}

The **Event Deltas** tab under **Analysis Mode** only appears when a **Trace** source with a duration expression is selected. Verify that your data source is configured as a Trace type and has span data with duration information.

### Attribute charts show few or no results {#few-results}

If the sample is too small (fewer than a few dozen spans), distributions may not be statistically meaningful. Widen the time range or relax your search filters.
