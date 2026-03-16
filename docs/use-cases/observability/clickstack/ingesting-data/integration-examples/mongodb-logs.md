---
slug: /use-cases/observability/clickstack/integrations/mongodb-logs
title: 'Monitoring MongoDB Logs with ClickStack'
sidebar_label: 'MongoDB Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring MongoDB Logs with ClickStack'
doc_type: 'guide'
keywords: ['MongoDB', 'logs', 'OTEL', 'ClickStack', 'database monitoring', 'slow query']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/mongodb/log-view.png';
import search_view from '@site/static/images/clickstack/mongodb/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/mongodb/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mongodb/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring MongoDB Logs with ClickStack {#mongodb-logs-clickstack}

:::note[TL;DR]
Collect and visualize MongoDB server logs (4.4+ JSON format) in ClickStack using the OTel `filelog` receiver. Includes a demo dataset and pre-built dashboard.
:::

## Integration with existing MongoDB {#existing-mongodb}

This section covers configuring your existing MongoDB installation to send logs to ClickStack by modifying the ClickStack OTel collector configuration.
If you would like to test the MongoDB integration before configuring your own existing setup, you can test with our preconfigured setup and sample data in the ["Demo dataset"](/use-cases/observability/clickstack/integrations/mongodb-logs#demo-dataset) section.

### Prerequisites {#prerequisites}
- ClickStack instance running
- Existing self-managed MongoDB installation (version 4.4 or newer)
- Access to MongoDB log files

<VerticalStepper headerLevel="h4">

#### Verify MongoDB logging configuration {#verify-mongodb}

MongoDB 4.4+ outputs structured JSON logs by default. Check your log file location:

```bash
cat /etc/mongod.conf | grep -A 5 systemLog
```

Common MongoDB log locations:
- **Linux (apt/yum)**: `/var/log/mongodb/mongod.log`
- **macOS (Homebrew)**: `/usr/local/var/log/mongodb/mongo.log`
- **Docker**: Often logged to stdout, but can be configured to write to `/var/log/mongodb/mongod.log`

If MongoDB is logging to stdout, configure it to write to a file by updating `mongod.conf`:

```yaml
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
```

After changing the configuration, restart MongoDB:

```bash
# For systemd
sudo systemctl restart mongod

# For Docker
docker restart <mongodb-container>
```

#### Create a custom OTel collector configuration for MongoDB {#custom-otel}

ClickStack allows you to extend the base OpenTelemetry Collector configuration by mounting a custom configuration file and setting an environment variable. The custom configuration is merged with the base configuration managed by HyperDX via OpAMP.

Create a file named `mongodb-monitoring.yaml` with the following configuration:

```yaml
receivers:
  filelog/mongodb:
    include:
      - /var/log/mongodb/mongod.log
    start_at: beginning
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
        timestamp:
          parse_from: attributes.t.$$date
          layout: '2006-01-02T15:04:05.000-07:00'
          layout_type: gotime
        severity:
          parse_from: attributes.s
          overwrite_text: true
          mapping:
            fatal: F
            error: E
            warn: W
            info: I
            debug:
              - D1
              - D2
              - D3
              - D4
              - D5

      - type: move
        from: attributes.msg
        to: body

      - type: add
        field: attributes.source
        value: "mongodb"

      - type: add
        field: resource["service.name"]
        value: "mongodb-production"

service:
  pipelines:
    logs/mongodb:
      receivers: [filelog/mongodb]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

:::note
- You only define new receivers and pipelines in the custom config. The processors (`memory_limiter`, `transform`, `batch`) and exporters (`clickhouse`) are already defined in the base ClickStack configuration — you just reference them by name.
- This configuration uses `start_at: beginning` to read all existing logs when the collector starts. For production deployments, change to `start_at: end` to avoid re-ingesting logs on collector restarts.
:::

#### Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at `/etc/otelcol-contrib/custom.config.yaml`
2. Set the environment variable `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Mount your MongoDB log directory so the collector can read them

<Tabs groupId="deployMethod">
<TabItem value="docker-compose" label="Docker Compose" default>

Update your ClickStack deployment configuration:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/mongodb:/var/log/mongodb:ro
      # ... other volumes ...
```

</TabItem>
<TabItem value="docker-run" label="Docker Run (All-in-One Image)">

If you're using the all-in-one image with docker, run:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/mongodb:/var/log/mongodb:ro \
  clickhouse/clickstack-all-in-one:latest
```

</TabItem>
</Tabs>

:::note
Ensure the ClickStack collector has appropriate permissions to read the MongoDB log files. In production, use read-only mounts (`:ro`) and follow the principle of least privilege.
:::

#### Verify Logs in HyperDX {#verifying-logs}

Once configured, log into HyperDX and verify that logs are flowing:

<Image img={search_view} alt="MongoDB logs search view"/>

<Image img={log_view} alt="MongoDB log detail view"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

Test the MongoDB integration with a pre-generated sample dataset before configuring your production systems.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

Download the sample log file:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mongodb/mongod.log
```

#### Create test collector configuration {#test-config}

Create a file named `mongodb-demo.yaml` with the following configuration:

```yaml
cat > mongodb-demo.yaml << 'EOF'
receivers:
  filelog/mongodb:
    include:
      - /tmp/mongodb-demo/mongod.log
    start_at: beginning
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
        timestamp:
          parse_from: attributes.t.$$date
          layout: '2006-01-02T15:04:05.000-07:00'
          layout_type: gotime
        severity:
          parse_from: attributes.s
          overwrite_text: true
          mapping:
            fatal: F
            error: E
            warn: W
            info: I
            debug:
              - D1
              - D2
              - D3
              - D4
              - D5

      - type: move
        from: attributes.msg
        to: body

      - type: add
        field: attributes.source
        value: "mongodb-demo"

      - type: add
        field: resource["service.name"]
        value: "mongodb-demo"

service:
  pipelines:
    logs/mongodb-demo:
      receivers: [filelog/mongodb]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Run ClickStack with demo configuration {#run-demo}

Run ClickStack with the demo logs and configuration:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/mongodb-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/mongod.log:/tmp/mongodb-demo/mongod.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

## Verify logs in HyperDX {#verify-demo-logs}

Once ClickStack is running:

1. Open [HyperDX](http://localhost:8080/) and log in to your account (you may need to create an account first)
2. Navigate to the Search view and set the source to `Logs`
3. Set the time range to include **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**

<Image img={search_view} alt="MongoDB logs search view"/>

<Image img={log_view} alt="MongoDB log detail view"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/mongodb-logs-dashboard.json')} download="mongodb-logs-dashboard.json" eventName="docs.mongodb_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section.
2. Click "Import Dashboard" in the upper right corner under the ellipses.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the mongodb-logs-dashboard.json file and click finish import.

<Image img={finish_import} alt="Finish importing MongoDB logs dashboard"/>

#### The dashboard will be created with all visualizations pre-configured {#created-dashboard}

For the demo dataset, set the time range to include **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**.

<Image img={example_dashboard} alt="MongoDB logs dashboard"/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No logs appearing in HyperDX {#no-logs}

Verify the effective config includes your filelog receiver:
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Check for errors in the collector logs:
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

### Logs not parsing correctly {#logs-not-parsing}

Verify MongoDB is outputting JSON logs (4.4+):
```bash
tail -1 /var/log/mongodb/mongod.log | python3 -m json.tool
```

If the output is not valid JSON, your MongoDB version may be using the legacy text log format (pre-4.4). You'll need to replace the `json_parser` operator with a `regex_parser`, or upgrade to MongoDB 4.4+.

## Next steps {#next-steps}

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical events (error spikes, slow query thresholds)
- Create additional [dashboards](/use-cases/observability/clickstack/dashboards) for specific use cases (replica set monitoring, connection tracking)

## Going to production {#going-to-production}

This guide extends ClickStack's built-in OpenTelemetry Collector for quick setup. For production deployments, we recommend running your own OTel Collector and sending data to ClickStack's OTLP endpoint. See [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production configuration.
