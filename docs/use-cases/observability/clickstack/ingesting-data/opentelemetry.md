---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'Data ingestion with OpenTelemetry for ClickStack - The ClickHouse Observability Stack'
title: 'Ingesting with OpenTelemetry'
---

All data is ingested into ClickStack via an **OpenTelemetry (OTel) collector** instance, which acts as the primary entry point for logs, metrics, traces, and session data. We recommend using the official [ClickStack distribution](#installing) of the collector for this instance.

Users send data to this collector from [language SDKs](/use-cases/observability/clickstack/sdks) or through intermediate OpenTelemetry collector acting as [agents](#collector-roles) over OTLP e.g. collecting infrastructure metrics and logs.

## Sending OpenTelemetry data {#sending-otel-data}

To send data to ClickStack, point your OpenTelemetry instrumentation to the following endpoints made available by the OpenTelemetry collector:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

For most [language SDKs](/use-cases/observability/clickstack/sdks) and telemetry libraries that support OpenTelemetry, users can simply set `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable in your application:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

If deploying collectors in the agent role, they can use the OTLP exporter. An example  agent config consuming this [structured log file](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz), is shown below.


```yaml
# clickhouse-agent-config.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
 
  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```




## Installing ClickStack OTel collector {#installing}

The OpenTelemetry Collector is included in most ClickStack distributions, including:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

For details on configuring the collector in these distributions see ["Configuring the collector"](#configuring-the-collector).

### Standalone {#standalone}

The ClickStack OTel collector can also be deployed standalone independent of other components of the stack.

If you're using the [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) distribution, you are responsible for delivering data into ClickHouse yourself. This can be done by:

- Running your own OpenTelemetry Collector and pointing it at ClickHouse - see below.
- Sending directly to ClickHouse using alternative tooling, such as [Vector](https://vector.dev/), [Fluend](https://www.fluentd.org/) etc, or even the default [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib).

:::note We recommend using the ClickStack OpenTelemetry Collector
This allows users to benefit from standardized ingestion, enforced schemas, and out-of-the-box compatibility with the HyperDX UI. Using the default schema enables automatic source detection and preconfigured column mappings.
:::

To deploy the connector run the following docker command:


```bash
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 hyperdx/hyperdx-otel-collector:2-nightly

```

Note that we can overwrite the target ClickHouse instance with environment variables for `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME` and `CLICKHOUSE_PASSWORD`. See ["Configuring the collector"](#configuring-the-collector) for details on modifying the configuration further.

Users should use a user with the [appropriate credentials](#creating-a-user) in production.
