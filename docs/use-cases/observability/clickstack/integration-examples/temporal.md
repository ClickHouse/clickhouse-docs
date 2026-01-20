---
slug: /use-cases/observability/clickstack/integrations/temporal-metrics
title: 'Monitoring Temporal Cloud with ClickStack'
sidebar_label: 'Temporal Cloud Metrics'
pagination_prev: null
pagination_next: null
description: 'Monitoring Temporal Cloud Metrics with ClickStack'
doc_type: 'guide'
keywords: ['Temporal', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import temporal_metrics from '@site/static/images/clickstack/temporal/temporal-metrics.png';
import finish_import from '@site/static/images/clickstack/temporal/import-temporal-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/temporal/temporal-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

:::note Warning
OpenMetrics support in the Temporal platform is available in [Public Preview](https://docs.temporal.io/evaluate/development-production-features/release-stages#public-preview). Refer to [their documentation](https://docs.temporal.io/cloud/metrics/openmetrics) for more information.
:::

Temporal offers an abstraction for building simple, sophisticated, resilient applications.

# Monitoring Temporal Cloud metrics with ClickStack {#temporal-metrics-clickstack}

:::note[TL;DR]
This guide shows you how to monitor Temporal Cloud with ClickStack by configuring the OpenTelemetry collector's Prometheus receiver. You'll learn how to:

- Configure the OTel collector to collect Temporal Cloud Metrics
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize Temporal Cloud performance (open workflows, actions/sec, active namespaces, task backlogs)

Time required: 5-10 minutes
:::

## Integration with existing Temporal Cloud {#existing-temporal}

This section covers configuring ClickStack by configuring the ClickStack OTel collector with the Prometheus receiver.

## Prerequisites {#prerequisites}

- ClickStack instance running
- Existing Temporal Cloud account
- HTTP network access from ClickStack to your Temporal Cloud

<VerticalStepper headerLevel="h4">

#### Create Temporal Cloud key {#create-temporal-cloud-key}

Ensure you have a Temporal Cloud API key. This can be created by following the [Authentication guide](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/api-reference#authentication) in the Temporal documentation.

:::important Key file
Ensure these credentials are stored in a file `temporal.key` in the same directory as the config file created below. This key should just be stored as text with no preceding or following spaces.
:::

#### Create custom OTel collector configuration {#custom-otel}

ClickStack allows you to extend the base OpenTelemetry collector configuration by mounting a custom configuration file and setting an environment variable. The custom configuration is merged with the base configuration managed by HyperDX via OpAMP.

Create a file named `temporal-metrics.yaml` with the following configuration:
```yaml title="temporal-metrics.yaml"
receivers:
  prometheus/temporal:
    config:
      scrape_configs:
      - job_name: 'temporal-cloud'
        scrape_interval: 60s
        scrape_timeout: 30s
        honor_timestamps: true
        scheme: https
        authorization:
          type: Bearer
          credentials_file: /etc/otelcol-contrib/temporal.key
        static_configs:
          - targets: ['metrics.temporal.io']
        metrics_path: '/v1/metrics'

processors:
  resource:
    attributes:
      - key: service.name
        value: "temporal"
        action: upsert

service:
  pipelines:
    metrics/temporal:
      receivers: [prometheus/temporal]
      processors:
        - resource
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

This configuration:

- Connects to Temporal Cloud at `metrics.temporal.io`
- Collects metrics every 60 seconds
- Collects [key performance metrics](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/metrics-reference)
- **Sets the required `service.name` resource attribute** per [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service)
- Routes metrics to the ClickHouse exporter via a dedicated pipeline

:::note
- You only define new receivers, processors, and pipelines in the custom config
- The `memory_limiter` and `batch` processors and `clickhouse` exporter are already defined in the base ClickStack configuration - you just reference them by name
- The `resource` processor sets the required `service.name` attribute per OpenTelemetry semantic conventions
- For multiple Temporal cloud accounts, customize `service.name` to distinguish them (e.g., `"temporal-prod"`, `"temporal-dev"`)
:::

#### Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at `/etc/otelcol-contrib/custom.config.yaml`
2. Set the environment variable `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Mount the `temporal.key` file at `/etc/otelcol-contrib/temporal.key`
4. Ensure network connectivity between ClickStack and Temporal

All commands assume they are executed from the sample directory as where `temporal-metrics.yaml` and `temporal.key` are stored.

##### Option 1: Docker Compose {#docker-compose}

Update your ClickStack deployment configuration:

```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
    volumes:
      - ./temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - ./temporal.key:/etc/otelcol-contrib/temporal.key:ro
      # ... other volumes ...
```

##### Option 2: Docker run (all-in-one image) {#all-in-one}

If using the all-in-one image with `docker run`:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/temporal.key:/etc/otelcol-contrib/temporal.key:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### Verify metrics in HyperDX {#verifying-metrics}

Once configured, log into HyperDX and verify metrics are flowing:

1. Navigate to the Metrics explorer
2. Search for metrics starting with `temporal` (e.g., `temporal_cloud_v1_workflow_success_count`, `temporal_cloud_v1_poll_timeout_count`)
3. You should see metric data points appearing at your configured collection interval

<Image img={temporal_metrics} alt="Temporal Metrics" size="md"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring Temporal Cloud with ClickStack, we provide some example visualizations for Temporal Metrics.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/temporal-metrics-dashboard.json')} download="temporal-metrics-dashboard.json" eventName="docs.temporal_metrics_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `temporal-metrics-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

<Image img={example_dashboard} alt="Temporal Metrics dashboard"/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

Verify the environment variable `CUSTOM_OTELCOL_CONFIG_FILE` is set correctly:
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Check that the custom config file is mounted at `/etc/otelcol-contrib/custom.config.yaml`:
```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack ls -lh /etc/otelcol-contrib/custom.config.yaml
```

View the custom config content to verify it's readable:
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack cat /etc/otelcol-contrib/custom.config.yaml
```

Confirm the `temporal.key` is mounted into the container:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/temporal.key
# usually, docker exec clickstack cat /etc/otelcol-contrib/temporal.key
# This should output your temporal.key
```

### No metrics appearing in HyperDX {#no-metrics}

Verify Temporal Cloud is accessible from the collector:

```bash
# From the ClickStack container
docker exec <container-name> curl -H "Authorization: Bearer <API_KEY>" https://metrics.temporal.io/v1/metrics
```

You should see a series of Prometheus metrics printed e.g.

```text
temporal_cloud_v1_workflow_success_count{operation="CompletionStats",region="aws-us-east-2",temporal_account="l2c4n",temporal_namespace="clickpipes-aws-prd-apps-us-east-2.l2c4n",temporal_task_queue="clickpipes-svc-dc118d12-b397-4975-a33e-c2888ac12ac4-peer-flow-task-queue",temporal_workflow_type="QRepPartitionWorkflow"} 0.067 1765894320
```

Verify the effective config includes your Prometheus receiver:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "Prometheus:"
## usually, docker exec clickstack cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "prometheus:"
```

Check for errors in the collector agent logs:
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
# Look for connection errors or authentication failures
# docker exec clickstack cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
```

Check in the collector logs:
```bash
docker exec <container> cat /var/log/otel-collector.log | grep -i error
# Look for config parsing errors - early supervisor.opamp-client can be ignored 
# docker exec clickstack cat /var/log/otel-collector.log | grep -i error
```

### Authentication errors {#auth-errors}

If you see authentication errors in the logs check your API key.

### Network connectivity issues {#network-issues}

If ClickStack can't reach Temporal Cloud ensure your Docker Compose file or `docker run` commands allow [external networking](https://docs.docker.com/engine/network/#drivers).

## Next steps {#next-steps}

If you want to explore further, here are some next steps to experiment with your monitoring:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical metrics (memory usage thresholds, connection limits, cache hit rate drops)
- Create additional dashboards for specific use cases (replication lag, persistence performance)
- Monitor multiple Temporal Cloud accounts by duplicating the receiver configuration with different endpoints and service names
