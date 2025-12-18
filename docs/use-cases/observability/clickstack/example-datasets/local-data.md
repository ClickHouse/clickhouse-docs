---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: 'Local Logs & Metrics'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack local and system data and metrics'
doc_type: 'guide'
keywords: ['clickstack', 'example data', 'sample dataset', 'logs', 'observability']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';

This getting started guide allows you to collect local logs and metrics from your system, sending them to ClickStack for visualization and analysis.

**This example works on OSX and Linux systems only**

:::note HyperDX in ClickHouse Cloud
This sample dataset can also be used with HyperDX in ClickHouse Cloud, with only minor adjustments to the flow as noted. If using HyperDX in ClickHouse Cloud, you will require an OpenTelemetry collector to be running locally as described in the [getting started guide for this deployment model](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>

## Create a custom OpenTelemetry configuration {#create-otel-configuration}

Create a `custom-local-config.yaml` file with the following content:

```yaml
receivers:
  filelog:
    include:
      - /host/var/log/**/*.log        # Linux logs from host
      - /host/var/log/syslog
      - /host/var/log/messages
      - /host/private/var/log/*.log   # macOS logs from host
    start_at: beginning
    resource:
      service.name: "system-logs"

  hostmetrics:
    collection_interval: 1s
    scrapers:
      cpu:
        metrics:
          system.cpu.time:
            enabled: true
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.usage:
            enabled: true
          system.memory.utilization:
            enabled: true
      filesystem:
        metrics:
          system.filesystem.usage:
            enabled: true
          system.filesystem.utilization:
            enabled: true
      paging:
        metrics:
          system.paging.usage:
            enabled: true
          system.paging.utilization:
            enabled: true
          system.paging.faults:
            enabled: true
      disk:
      load:
      network:
      processes:

service:
  pipelines:
    logs/local:
      receivers: [filelog]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

This configuration collects system logs and metrics for OSX and Linux systems, sending the results to ClickStack. The configuration extends the ClickStack collector by adding new receivers and pipelines—you reference the existing `clickhouse` exporter and processors (`memory_limiter`, `batch`) that are already configured in the base ClickStack collector.

:::note Ingestion timestamps
This configuration adjusts timestamps at ingest, assigning an updated time value to each event. You should ideally [preprocess or parse timestamps](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) using OTel processors or operators in their log files to ensure accurate event time is retained.

With this example setup, if the receiver or file processor is configured to start at the beginning of the file, all existing log entries will be assigned the same adjusted timestamp - the time of processing rather than the original event time. Any new events appended to the file will receive timestamps approximating their actual generation time.

To avoid this behavior, you can set the start position to `end` in the receiver configuration. This ensures only new entries are ingested and timestamped near their true arrival time.
:::

For more details on the OpenTelemetry (OTel) configuration structure, we recommend [the official guide](https://opentelemetry.io/docs/collector/configuration/).

## Start ClickStack with custom configuration {#start-clickstack}

Run the following docker command to start the all-in-one container with your custom configuration:

```shell
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  clickhouse/clickstack-all-in-one:latest
```

:::note Root user
We run the collector as the root user to access all system logs—this is necessary to capture logs from protected paths on Linux-based systems. However, this approach is not recommended for production. In production environments, the OpenTelemetry Collector should be deployed as a local agent with only the minimal permissions required to access the intended log sources.

Note that we mount the host's `/var/log` to `/host/var/log` inside the container to avoid conflicts with the container's own log files.
:::

If using HyperDX in ClickHouse Cloud with a standalone collector, use this command instead:

```shell
docker run -d \
  -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  clickhouse/clickstack-otel-collector:latest
```

The collector will immediately begin collecting local system logs and metrics.

## Navigate to the HyperDX UI {#navigate-to-the-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI if deploying locally. If using HyperDX in ClickHouse Cloud, select your service and `HyperDX` from the left menu.

## Explore system logs {#explore-system-logs}

The search UI should be populated with local system logs. Expand the filters to select the `system.log`:

<Image img={hyperdx_20} alt="HyperDX Local logs" size="lg"/>

## Explore system metrics {#explore-system-metrics}

We can explore our metrics using charts.

Navigate to the Chart Explorer via the left menu. Select the source `Metrics` and `Maximum` as the aggregation type. 

For the `Select a Metric` menu simply type `memory` before selecting `system.memory.utilization (Gauge)`.

Press the run button to visualize your memory utilization over time.

<Image img={hyperdx_21} alt="Memory over time" size="lg"/>

Note the number is returned as a floating point `%`. To render it more clearly, select `Set number format`. 

<Image img={hyperdx_22} alt="Number format" size="lg"/>

From the subsequent menu you can select `Percentage` from the `Output format` drop down before clicking `Apply`.

<Image img={hyperdx_23} alt="Memory % of time" size="lg"/>

</VerticalStepper>