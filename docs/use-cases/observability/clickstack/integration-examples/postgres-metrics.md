---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'Monitoring PostgreSQL Metrics with ClickStack'
sidebar_label: 'PostgreSQL Metrics'
pagination_prev: null
pagination_next: null
description: 'Monitoring PostgreSQL Metrics with ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'metrics', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring PostgreSQL Metrics with ClickStack {#postgres-metrics-clickstack}

:::note[TL;DR]
This guide shows you how to monitor PostgreSQL performance metrics with ClickStack by configuring the OpenTelemetry collector's PostgreSQL receiver. You'll learn how to:

- Configure the OTel collector to collect PostgreSQL metrics
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize PostgreSQL performance (transactions, connections, database size, cache hit ratios)

A demo dataset with sample metrics is available if you want to test the integration before configuring your production PostgreSQL database.

Time required: 10-15 minutes
:::

## Integration with existing PostgreSQL {#existing-postgres}

This section covers configuring your existing PostgreSQL installation to send metrics to ClickStack by configuring the ClickStack OTel collector with the PostgreSQL receiver.

If you would like to test the PostgreSQL metrics integration before configuring your own existing setup, you can test with our preconfigured demo dataset in the [following section](#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running
- Existing PostgreSQL installation (version 9.6 or newer)
- Network access from ClickStack to PostgreSQL (default port 5432)
- PostgreSQL monitoring user with appropriate permissions

<VerticalStepper headerLevel="h4">

#### Ensure monitoring user has required permissions {#monitoring-permissions}

The PostgreSQL receiver requires a user with read access to statistics views. Grant the `pg_monitor` role to your monitoring user:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### Create custom OTel collector configuration {#create-custom-config}

ClickStack allows you to extend the base OpenTelemetry collector configuration by mounting a custom configuration file and setting an environment variable.

Create `postgres-metrics.yaml`:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db
    collection_interval: 30s
    tls:
      insecure: true

processors:
  resourcedetection:
    detectors: [env, system, docker]
    timeout: 5s
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  clickhouse:
    endpoint: tcp://localhost:9000
    database: default
    ttl: 96h

service:
  pipelines:
    metrics/postgres:
      receivers: [postgresql]
      processors: [resourcedetection, batch]
      exporters: [clickhouse]
```

:::note
The `tls: insecure: true` setting disables SSL verification for development/testing. For production PostgreSQL with SSL enabled, remove this line or configure proper certificates.
:::

#### Deploy ClickStack with custom configuration {#deploy-clickstack}

Mount your custom configuration:

```bash
docker run -d \
  --name clickstack-postgres \
  -p 8123:8123 -p 9000:9000 -p 4317:4317 -p 4318:4318 \
  -e HYPERDX_API_KEY=your-api-key \
  -e CLICKHOUSE_PASSWORD=your-clickhouse-password \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack:latest
```

#### Verify metrics collection {#verify-metrics}

Once configured, log into HyperDX and verify metrics are flowing:

1. Navigate to the Metrics explorer
2. Search for metrics starting with postgresql. (e.g., postgresql.backends, postgresql.commits)
3. You should see metric data points appearing at your configured collection interval

Once metrics are flowing, proceed to the [Dashboards and visualization](#dashboards) section to import the pre-built dashboard.

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the PostgreSQL metrics integration before configuring their production systems, we provide a pre-generated dataset with realistic PostgreSQL metrics patterns.

:::note[Database-level metrics only]
This demo dataset includes database-level metrics only, matching the default PostgreSQL receiver configuration. Table-level and index-level metrics are disabled by default because they generate significantly more data. Database-level metrics provide comprehensive monitoring for most use cases.
:::

<VerticalStepper headerLevel="h4">

#### Download the sample metrics dataset {#download-sample}

Download the pre-generated metrics files (24 hours of PostgreSQL metrics with realistic patterns):

```bash
# Download gauge metrics (connections, database size)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# Download sum metrics (commits, rollbacks, operations)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

The dataset includes realistic patterns:
- **Morning connection spike (08:00)** - Login rush
- **Cache performance issue (11:00)** - Blocks_read spike
- **Application bug (14:00-14:30)** - Rollback rate spikes to 15%
- **Deadlock incidents (14:15, 16:30)** - Rare deadlocks

#### Start ClickStack {#start-clickstack}

Start a ClickStack instance:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

Wait approximately 30 seconds for ClickStack to fully start.

#### Load metrics into ClickStack {#load-metrics}

Load the metrics directly into ClickHouse:

```bash
# Load gauge metrics
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Load sum metrics
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Verify metrics in HyperDX {#verify-metrics-demo}

Once loaded, the quickest way to see your metrics is through the pre-built dashboard.

Proceed to the [Dashboards and visualization](#dashboards) section to import the dashboard and view many PostgreSQL metrics at once.

:::note
The demo dataset time range is November 10, 2025 00:00:00 to November 11, 2025 00:00:00. Make sure your time range in HyperDX matches this window.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring PostgreSQL with ClickStack, we provide essential visualizations for PostgreSQL metrics.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `postgres-metrics-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

<Image img={example_dashboard} alt="PostgreSQL metrics dashboard"/>

:::note
For the demo dataset, ensure the time range is set to November 10, 2025 00:00:00 - November 11, 2025 00:00:00.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

Verify the environment variable is set:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Check the custom config file is mounted:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### No metrics appearing in HyperDX {#no-metrics}

Verify PostgreSQL is accessible:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

Check OTel collector logs:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### Authentication errors {#auth-errors}

Verify password is set correctly:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

Test credentials directly:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```

## Next steps {#next-steps}

After setting up PostgreSQL metrics monitoring:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical thresholds (connection limits, high rollback rates, low cache hit ratios)
- Enable query-level monitoring with `pg_stat_statements` extension
- Monitor multiple PostgreSQL instances by duplicating the receiver configuration with different endpoints and service names

## Going to production {#going-to-production}

This guide extends ClickStack's built-in OpenTelemetry Collector for quick setup. For production deployments, we recommend running your own OTel Collector and sending data to ClickStack's OTLP endpoint. See [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production configuration.
