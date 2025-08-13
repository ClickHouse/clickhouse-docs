---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: 'Remote Demo Dataset'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack and a remote demo dataset'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/demo_connection.png';
import edit_demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_connection.png';
import edit_demo_source from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_source.png';
import step_2 from '@site/static/images/use-cases/observability/hyperdx-demo/step_2.png';
import step_3 from '@site/static/images/use-cases/observability/hyperdx-demo/step_3.png';
import step_4 from '@site/static/images/use-cases/observability/hyperdx-demo/step_4.png';
import step_5 from '@site/static/images/use-cases/observability/hyperdx-demo/step_5.png';
import step_6 from '@site/static/images/use-cases/observability/hyperdx-demo/step_6.png';
import step_7 from '@site/static/images/use-cases/observability/hyperdx-demo/step_7.png';
import step_8 from '@site/static/images/use-cases/observability/hyperdx-demo/step_8.png';
import step_9 from '@site/static/images/use-cases/observability/hyperdx-demo/step_9.png';
import step_10 from '@site/static/images/use-cases/observability/hyperdx-demo/step_10.png';
import step_11 from '@site/static/images/use-cases/observability/hyperdx-demo/step_11.png';
import step_12 from '@site/static/images/use-cases/observability/hyperdx-demo/step_12.png';
import step_13 from '@site/static/images/use-cases/observability/hyperdx-demo/step_13.png';
import step_14 from '@site/static/images/use-cases/observability/hyperdx-demo/step_14.png';
import step_15 from '@site/static/images/use-cases/observability/hyperdx-demo/step_15.png';
import step_16 from '@site/static/images/use-cases/observability/hyperdx-demo/step_16.png';
import step_17 from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import step_18 from '@site/static/images/use-cases/observability/hyperdx-demo/step_18.png';
import step_19 from '@site/static/images/use-cases/observability/hyperdx-demo/step_19.png';
import step_20 from '@site/static/images/use-cases/observability/hyperdx-demo/step_20.png';
import step_21 from '@site/static/images/use-cases/observability/hyperdx-demo/step_21.png';
import step_22 from '@site/static/images/use-cases/observability/hyperdx-demo/step_22.png';
import step_23 from '@site/static/images/use-cases/observability/hyperdx-demo/step_23.png';
import step_24 from '@site/static/images/use-cases/observability/hyperdx-demo/step_24.png';
import demo_sources from '@site/static/images/use-cases/observability/hyperdx-demo//demo_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import DemoArchitecture from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';

**The following guide assumes you have deployed ClickStack using the [instructions for the all-in-one image](/use-cases/observability/clickstack/getting-started), or [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only) and completed initial user creation. Alternatively, users can skip all local setup and simply connect to our ClickStack hosted demo [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) which uses this dataset.**

