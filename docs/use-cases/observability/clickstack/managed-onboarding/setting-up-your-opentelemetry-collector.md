---
slug: /use-cases/observability/clickstack/setting-up-your-opentelemetry-collector
title: 'Setting up your OpenTelemetry Collector'
description: 'Setting up an OpenTelemetry Collector for Managed ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'collector', 'managed', 'observability', 'gateway', 'otelgen']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GatherCredentials from '@site/docs/use-cases/observability/clickstack/managed-onboarding/_snippets/_gather_credentials.md';
import CreateIngestionUser from '@site/docs/use-cases/observability/clickstack/managed-onboarding/_snippets/_create_ingestion_user.md';
import ConfirmInUI from '@site/docs/use-cases/observability/clickstack/managed-onboarding/_snippets/_confirm_in_ui.md';

This guide walks you through deploying an OpenTelemetry collector against an existing Managed ClickStack service, or adapting your existing collector, before verifying that data is flowing through.

The collector runs as a **gateway**: a single OTLP endpoint that your applications, SDKs, and agent collectors send to. The gateway batches events, applies any processing you've configured, and writes them to ClickHouse via the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). This pattern keeps collection logic out of your application code and lets you scale ingestion independently of the workloads producing data. For background on gateway versus agent roles, see [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles).

:::note Existing collector
If you're using an existing OpenTelemetry collector, we assume it's already configured in a **gateway** role. We don't recommend using this process for reconfiguring collectors in the **agent** role.
:::

Pick the tab that matches your situation:

<Tabs groupId="otel-collector-setup">

<TabItem value="new-collector" label="I don't have a collector" default>

<VerticalStepper headerLevel="h2">

## Gather your credentials {#gather-credentials}

<GatherCredentials />

## Create an ingestion user {#create-ingestion-user}

<CreateIngestionUser />

## Deploy the collector {#deploy-the-collector}

Deploy the **ClickStack distribution of the OpenTelemetry collector**, which is preconfigured for Managed ClickStack. In the example below, we run the collector locally and generate artificial telemetry from the same machine for simplicity.

:::note
In production, you would typically deploy the collector in a Kubernetes cluster, or on a virtual machine that can be reached by your OpenTelemetry SDKs, agents, and other collectors. This allows telemetry from across your environment to be centrally collected and forwarded to ClickStack.
:::

Pick a shared secret to authenticate clients sending data to the collector, then export it alongside your connection details and chosen password for the `hyperdx_ingest` user:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
export CLICKHOUSE_USER=hyperdx_ingest
export CLICKHOUSE_PASSWORD=ClickH0u3eRocks123!
export OTLP_AUTH_TOKEN="a-strong-shared-secret"
```

Run the ClickStack OTel collector:

```shell
docker run -d \
  -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -e HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel \
  -p 4317:4317 \
  -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

The collector now exposes OTLP gRPC on `4317` and OTLP HTTP on `4318`. Applications, SDKs, and agent collectors should send to these ports with `authorization: $OTLP_AUTH_TOKEN` in the request headers.

:::note[Production deployments]
For production, we recommend enabling TLS on the OTLP endpoint. See [Securing the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector).
:::

## Verify the endpoint {#verify-the-endpoint}

