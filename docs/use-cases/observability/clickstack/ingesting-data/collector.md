---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'Open Telemetry Collector for ClickStack - The ClickHouse Observability Stack'
sidebar_label: 'OTel Collector'
title: 'ClickStack OTel Collector'
---

All data is ingested into ClickStack via the **OpenTelemetry Collector**, which acts as the primary entry point for logs, metrics, traces, and session data. 

Users can send data to these endpoints either directly from [language SDKs](/use-cases/observability/clickstack/sdks) or through intermediate OpenTelemetry collector acting as agents over OTLP e.g. collecting infrastructure metrics and logs.


## Installing {#installing}

The OpenTelemetry Collector is included in most ClickStack distributions, including:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

If you're using the [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) distribution, you are responsible for delivering data into ClickHouse yourself. This can be done by:

- Running your own OpenTelemetry Collector and pointing it at ClickHouse - see [Standalone](#standalone).
- Sending directly to ClickHouse using alternative tooling (e.g., [Vector](https://vector.dev/), Fluentd, etc.)

:::note We recommend using the OpenTelemetry Collector
This allows users to benefit from standardized ingestion, enforced schemas, and out-of-the-box compatibility with the HyperDX UI. Using the default schema enables automatic source detection and preconfigured column mappings.
:::

### Standalone {#standalone}


## Creating a ClickHouse user {#creating-a-user}




## Sending data to OpenTelemetry Endpoints {#opentelemetry-endpoints}

To send data to ClickStack, point your OpenTelemetry instrumentation to the following endpoints made available by the OpenTelemetry collector:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

### Example {#example}

Set the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable in your application:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

This configuration applies to most [language SDKs](/use-cases/observability/clickstack/sdks) and telemetry libraries that support OpenTelemetry.


## Securing the collector {#securing-the-collector}

SSL collector, use a key - RUM


## Processing - filtering, transforming and enriching {#processing-filtering-transforming-enriching}



### Example {#example-processing}


For more advanced configuration we suggest the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/).

## Optimizing inserts {#optimizing-inserts}



## Scaling {#scaling}


## Estimating resources {#estimating-resources}