This guide uses a sample dataset hosted on the public ClickHouse playground at [sql.clickhouse.com](https://sql.clickhpouse.com), which you can connect to from your local ClickStack deployment.

:::warning Not supported with HyperDX in ClickHouse Cloud
Remote databases are not supported when HyperDX is hosted in ClickHouse Cloud. This dataset is therefore not supported. 
:::

It contains approximately 40 hours of data captured from the ClickHouse version of the official OpenTelemetry (OTel) demo. The data is replayed nightly with timestamps adjusted to the current time window, allowing users to explore system behavior using HyperDX's integrated logs, traces, and metrics.

:::note Data variations
Because the dataset is replayed from midnight each day, the exact visualizations may vary depending on when you explore the demo.
:::

## Demo scenario {#demo-scenario}

In this demo, we investigate an incident involving an e-commerce website that sells telescopes and related accessories.

The customer support team has reported that users are experiencing issues completing payments at checkout. The issue has been escalated to the Site Reliability Engineering (SRE) team for investigation.

Using HyperDX, the SRE team will analyze logs, traces, and metrics to diagnose and resolve the issue—then review session data to confirm whether their conclusions align with actual user behavior.

## Open Telemetry Demo {#otel-demo}

This demo uses a [ClickStack maintained fork](https://github.com/ClickHouse/opentelemetry-demo) of the official OpenTelemetry demo.

<DemoArchitecture/>

## Demo steps {#demo-steps}

**We have instrumented this demo with [ClickStack SDKs](/use-cases/observability/clickstack/sdks), deploying the services in Kubernetes, from which metrics and logs have also been collected.**

<VerticalStepper headerLevel="h3">

### Connect to the demo server {#connect-to-the-demo-server}

:::note Local-Only mode
This step can be skipped if you clicked `Connect to Demo Server` when deploying in Local Mode. If using this mode, sources will be prefixed with `Demo_` e.g. `Demo_Logs`
:::

Navigate to `Team Settings` and click `Edit` for the `Local Connection`:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

Rename the connection to `Demo` and complete the subsequent form with the following connection details for the demo server:

- `Connection Name`: `Demo`
- `Host`: `https://sql-clickhouse.clickhouse.com`
- `Username`: `otel_demo`
- `Password`: Leave empty

<Image img={edit_demo_connection} alt="Edit Demo Connection" size="lg"/>

### Modify the sources {#modify-sources}

:::note Local-Only mode
This step can be skipped if you clicked `Connect to Demo Server` when deploying in Local Mode. If using this mode, sources will be prefixed with `Demo_` e.g. `Demo_Logs`
:::

Scroll up to `Sources` and modify each of the sources - `Logs`, `Traces`, `Metrics`, and `Sessions` - to use the `otel_v2` database. 

<Image img={edit_demo_source} alt="Edit Demo Source" size="lg"/>

:::note
You may need to reload the page to ensure the full list of databases is listed in each source.
:::

### Adjust the time frame {#adjust-the-timeframe}

Adjust the time to show all data from the previous `1 day` using the time picker in the top right.

<Image img={step_2} alt="Step 2" size="lg"/>

You may a small difference in the number of errors in the overview bar chart, with a small increase in red in several consecutive bars.

:::note
The location of the bars will differ depending on when you query the dataset.
:::

### Filter to errors {#filter-to-errors}

To highlight occurrences of errors, use the `SeverityText` filter and select `error` to display only error-level entries.

The error should be more apparent:

<Image img={step_3} alt="Step 3" size="lg"/>

### Identify the error patterns {#identify-error-patterns}

With HyperDX's Clustering feature, you can automatically identify errors and group them into meaningful patterns. This accelerates user analysis when dealing with large volumes of log and traces. To use it, select `Event Patterns` from the `Analysis Mode` menu on the left panel.

The error clusters reveal issues related to failed payments, including a named pattern `Failed to place order`. Additional clusters also indicate problems charging cards and caches being full.

<Image img={step_4} alt="Step 4" size="lg"/>

Note that these error clusters likely originate from different services.

### Explore an error pattern {#explore-error-pattern}

Click the most obvious error clusters which correlates with our reported issue of users being able to complete payments: `Failed to place order`.

This will display a list of all occurrences of this error which are associated with the `frontend` service:

<Image img={step_5} alt="Step 5" size="lg"/>

Select any of the resulting errors. The logs metadata will be shown in detail. Scrolling through both the `Overview` and `Column Values` suggests an issue with the charging cards due to a cache:

`failed to charge card: could not charge the card: rpc error: code = Unknown desc = Visa cache full: cannot add new item.`

<Image img={step_6} alt="Step 6" size="lg"/>

### Explore the infrastructure {#explore-the-infrastructure}

We've identified a cache-related error that's likely causing payment failures. We still need to identify where this issue is originating from in our microservice architecture.

Given the cache issue, it makes sense to investigate the underlying infrastructure - potentially we have memory problem in the associated pods? In ClickStack, logs and metrics are unified and displayed in context, making it easier to uncover the root cause quickly.

Select the `Infrastructure` tab to view the metrics associated with the underlying pods for the `frontend` service and widen the timespan to `1d`:

<Image img={step_7} alt="Step 7" size="lg"/>

The issue does not seem to infrastructure related - no metrics have appreciably changed over the time period: either before or after the error. Close the infrastructure tab.

### Explore a trace {#explore-a-trace}

In ClickStack, traces are also automatically correlated with both logs and metrics. Let's explore the trace linked to our selected log to identify the service responsible.

Select `Trace` to visualize the associated trace. Scrolling down through the subsequent view we can see how HyperDX is able to visualize the distributed trace across the microservices, connecting the spans in each service. A payment clearly involves multiple microservices, including those that performance checkout and currency conversions.

<Image img={step_8} alt="Step 8" size="lg"/>

By scrolling to the bottom of the view we can see that the `payment` service is causing the error, which in turn propagates back up the call chain. 

<Image img={step_9} alt="Step 9" size="lg"/>

### Searching traces {#searching-traces} 

We have established users are failing to complete purchases due to a cache issue in the payment service. Let's explore the traces for this service in more detail to see if we can learn more about the root cause.

Switch to the main Search view by selecting `Search`. Switch the data source for `Traces` and select the `Results table` view. **Ensure the timespan is still over the last day.**

<Image img={step_10} alt="Step 10" size="lg"/>

This view shows all traces in the last day. We know the issue originates in our payment service, so apply the `payment` filter to the `ServiceName`.

<Image img={step_11} alt="Step 11" size="lg"/>

If we apply event clustering to the traces by selecting `Event Patterns`, we can immediately see our cache issue with the `payment` service.

<Image img={step_12} alt="Step 12" size="lg"/>

### Explore infrastructure for a trace {#explore-infrastructure-for-a-trace}

Switch to the results view by clicking on `Results table`. Filter to errors using the `StatusCode` filter and `Error` value. 

<Image img={step_13} alt="Step 13" size="lg"/>

Select a `Error: Visa cache full: cannot add new item.` error, switch to the `Infrastructure` tab and widen the timespan to `1d`.

<Image img={step_14} alt="Step 14" size="lg"/>

By correlating traces with metrics we can see that memory and CPU increased with the `payment` service, before collapsing to `0` (we can attribute this to a pod restart) - suggesting the cache issue caused resource issues. We can expect this has impacted payment completion times.

### Event deltas for faster resolution {#event-deltas-for-faster-resolution} 

Event Deltas help surface anomalies by attributing changes in performance or error rates to specific subsets of data—making it easier to quickly pinpoint the root cause. 

While we know that the `payment` service has a cache issue, causing an increase in resource consumption, we haven't fully identified the root cause.

Return to the result table view and select the time period containing the errors to limit the data. Ensure you select several hours to the left of the errors and after if possible (the issue may still be occurring):

<Image img={step_15} alt="Step 15" size="lg"/>

Remove the errors filter and select `Event Deltas` from the left `Analysis Mode` menu.

<Image img={step_16} alt="Step 16" size="lg"/>

The top panel shows the distribution of timings, with colors indicating event density (number of spans). The subset of events outside of the main concentration are typically those worth investigating.

If we select the events with a duration greater than `200ms`, and apply the filter `Filter by selection`, we can limit our analysis to slower events:

<Image img={step_17} alt="Step 17" size="lg"/>

With analysis performed on the subset of data, we can see most performance spikes are associated with `visa` transactions.

### Using charts for more context {#using-charts-for-more-context}

In ClickStack, we can chart any numeric value from logs, traces, or metrics for greater context. 

We have established:

- Our issue resides with the payment service
- A cache is full
- This caused increases in resource consumption
- The issue prevented visa payments from completing - or at least causing them to take a long time to complete.

<br/>

Select `Chart Explorer` from the left menu. Complete the following values to chart the time taken for payments to complete by chart type:

- `Data Source`: `Traces`
- `Metric`: `Maximum`
- `SQL Column`: `Duration`
- `Where`: `ServiceName: payment`
- `Timespan`: `Last 1 day`

<br/>

Clicking `▶️` will show how the performance of payments degraded over time. 

<Image img={step_18} alt="Step 18" size="lg"/>

If we set `Group By` to `SpanAttributes['app.payment.card_type']` (just type `card` for autocomplete) we can see how the performance of the service degraded for Visa transactions relative to Mastercard:

<Image img={step_19} alt="Step 19" size="lg"/>

Note than once the error occurs responses return in `0s`.

### Exploring metrics more context {#exploring-metrics-for-more-context}

Finally, let's plot the cache size as a metric to see how it behaved over time, thus giving us more context.

Complete the following values:

- `Data Source`: `Metrics`
- `Metric`: `Maximum`
- `SQL Column`: `visa_validation_cache.size (gauge)` (just type `cache` for autocomplete)
- `Where`: `ServiceName: payment`
- `Group By`: `<empty>`

We can see how the cache size increased over a 4-5 hr period (likely after a software deployment) before reaching a maximum size of `100,000`. From the `Sample Matched Events` we can see our errors correlate with the cache reaching this limit and, after which it is recorded as having a size of `0` with responses also returning in `0s`.

<Image img={step_20} alt="Step 20" size="lg"/>

In summary, by exploring logs, traces and finally metrics we have concluded:

- Our issue resides with the payment service
- A change in service behavior, likely due to a deployment, resulted in a slow increase of a visa cache over a 4-5 hr period - reaching a maximum size of `100,000`.
- This caused increases in resource consumption as the cache grew in size - likely due to a poor implementation
- As the cache grew, the performance of Visa payments degraded
- On reaching the maximum size, the cache rejected payments and reported itself as size `0`.

### Using sessions {#using-sessions} 

Sessions allow us to replay the user experience, offering a visual account of how an error occurred from the user's perspective. While not typically used to diagnose root causes, they are valuable for confirming issues reported to customer support and can serve as a starting point for deeper investigation.

In HyperDX, sessions are linked to traces and logs, providing a complete view of the underlying cause.

For example, if the support team provides the email of a user who encountered a payment issue `Braulio.Roberts23@hotmail.com` - it's often more effective to begin with their session rather than directly searching logs or traces.

Navigate to the `Client Sessions` tab from the left menu before ensuring the data source is set to `Sessions` and the time period is set to the `Last 1 day`:

<Image img={step_21} alt="Step 21" size="lg"/>

Search for `SpanAttributes.userEmail: Braulio` to find our customer's session. Selecting the session will show the browser events and associated spans for the customer's session on the left, with the user's browser experience re-rendered to the right:

<Image img={step_22} alt="Step 22" size="lg"/>

### Replaying sessions {#replaying-sessions} 

Sessions can be replayed by pressing the ▶️ button. Switching between `Highlighted` and `All Events` allows varying degrees of span granularity, with the former highlighting key events and errors. 

If we scroll to the bottom of the spans we can see a `500` error associated with `/api/checkout`. Selecting the ▶️ button for this specific span moves the replay to this point in the session, allowing us to confirm the customer's experience - payment seems to simply not work with no error rendered.

<Image img={step_23} alt="Step 23" size="lg"/>

Selecting the span we can confirm this was caused by an internal error. By clicking the `Trace` tab and scrolling though the connected spans, we are able to confirm the customer indeed was a victim of our cache issue.

<Image img={step_24} alt="Step 24" size="lg"/>

</VerticalStepper>

This demo walks through a real-world incident involving failed payments in an e-commerce app, showing how ClickStack helps uncover root causes through unified logs, traces, metrics, and session replays - explore our [other getting started guides](/use-cases/observability/clickstack/sample-datasets) to dive deeper into specific features.
