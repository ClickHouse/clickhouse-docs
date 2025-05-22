---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'Sample Logs, Traces and Metrics'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack and a sample dataset with logs, sessions, traces and metrics'
---
import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_5 from '@site/static/images/use-cases/observability/hyperdx-5.png';
import hyperdx_6 from '@site/static/images/use-cases/observability/hyperdx-6.png';
import hyperdx_7 from '@site/static/images/use-cases/observability/hyperdx-7.png';
import hyperdx_8 from '@site/static/images/use-cases/observability/hyperdx-8.png';
import hyperdx_9 from '@site/static/images/use-cases/observability/hyperdx-9.png';
import hyperdx_10 from '@site/static/images/use-cases/observability/hyperdx-10.png';
import hyperdx_11 from '@site/static/images/use-cases/observability/hyperdx-11.png';
import hyperdx_12 from '@site/static/images/use-cases/observability/hyperdx-12.png';
import hyperdx_13 from '@site/static/images/use-cases/observability/hyperdx-13.png';
import hyperdx_14 from '@site/static/images/use-cases/observability/hyperdx-14.png';
import hyperdx_15 from '@site/static/images/use-cases/observability/hyperdx-15.png';
import hyperdx_16 from '@site/static/images/use-cases/observability/hyperdx-16.png';
import hyperdx_17 from '@site/static/images/use-cases/observability/hyperdx-17.png';
import hyperdx_18 from '@site/static/images/use-cases/observability/hyperdx-18.png';
import hyperdx_19 from '@site/static/images/use-cases/observability/hyperdx-19.png';

# ClickStack - Sample logs, traces and metrics {#clickstack-sample-dataset}

