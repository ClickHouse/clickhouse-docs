---
slug: /use-cases/observability/clickstack/getting-started/telemetrygen
title: 'Generate synthetic OpenTelemetry data with telemetrygen'
sidebar_label: 'Synthetic data with telemetrygen'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'Use telemetrygen to send diverse synthetic logs, traces and metrics to a ClickStack OpenTelemetry collector'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'telemetrygen', 'synthetic data', 'OpenTelemetry', 'test', 'logs', 'traces', 'metrics', 'observability']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) is the OpenTelemetry Collector Contrib data generator. It emits synthetic OTLP logs, traces and metrics, and exposes flags that let you shape the data: multiple services, log severities, span statuses and child spans, and different metric types. Use it to confirm that a ClickStack OpenTelemetry collector is accepting data and that varied, realistic events surface in the ClickStack UI.

This guide assumes the collector is already running with OTLP endpoints on `4317` (gRPC) and `4318` (HTTP).

<Tabs groupId="sample-logs">
<TabItem value="managed-clickstack" label="Managed ClickStack" default>

<VerticalStepper headerLevel="h3">

### Prerequisites {#prerequisites-managed}

This guide assumes you have completed the [Getting Started Guide for Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud) and have an OpenTelemetry collector running with the OTLP gRPC (`4317`) and HTTP (`4318`) endpoints reachable from the machine you run `telemetrygen` on. If you [secured the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) with an `OTLP_AUTH_TOKEN`, keep that value handy.

### Install telemetrygen {#install-telemetrygen-managed}

Run `telemetrygen` from its Docker image (no install required). Define a small wrapper so the commands below stay readable; `--add-host` lets the container reach a collector listening on the host:

```shell
telemetrygen() {
  docker run --rm --add-host=host.docker.internal:host-gateway \
    ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:latest "$@"
}
export OTEL_ENDPOINT=host.docker.internal:4317
```

Or install the binary with Go and target `localhost` instead:

```shell
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
export OTEL_ENDPOINT=localhost:4317
```

### Set environment variables {#set-env-vars-managed}

Export the auth token if the collector is secured:

```shell
export OTLP_AUTH_TOKEN=<your_otlp_auth_token>
```

:::note[Unsecured collector]
The ClickStack OpenTelemetry collector is unauthenticated by default. If you haven't followed [Securing the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) to set an `OTLP_AUTH_TOKEN`, drop the `--otlp-header` flag from the commands below.
:::

### Generate logs {#generate-logs-managed}

Send logs from two services with different severities, bodies, and attributes, so the `Search` view has both informational and error events to filter on:

```shell
telemetrygen logs \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service checkout --rate 5 --duration 30s \
  --severity-text Info --severity-number 9 --body "checkout completed" \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.method="POST"'

telemetrygen logs \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service payment --rate 5 --duration 30s \
  --severity-text Error --severity-number 17 --body "payment gateway timeout" \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.status_code="500"'
```

The most useful log flags:

- `--service` sets `service.name` so events are attributable to a service.
- `--severity-text` and `--severity-number` set the level (`severity-number` ranges from 1 to 24).
- `--body` sets the log message.
- `--otlp-attributes` sets resource-level attributes (`key="value"`, `key=true`, or `key=<integer>`).
- `--telemetry-attributes` sets per-record attributes.

### Generate traces {#generate-traces-managed}

Send multi-span traces, one healthy service and one returning errors. The child spans and error status populate the Service Map and the error views:

```shell
telemetrygen traces \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service checkout --rate 5 --duration 30s --workers 2 \
  --child-spans 4 --span-duration 120ms --span-links 1 --status-code Ok \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.route="/cart"'

telemetrygen traces \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service payment --rate 5 --duration 30s \
  --child-spans 3 --span-duration 400ms --status-code Error \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.route="/charge"'
```

The most useful trace flags:

- `--child-spans` generates that many child spans per trace, giving each trace real depth.
- `--span-duration` sets how long each span lasts (for example `120ms`, `2s`).
- `--status-code` is one of `Unset`, `Error`, `Ok` (or `0`, `1`, `2`). Use `Error` to exercise error views.
- `--span-links` adds links between spans.
- `--workers` runs several generators in parallel for a higher, more varied volume.

### Generate metrics {#generate-metrics-managed}

Send the three common metric types so dashboards have counters, gauges, and a distribution. Unlike some generators, `telemetrygen` honors `--duration` for metrics, so no manual stop is needed:

