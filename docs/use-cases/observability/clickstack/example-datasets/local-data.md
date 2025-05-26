---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: 'Local Logs & Metrics'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack local and system data and metrics'
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';

This getting started guide allows you collect local logs and metrics from your system, sending them to ClickStack for visualization and analysis.

**This example works on OSX and Linux systems only**

The following example assumes you have started ClickStack using the [instructions for the all-in-one image](/use-cases/observability/clickstack/getting-started) and connected to the [local ClickHouse instance](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) or a [ClickHouse Cloud instance](/use-cases/observability/clickstack/getting-started#complete-cloud-connection-details) and created the `Logs` source.

<VerticalStepper>

## Navigate to the HyperDX UI {#navigate-to-the-hyperdx-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI and ensure you've connected to the local instance by accepting the default settings and clicking `Create`.

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## Create a local OpenTelemetry configuration {#create-otel-configuration}

Create a `otel-file-collector.yaml` file with the following content:

```yml
receivers:
  filelog:
    include:
      - /var/log/**/*.log             # Linux
      - /var/log/syslog
      - /var/log/messages
      - /private/var/log/*.log       # macOS
    start_at: beginning

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

exporters:
  otlp:
    endpoint: host.docker.internal:4317
    tls:
      insecure: true

service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [otlp]
    metrics:
      receivers: [hostmetrics]
      exporters: [otlp]
```

This configuration collects system logs and metric for OSX and Linux systems, sending the results to ClickStack via the OTLP endpoint on port 4317.

For more details on the OpenTelemetry (OTel) configuration structure, we recommend [the official guide](https://opentelemetry.io/docs/collector/configuration/).

## Start the collector {#start-the-collector}

Run the following docker command to start an instance of the OTel collector.

```bash
docker run --rm -it \
  -v "$(pwd)/otel-file-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml
```

The collector will immediately begin collecting local system logs and metrics.

## Explore system logs {#explore-system-logs}

Navigate to the HyperDX UI. The search UI should be populated with local system logs. Expand the filters to select the `system.log`:

<Image img={hyperdx_20} alt="HyperDX Local logs" size="lg"/>

## Create a metric source {#create-a-metric-source}

The OTel collector was also configured to collect system metrics. To explore these metrics we need to create a new metrics source.

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

## Explore system metrics {#explore-system-metrics}

We can explore these metrics using charts.

Navigate to the Chart Explorer via the left menu. Select the source `Metrics` and `Maximum` as the aggregation type. 

For the `Select a Metric` menu simply type `memory` before selecting `system.memory.utilization (Gauge)`.

Press the run button to visualize your memory utilization over time.

<Image img={hyperdx_21} alt="Memory over time" size="lg"/>

Note the number is returned as a floating point `%`. To render more clearly, select `Set number format`. 

<Image img={hyperdx_22} alt="Number format" size="lg"/>

From the subsequent menu you can select `Percentage` from the `Output format` drop down before clicking `Apply`.

<Image img={hyperdx_23} alt="Memory % of time" size="lg"/>

</VerticalStepper>