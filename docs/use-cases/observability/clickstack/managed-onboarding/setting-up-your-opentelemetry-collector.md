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

import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

This guide walks you through deploying an OpenTelemetry (OTel) Collector against an existing Managed ClickStack service, then verifying that data is flowing through it.

The collector runs as a **gateway**: a single OTLP endpoint that your applications, SDKs, and agent collectors send to. The gateway batches events, applies any processing you've configured, and writes them to ClickHouse via the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). This pattern keeps collection logic out of your application code and lets you scale ingestion independently of the workloads producing data. For background on gateway versus agent roles, see [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles).

This guide assumes you've completed the [Getting started with Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) guide and have your connection credentials to hand.

<VerticalStepper headerLevel="h2">

## Gather your credentials {#gather-credentials}

You'll need:

- The HTTPS endpoint of your ClickHouse Cloud service, including protocol and port, for example `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`.
- A ClickHouse username and password for ingestion.

If you don't have these recorded, open your service in the [ClickHouse Cloud console](https://console.clickhouse.cloud) and select **Connect**. Record the url from the subsequent dialog. We will create a dedicated user for ingestion below.

<Image img={clickhouse_cloud_connection} size="lg" alt="Service connect panel showing HTTPS endpoint and password" border/>

## Create an ingestion user {#create-ingestion-user}

We recommend creating a dedicated user for the collector rather than reusing `default`. Connect to your service via the SQL console and run:

```sql
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

:::tip
Replace the password in the snippet above with a strong value
:::

The collector creates the schema for logs, traces, and metrics inside the `otel` database on first use. For more guidance on production user setup, see [Going to production](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed).

## Deploy the collector {#deploy-the-collector}

Deploy the collector somewhere that's accessible to the applications and infrastructure sending OpenTelemetry data. In the example below, we run the collector locally and generate artificial telemetry from the same machine for simplicity.

:::note info
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

Open your service in the [ClickHouse Cloud console](https://console.clickhouse.cloud) and select **ClickStack** from the left menu and then **Start Ingestion**.

<Image img={clickstack_cloud} size="lg" alt="Launch ClickStack" border/>

The next step can be skipped, as you’ve already configured your collector. Click **Launch ClickStack** to continue.

ClickStack will open in a new tab and you should be automatically directed to the **Getting Started** page. If not, select **Getting Started** from the left-hand menu, then click **Start Ingestion** followed by **Next**.

<Image img={clickstack_start_ingestion} size="lg" alt="ClickStack Start Ingestion" border/>

ClickStack should automatically detect your tables and telemetry data, allowing you to proceed. Select **Start Exploring** to begin exploring your trace data.

<Image img={clickstack_start_exploring} size="lg" alt="ClickStack Start Exploring" border/>

Switch the source to `Logs` and set the time range to **Last 15 minutes**. The synthetic logs from `otelgen` should appear within a few seconds.

<Image img={clickstack_search} size="lg" alt="ClickStack Search view with logs appearing"/>

If nothing shows up:

- Confirm the `OTLP_AUTH_TOKEN` value passed to `otelgen` matches the one set on the collector.
- Tail the collector logs with `docker logs -f <container-id>` and look for export errors.
- Verify the `CLICKHOUSE_ENDPOINT` includes both the protocol and port (`https://...:8443`).

## Further reading {#further-reading}

This guide covers a single collector instance in its simplest form. The [OpenTelemetry collector reference](/use-cases/observability/clickstack/ingesting-data/otel-collector) covers what to do next:

- [Securing the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) with TLS on the OTLP endpoint and least-privilege ingestion users.
- [Processing, filtering, and enriching](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) events at the gateway.
- [Extending the collector configuration](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config) with custom receivers, processors, and pipelines.
- [Estimating resources](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources) for gateway and agent deployments at your expected throughput.
- [Going to production](/use-cases/observability/clickstack/production) for recommendations when going to production.

</VerticalStepper>
