---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'Monitoring Redis logs with ClickStack'
sidebar_label: 'Redis logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring Redis logs with ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/redis-import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/redis/redis-log-view.png';
import log from '@site/static/images/clickstack/redis/redis-log.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Redis logs with ClickStack {#redis-clickstack}

:::note[TL;DR]
This guide shows you how to monitor Redis with ClickStack by configuring the OpenTelemetry collector to ingest Redis server logs. You'll learn how to:

- Configure the OTel collector to parse Redis log format
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize Redis metrics (connections, commands, memory, errors)

A demo dataset with sample logs is available if you want to test the integration before configuring your production Redis.

Time Required: 5-10 minutes
:::

## Integration with existing Redis {#existing-redis}

This section covers configuring your existing Redis installation to send logs to ClickStack by modifying the ClickStack OTel collector configuration.
If you would like to test the Redis integration before configuring your own existing setup, you can test with our preconfigured setup and sample data in the [following section](/use-cases/observability/clickstack/integrations/redis#demo-dataset).

### Prerequisites {#prerequisites}
- ClickStack instance running
- Existing Redis installation (version 3.0 or newer)
- Access to Redis log files

<VerticalStepper headerLevel="h4">

#### Verify Redis logging configuration {#verify-redis}

First, check your Redis logging configuration. Connect to Redis and check the log file location:

```bash
redis-cli CONFIG GET logfile
```

Common Redis log locations:
- **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
- **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
- **Docker**: Often logged to stdout, but can be configured to write to `/data/redis.log`

If Redis is logging to stdout, configure it to write to a file by updating `redis.conf`:

```bash
# Log to file instead of stdout
logfile /var/log/redis/redis-server.log

# Set log level (options: debug, verbose, notice, warning)
loglevel notice
```

After changing the configuration, restart Redis:

```bash
# For systemd
sudo systemctl restart redis

# For Docker
docker restart <redis-container>
```

#### Create custom otel collector configuration {#custom-otel}

ClickStack allows you to extend the base OpenTelemetry Collector configuration by mounting a custom configuration file and setting an environment variable. The custom configuration is merged with the base configuration managed by HyperDX via OpAMP.

Create a file named `redis-monitoring.yaml` with the following configuration:
```yaml
receivers:
  filelog/redis:
    include:
      - /var/log/redis/redis-server.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P\d+):(?P\w+) (?P\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P[.\-*#]) (?P.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'
      
      - type: add
        field: attributes.source
        value: "redis"
      
      - type: add
        field: resource["service.name"]
        value: "redis-production"

service:
  pipelines:
    logs/redis:
      receivers: [filelog/redis]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

This configuration:
- Reads Redis logs from their standard location
- Parses Redis's log format using regex to extract structured fields (pid, role, timestamp, log_level, message)
- Adds `source: redis` attribute for filtering in HyperDX
- Routes logs to the ClickHouse exporter via a dedicated pipeline

:::note
- You only define new receivers and pipelines in the custom config
- The processors (memory_limiter, transform, batch) and exporters (clickhouse) are already defined in the base ClickStack configuration - you just reference them by name
- The time_parser operator extracts timestamps from Redis logs to preserve original log timing
- This configuration uses `start_at: beginning` to read all existing logs when the collector starts, allowing you to see logs immediately. For production deployments where you want to avoid re-ingesting logs on collector restarts, change to `start_at: end`.
:::

#### Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at `/etc/otelcol-contrib/custom.config.yaml`
2. Set the environment variable `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Mount your Redis log directory so the collector can read them

##### Option 1: Docker Compose {#docker-compose}

Update your ClickStack deployment configuration:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/redis:/var/log/redis:ro
      # ... other volumes ...
```

##### Option 2: Docker Run (All-in-One Image) {#all-in-one}

If using the all-in-one image with docker run:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/redis:/var/log/redis:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Ensure the ClickStack collector has appropriate permissions to read the Redis log files. In production, use read-only mounts (`:ro`) and follow the principle of least privilege.
:::

#### Verifying Logs in HyperDX {#verifying-logs}

Once configured, log into HyperDX and verify logs are flowing:

<Image img={log_view} alt="Log view"/>

<Image img={log} alt="Log"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the Redis integration before configuring their production systems, we provide a sample dataset of pre-generated Redis logs with realistic patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

Download the sample log file:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### Create test collector configuration {#test-config}

Create a file named `redis-demo.yaml` with the following configuration:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # Read from beginning for demo data
    operators:
      - type: regex_parser
        regex: '^(?P<pid>\d+):(?P<role>\w+) (?P<timestamp>\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P<log_level>[.\-*#]) (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'
      
      - type: add
        field: attributes.source
        value: "redis-demo"
      
      - type: add
        field: resource["service.name"]
        value: "redis-demo"

service:
  pipelines:
    logs/redis-demo:
      receivers: [filelog/redis]
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
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**This mounts the log file directly into the container. This is done for testing purposes with static demo data.**
:::

## Verify logs in HyperDX {#verify-demo-logs}

Once ClickStack is running:

1. Open [HyperDX](http://localhost:8080/) and log in to your account, you may need to create an account first.
2. Once logged in, open this [link](http://localhost:8080/search?from=1761577200000&to=1761663600000&isLive=false&source=690280cfd3754c36b73402cc&where=&select=Timestamp,ServiceName,SeverityText,Body&whereLanguage=lucene&orderBy=&filters=[]). You should see what's pictured in the screenshots below.

:::note
If you don't see logs, ensure the time range is set to 2025-10-27 10:00:00 - 2025-10-28 10:00:00 and 'Logs' is selected as the source. Using the link is important to get the proper time range of results.
:::

<Image img={log_view} alt="Log view"/>

<Image img={log} alt="Log"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring Redis with ClickStack, we provide essential visualizations for Redis logs.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import Pre-built Dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section.
2. Click "Import Dashboard" in the upper right corner under the ellipses.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the redis-logs-dashboard.json file and click finish import.

<Image img={finish_import} alt="Finish Import"/>

#### The dashboard will be created with all visualizations pre-configured {#created-dashboard}

:::note
Ensure the time range is set to 2025-10-27 10:00:00 - 2025-10-28 10:00:00. The imported dashboard will not have a time range specified by default.
:::

<Image img={example_dashboard} alt="Example Dashboard"/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

**Verify the environment variable is set correctly:**
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# Expected output: /etc/otelcol-contrib/custom.config.yaml
```

**Check that the custom config file is mounted:**
```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# Expected output: Should show file size and permissions
```

**View the custom config content:**
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# Should display your redis-monitoring.yaml content
```

**Check the effective config includes your filelog receiver:**
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# Should show your filelog/redis receiver configuration
```

### No logs appearing in HyperDX {#no-logs}

**Ensure Redis is writing logs to a file:**
```bash
redis-cli CONFIG GET logfile
# Expected output: Should show a file path, not empty string
# Example: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```

**Check Redis is actively logging:**
```bash
tail -f /var/log/redis/redis-server.log
# Should show recent log entries in Redis format
```

**Verify the collector can read the logs:**
```bash
docker exec <container> cat /var/log/redis/redis-server.log
# Should display Redis log entries
```

**Check for errors in the collector logs:**
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# Look for any error messages related to filelog or Redis
```

**If using docker-compose, verify shared volumes:**
```bash
# Check both containers are using the same volume
docker volume inspect <volume-name>
# Verify both containers have the volume mounted
```

### Logs not parsing correctly {#logs-not-parsing}

**Verify Redis log format matches expected pattern:**
```bash
# Redis logs should look like:
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

If your Redis logs have a different format, you may need to adjust the regex pattern in the `regex_parser` operator. The standard format is:
- `pid:role timestamp level message`
- Example: `12345:M 28 Oct 2024 14:23:45.123 * Server started`

## Next Steps {#next-steps}

If you want to explore further, here are some next steps to experiment with your dashboard

- Set up alerts for critical metrics (error rates, latency thresholds)
- Create additional dashboards for specific use cases (API monitoring, security events)