The following example assumes you have started ClickStack using the [instructions for the all-in-one image](/use-cases/observability/clickstack/getting-started) and connected to the [local ClickHouse instance](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) or a [ClickHouse Cloud instance](/use-cases/observability/clickstack/getting-started#complete-cloud-connection-details) and created the `Logs` source.

<VerticalStepper>

## Navigate to the HyperDX UI {#navigate-to-the-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## Download sample data {#download-sample-data}

In order to populate the UI with sample data, download the following file:

[Sample data](https://storage.googleapis.com/hyperdx/sample.tar.gz)

```bash
# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# or
# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

This file contains example logs, metrics and traces from our public [OpenTelemetry demo](http://example.com) - a simple ecommerce store with microservices. Copy this file to a directory of your choosing.

## Load sample data {#load-sample-data}

To load this data, we simply send it to the HTTP endpoint of the deployed OTel collector:

```bash
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    curl -s -o /dev/null -X POST "$endpoint" -H "Content-Type: application/json" --data "$line"
  done
done
```

This simulates OLTP log, trace, and metric sources sending data to the OTel collector. In production, these sources may be language clients or even other OTel collectors.

You should see data has started to load, with logs shown in the `Search` view:

<Image img={hyperdx_10} alt="HyperDX search" size="lg"/>

Data loading will take a few minutes. Allow for the load to complete before progressing to the next steps.

## Create a metric source {#create-a-metric-source}

By default, the `Logs` source will be pre-created. 

Create a metrics source by clicking the `Logs` source, followed by `Create New Source`.

<Image img={hyperdx_3} alt="Source dropdown" size="sm"/>

Select `OTEL Metrics` for the `Source Data Type`. Complete the form with the following details before selecting `Save New Source`:

- `Name` : `Metrics`
- `Server Connection`: `Default`
- `Database`: `Default`
- `Gauge Table`: `otel_metrics_guage`
- `Histogram Table`: `otel_metrics_histogram`
- `Sum Table`: `otel_metrics_sum`
- `Correlated Log Source`: `Logs`

<Image img={hyperdx_4} alt="Metrics Source" size="md"/>

## Create a traces source {#create-a-traces-source}

Create a new source using the steps described for the `Metrics` source.

Select `Trace` for the `Source Data Type`. Complete the following fields, leaving the default and automatically inferred values if not specified before clicking `Save New Source`:

- `Name`: `Traces`
- `Table`: `otel_traces`
- `Correlated Log Source`: `Logs`
- `Correlated Metric Source` : `Metrics`

<Image img={hyperdx_5} alt="Trace source" size="md"/>

## Create a sessions source {#create-a-sessions-source}

Create a new source using the steps described for the `Metrics` source.

Select `Sessions` for the `Source Data Type`. Complete the following fields, leaving the default and automatically inferred values if not specified before clicking `Save New Source`:

- `Name`: `Sessions`
- `Table`: `hyperdx_sessions`
- `Correlated Trace Source`: `Traces`

<Image img={hyperdx_6} alt="Sessions source" size="md"/>

## Correlate sources {#correlate-sources}

Correlating sources allows HyperDX to link logs, traces, metrics, and sessions - enabling rich context when navigating incidents and debugging issues.

Select the `Traces` source from the source drop-down, followed by the edit button.

<Image img={hyperdx_7} alt="Edit source" size="sm"/>

Complete the `Correlated Session Source` field with the value `Sessions` before clicking `Save Source`.

<Image img={hyperdx_8} alt="Traces Source update" size="md"/>

Select the `Logs` source from the source drop-down, followed by the edit button.

Select `Configure Optional Fields` and complete the `Correlated Metric Source` and `Correlated Trace Source` with the value `Metrics` and `Traces` respectively.

<Image img={hyperdx_9} alt="Correlated logs" size="md"/>

## Explore sessions {#explore-sessions}

Suppose we have reports that our users are experiencing issues paying for goods. We can view their experience using HyperDX's session replay capabilities. 

Select [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572) from the left menu.

<Image img={hyperdx_11} alt="Sessions" size="lg"/>

This view allows us to see frontend sessions for our e-commerce store. Sessions remain Anonymous until users check out and try to complete a purchase.

Note that some sessions with emails have an associated error, potentially confirming reports of failed transactions.

Select a trace with a failure and associated email. The subsequent view allows us to replay the user's session and review their issue. Press play to watch the session.

<Image img={hyperdx_12} alt="Session replay" size="lg"/>

The replay shows the user navigating the site, adding items to their cart. Feel free to skip to later in the session where they attempt to complete a payment.

:::tip
Any errors are annotated on the timeline in red. 
:::

The user was unable to place the order, with no obvious error. Scroll to the bottom of the left panel, containing the network and console events from the user's browser. You will notice a 500 error was thrown on making a `/api/checkout` call. 

<Image img={hyperdx_13} alt="Error in session" size="lg"/>


Select this `500` error. Niether the `Overview` or `Column Values` indicate the source of the issue, other than the fact the error is unexpected causing an `Internal Error`.

## Explore traces {#explore-traces}

Navigate to the `Trace` tab to see the full distributed trace. 

<Image img={hyperdx_14} alt="Session trace" size="lg"/>

Scroll down the trace to see the origin of the error - the `checkout` service span. Select the `Payment` service span. 

<Image img={hyperdx_15} alt="Span" size="lg"/>

Select the tab `Column Values` and scroll down. We can see the issue is associated with a cache being full.

<Image img={hyperdx_16} alt="Column values" size="lg"/>

Scrolling up and returning to the trace, we can see logs are correlated with the span, thanks to our earlier configuration. These provide further context.

<Image img={hyperdx_17} alt="Correlated log" size="lg"/>

We've established that a cache is filling in the Payment service which is preventing payments from completing. 

## Explore logs {#explore-logs}

For further details, we can return to the [`Search` view](http://localhost:8080/search):

Select `Logs` from the sources and apply a filter to the `payment` Service.

<Image img={hyperdx_18} alt="Logs" size="lg"/>

We can see that while the issue is recent, the number of impacted payments is high. Furthermore, a cache related to the visa payments appears to be causing issues.

## Chart metrics {#chart-metrics}

While an error has clearly been introduced in the code, we can use metrics to confirm the cache size. Navigate to the `Chart Explorer` view.

Select `Metrics` as the data source. Complete the chart builder to plot the `Maximum` of `visa_validation_cache.size (Gauge)`. The cache was clearly increasing before reaching a maximum size, after which errors were generated.

<Image img={hyperdx_19} alt="Metrics" size="lg"/>

</VerticalStepper>