```shell
telemetrygen metrics --metric-type Sum \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service checkout --otlp-metric-name http.server.requests \
  --aggregation-temporality cumulative --rate 5 --duration 30s

telemetrygen metrics --metric-type Gauge \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service checkout --otlp-metric-name system.memory.usage \
  --rate 5 --duration 30s

telemetrygen metrics --metric-type Histogram \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${OTLP_AUTH_TOKEN}\"" \
  --service payment --otlp-metric-name http.server.duration \
  --rate 5 --duration 30s
```

`--metric-type` accepts `Gauge`, `Sum`, `Histogram`, or `ExponentialHistogram`. `--otlp-metric-name` names the series so you can find it in the UI, and `--aggregation-temporality` is `delta` or `cumulative`.

### Verify in ClickStack {#verify-managed}

Open the ClickStack UI from the ClickHouse Cloud console. In the `Search` view, set the time range to `Last 15 minutes` and switch the source between `Logs` and `Traces`. Filter on `ServiceName` to see the `checkout` and `payment` services, and on `SeverityText` to find the `Error` log line. Open a `payment` trace to see the child spans and the error status. Open the `Chart Explorer`, select `Metrics`, and chart one of the metric names you set above (for example `http.server.requests`) to verify metrics ingestion.

</VerticalStepper>

</TabItem>
<TabItem value="oss-clickstack" label="ClickStack Open Source">

<VerticalStepper headerLevel="h3">

### Prerequisites {#prerequisites-oss}

This guide assumes you have started Open Source ClickStack using the [instructions for the all-in-one image](/use-cases/observability/clickstack/getting-started/oss), and that the OTLP endpoints (`4317` gRPC and `4318` HTTP) are reachable. You also need the ingestion API key from the HyperDX UI under `Team Settings > API Keys`.

### Install telemetrygen {#install-telemetrygen-oss}

Run `telemetrygen` from its Docker image (no install required). Define a small wrapper so the commands below stay readable; `--add-host` lets the container reach a collector listening on the host:

```shell
telemetrygen() {
  docker run --rm --add-host=host.docker.internal:host-gateway \
    ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:latest "$@"
}
export OTEL_ENDPOINT=host.docker.internal:4317
```

Or install the binary with Go and target `localhost` instead:

```shell
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
export OTEL_ENDPOINT=localhost:4317
```

### Set environment variables {#set-env-vars-oss}

Export the ingestion API key:

```shell
export CLICKSTACK_API_KEY=<your_ingestion_api_key>
```

### Generate logs {#generate-logs-oss}

Send logs from two services with different severities, bodies, and attributes:

```shell
telemetrygen logs \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service checkout --rate 5 --duration 30s \
  --severity-text Info --severity-number 9 --body "checkout completed" \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.method="POST"'

telemetrygen logs \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service payment --rate 5 --duration 30s \
  --severity-text Error --severity-number 17 --body "payment gateway timeout" \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.status_code="500"'
```

### Generate traces {#generate-traces-oss}

Send multi-span traces, one healthy service and one returning errors:

```shell
telemetrygen traces \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service checkout --rate 5 --duration 30s --workers 2 \
  --child-spans 4 --span-duration 120ms --span-links 1 --status-code Ok \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.route="/cart"'

telemetrygen traces \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service payment --rate 5 --duration 30s \
  --child-spans 3 --span-duration 400ms --status-code Error \
  --otlp-attributes 'deployment.environment="production"' \
  --telemetry-attributes 'http.route="/charge"'
```

### Generate metrics {#generate-metrics-oss}

Send the three common metric types:

```shell
telemetrygen metrics --metric-type Sum \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service checkout --otlp-metric-name http.server.requests \
  --aggregation-temporality cumulative --rate 5 --duration 30s

telemetrygen metrics --metric-type Gauge \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service checkout --otlp-metric-name system.memory.usage \
  --rate 5 --duration 30s

telemetrygen metrics --metric-type Histogram \
  --otlp-endpoint ${OTEL_ENDPOINT} --otlp-insecure \
  --otlp-header "authorization=\"${CLICKSTACK_API_KEY}\"" \
  --service payment --otlp-metric-name http.server.duration \
  --rate 5 --duration 30s
```

`--metric-type` accepts `Gauge`, `Sum`, `Histogram`, or `ExponentialHistogram`.

### Verify in ClickStack {#verify-oss}

Visit [http://localhost:8080](http://localhost:8080) to open the ClickStack UI. In the `Search` view, set the time range to `Last 15 minutes` and switch the source between `Logs` and `Traces`. Filter on `ServiceName` to see the `checkout` and `payment` services, and on `SeverityText` to find the `Error` log line. Open a `payment` trace to see the child spans and the error status. Open the `Chart Explorer`, select `Metrics`, and chart one of the metric names you set above (for example `http.server.requests`) to verify metrics ingestion.

</VerticalStepper>

</TabItem>
</Tabs>
