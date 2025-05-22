---
slug: /use-cases/observability/clickstack/sending-data
title: 'Sending data'
sidebar_label: 'Sending data'
pagination_prev: null
pagination_next: null
description: 'Sending data to ClickStack'
---

All data is ingested into ClickStack via the **OpenTelemetry Collector**, which acts as the primary entry point for logs, metrics, traces, and session data.

ClickStack relies on the OpenTelemetry standard to receive and normalize telemetry data. The OpenTelemetry Collector is included in most ClickStack distributions, including:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

If you're using the [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) distribution, you are responsible for delivering data into ClickHouse yourself. This can be done by:

- Running your own OpenTelemetry Collector and pointing it at ClickHouse
- Sending directly to ClickHouse using alternative tooling (e.g., [Vector](https://vector.dev/), Fluentd, etc.)

:::note We recommend using the OpenTelemetry Collector
This allows users to benefit from standardized ingestion, enforced schemas, and out-of-the-box compatibility with the HyperDX UI. Using the default schema enables automatic source detection and preconfigured column mappings.
:::

## OpenTelemetry Endpoints {#opentelemetry-endpoints}

To send data to ClickStack, point your OpenTelemetry instrumentation to the following endpoints made available by the OpenTelemetry collector:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

### Example {#example}

Set the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable in your application:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

This configuration applies to most language SDKs and telemetry libraries that support OpenTelemetry.

For advanced configuration—including batching, retries, and transformation—refer to the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/).


