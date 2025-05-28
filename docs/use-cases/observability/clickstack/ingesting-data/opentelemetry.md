---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'Data ingestion with OpenTelemetry for ClickStack - The ClickHouse Observability Stack'
title: 'Ingesting with OpenTelemetry'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

All data is ingested into ClickStack via an **OpenTelemetry (OTel) collector** instance, which acts as the primary entry point for logs, metrics, traces, and session data. We recommend using the official [ClickStack distribution](#installing-otel-collector) of the collector for this instance.

Users send data to this collector from [language SDKs](/use-cases/observability/clickstack/sdks) or through data collection agents collecting infrastructure metrics and logs (such OTel collectors in an [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) role or other technologies e.g. [Fluentd](https://www.fluentd.org/) or [Vector](https://vector.dev/)).

## Installing ClickStack OpenTelemetry collector {#installing-otel-collector}

The ClickStack OpenTelemetry collector is included in most ClickStack distributions, including:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### Standalone {#standalone}

The ClickStack OTel collector can also be deployed standalone, independent of other components of the stack.

If you're using the [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) distribution, you are responsible for delivering data into ClickHouse yourself. This can be done by:

- Running your own OpenTelemetry collector and pointing it at ClickHouse - see below.
- Sending directly to ClickHouse using alternative tooling, such as [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) etc, or even the default [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib).

:::note We recommend using the ClickStack OpenTelemetry collector
This allows users to benefit from standardized ingestion, enforced schemas, and out-of-the-box compatibility with the HyperDX UI. Using the default schema enables automatic source detection and preconfigured column mappings.
:::

To deploy the connector run the following docker command:

```bash
docker run -e OPAMP_SERVER_URL=${HYPERDX_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector:2-nightly

```

Note that we can overwrite the target ClickHouse instance with environment variables for `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USERNAME`, and `CLICKHOUSE_PASSWORD`. **These environment variables can be used with any of the docker distributions which include the connector.**

The `OPAMP_SERVER_URL` variable should point to your HyperDX deployment so it can communicate with the OpAMP (Open Agent Management Protocol) endpoint at `/v1/opamp` e.g. `http://localhost:8080`. This ensures the collectors OTLP interface is secured with the ingestion API key..

Users should use a user with the [appropriate credentials](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) in production.

## Sending OpenTelemetry data {#sending-otel-data}

To send data to ClickStack, point your OpenTelemetry instrumentation to the following endpoints made available by the OpenTelemetry collector:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

For most [language SDKs](/use-cases/observability/clickstack/sdks) and telemetry libraries that support OpenTelemetry, users can simply set `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable in your application:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

In addition, an authorization header containing the API ingestion key is required.  You can find the key in the HyperDX app under `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>


For language SDKs, this can either be set by an `init` function or via an`OTEL_EXPORTER_OTLP_HEADERS` environment variable:

```bash
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Agents should likewise include this authorization header in any OTLP communication. For example, if deploying a [contrib distribution of the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) in the agent role, they can use the OTLP exporter. An example agent config consuming this [structured log file](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz), is shown below. Note the need to specify an authorization key - see `<YOUR_API_INGESTION_KEY>`.


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