Generate some synthetic traffic against the collector to confirm the full pipeline works. We use [`otelgen`](https://github.com/krzko/otelgen), a small CLI that emits OTLP logs, traces, and metrics.

Install `otelgen` with Homebrew:

```shell
brew install krzko/tap/otelgen
```

Or with Go:

```shell
go install github.com/krzko/otelgen@latest
```

Send a short burst of logs to the collector:

```shell
 otelgen \
  --otel-exporter-otlp-endpoint localhost:4317 \
  --insecure \
  --protocol grpc \
  --header "authorization=${OTLP_AUTH_TOKEN}" \
  --rate 5 \
  --duration 60 \
  logs multi
```

For the equivalent trace and metrics commands, and a walkthrough of the other `otelgen` subcommands, see [Synthetic data with otelgen](/use-cases/observability/clickstack/getting-started/otelgen).

## Confirm in the ClickStack UI {#confirm-in-ui}

<ConfirmInUI />

</VerticalStepper>

</TabItem>

<TabItem value="existing-collector" label="I have a collector">

<VerticalStepper headerLevel="h2">

## Gather your credentials {#gather-credentials-existing}

<GatherCredentials />

## Create an ingestion user {#create-ingestion-user-existing}

<CreateIngestionUser />

## Adapt your collector configuration {#adapt-collector}

Extend your existing collector configuration to write to Managed ClickStack via the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

:::note ClickHouse exporter required
If you're using your own distribution, ensure it includes the ClickHouse exporter. The upstream [contrib image](https://github.com/open-telemetry/opentelemetry-collector-contrib) already does.
:::

Below is an example configuration that uses the ClickHouse exporter with the receivers, processors, and pipelines expected by the ClickStack UI. It matches the behaviour of the ClickStack distribution, including the Session Replay (`rrweb`) routing path. Substitute `<clickhouse_cloud_endpoint>` and `<your_password_here>` with the credentials for the `hyperdx_ingest` user created above:

```yaml
receivers:
  otlp/hyperdx:
    protocols:
      grpc:
        include_metadata: true
        endpoint: "0.0.0.0:4317"
      http:
        cors:
          allowed_origins: ["*"]
          allowed_headers: ["*"]
        include_metadata: true
        endpoint: "0.0.0.0:4318"

processors:
  batch:
  memory_limiter:
    # 80% of maximum memory up to 2G, adjust for low memory environments
    limit_mib: 1500
    # 25% of limit up to 2G, adjust for low memory environments
    spike_limit_mib: 512
    check_interval: 5s

connectors:
  routing/logs:
    default_pipelines: [logs/out-default]
    error_mode: ignore
    table:
      - context: log
        statement: route() where IsMatch(attributes["rr-web.event"], ".*")
        pipelines: [logs/out-rrweb]

exporters:
  clickhouse:
    database: otel
    endpoint: <clickhouse_cloud_endpoint>
    username: hyperdx_ingest
    password: <your_password_here>
    ttl: 720h
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
  clickhouse/rrweb:
    database: otel
    endpoint: <clickhouse_cloud_endpoint>
    username: hyperdx_ingest
    password: <your_password_here>
    ttl: 720h
    logs_table_name: hyperdx_sessions
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s

service:
  pipelines:
    traces:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/in:
      receivers: [otlp/hyperdx]
      exporters: [routing/logs]
    logs/out-default:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/out-rrweb:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse/rrweb]
```

A few things to note:

- The `otlp/hyperdx` receiver listens on both gRPC (`4317`) and HTTP (`4318`); applications and agents should target these ports on your collector host.
- The `clickhouse` exporter writes logs, traces, and metrics into the `otel` database, matching the layout the ClickStack UI expects. The `clickhouse/rrweb` exporter handles Session Replay events routed by the `routing/logs` connector into `otel.hyperdx_sessions`.
- Authentication on the OTLP receivers is left to your existing setup. Configure it via collector [extensions](https://opentelemetry.io/docs/collector/configuration/#extensions) (for example `bearertokenauth`) or a TLS-fronted reverse proxy if you need to require an ingestion token.

Reload your collector with the new configuration. Applications, SDKs, and agent collectors should then send to the OTLP endpoints exposed by your collector with whatever auth header your setup expects.

For further details on configuring OpenTelemetry collectors against Managed ClickStack, see [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).

## Verify the endpoint {#verify-the-endpoint-existing}

Generate some synthetic traffic against your collector to confirm the full pipeline works. We use [`otelgen`](https://github.com/krzko/otelgen), a small CLI that emits OTLP logs, traces, and metrics.

Install `otelgen` with Homebrew:

```shell
brew install krzko/tap/otelgen
```

Or with Go:

```shell
go install github.com/krzko/otelgen@latest
```

Send a short burst of logs to your collector. Substitute `<your-collector-host>` with the host your collector listens on, and set the `authorization` header (or alternative auth method) to whatever your collector expects:

```shell
 otelgen \
  --otel-exporter-otlp-endpoint <your-collector-host>:4317 \
  --insecure \
  --protocol grpc \
  --header "authorization=<your-auth-token>" \
  --rate 5 \
  --duration 60 \
  logs multi
```

For the equivalent trace and metrics commands, and a walkthrough of the other `otelgen` subcommands, see [Synthetic data with otelgen](/use-cases/observability/clickstack/getting-started/otelgen).

## Confirm in the ClickStack UI {#confirm-in-ui-existing}

<ConfirmInUI />

</VerticalStepper>

</TabItem>

</Tabs>

## Further reading {#further-reading}

This guide covers a single collector instance in its simplest form. The [OpenTelemetry collector reference](/use-cases/observability/clickstack/ingesting-data/otel-collector) covers what to do next:

- [Securing the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) with TLS on the OTLP endpoint and least-privilege ingestion users.
- [Processing, filtering, and enriching](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) events at the gateway.
- [Extending the collector configuration](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config) with custom receivers, processors, and pipelines.
- [Estimating resources](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources) for gateway and agent deployments at your expected throughput.
- [Going to production](/use-cases/observability/clickstack/production)
