---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'Monitoring Redis Logs with ClickStack'
sidebar_label: 'Redis'
pagination_prev: null
pagination_next: null
description: 'Monitoring Redis with ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/import-redis-log-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-log-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';

# Monitoring Redis Logs with ClickStack {#redis-clickstack}

::::note[TL;DR]
This guide shows you how to monitor Redis with ClickStack by configuring the OpenTelemetry collector to ingest Redis server logs. You'll learn how to:

- Configure the OTel collector to parse Redis log format
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize Redis metrics (connections, commands, memory, errors)

A demo dataset with 10,000 sample logs is provided to test the integration before connecting your production Redis instances.

Time Required: 5-10 minutes.
::::

## Prerequisites {#prerequisites}
- ClickStack instance running
- Existing Redis installation (version 3.0 or newer)
- Access to Redis log files

## Integration with existing Redis {#existing-redis}

This section covers configuring your existing Redis installation to send logs to ClickStack by modifying the ClickStack OTel collector configuration.

<VerticalStepper>

## Verify Redis logging configuration {#verify-redis}

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

## Create custom otel collector configuration {#custom-otel}

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
        regex: '^(?P<pid>\d+):(?P<role>\w+) (?P<timestamp>\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P<log_level>[.\-*#]) (?P<message>.*)$'
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
- Uses `start_at: beginning` to read all existing logs when the collector starts
- Parses Redis's log format using regex to extract timestamp, level, and message
- Maps Redis log level symbols to OpenTelemetry severity levels
- Adds `source: redis` attribute for filtering in HyperDX
- Adds `service.name` resource attribute to identify the Redis service
- Routes logs to the ClickHouse exporter via a dedicated pipeline

::::warning[Production Consideration]
This configuration uses `start_at: beginning`, which reads all existing logs when ClickStack starts. This is ideal for initial setup and testing as you'll see logs immediately.

For production deployments where you want to avoid re-ingesting logs on collector restarts, change `start_at: beginning` to `start_at: end`. With `start_at: end`, the collector will only capture new log entries written after it starts.
::::

## Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at `/etc/otelcol-contrib/custom.config.yaml`
2. Set the environment variable `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Mount your Redis log directory so the collector can read them

Update your ClickStack deployment configuration to include these settings. This example uses docker compose with both ClickStack and Redis in the same compose file:

```yaml
services:
  redis:
    image: redis:7.2-alpine
    container_name: redis-prod
    ports:
      - "6379:6379"
    volumes:
      - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
      - redis-logs:/var/log/redis
    command: sh -c "mkdir -p /var/log/redis && chmod 777 /var/log/redis && redis-server /usr/local/etc/redis/redis.conf"

  clickstack:
    image: docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
    container_name: clickstack-prod
    ports:
      - "8080:8080"
      - "4317:4317"
      - "4318:4318"
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
    volumes:
      - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - redis-logs:/var/log/redis:ro
    depends_on:
      - redis

volumes:
  redis-logs:
```

::::note[Key Points]
- Both containers share the same `redis-logs` volume
- ClickStack mounts the logs as read-only (`:ro`) following the principle of least privilege
- The shared volume allows ClickStack to read Redis logs in real-time
- For standalone deployments, ensure the log directory is accessible to both Redis and ClickStack
::::

## Verifying Logs in ClickStack {#verifying-logs}

Once configured, log into HyperDX and verify logs are flowing:

<Image img={log_view} alt="Log view"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the Redis integration before configuring their production systems, we provide a sample dataset of pre-generated Redis logs with realistic patterns.

<VerticalStepper>

## Download the sample dataset {#download-sample}

Download the sample log file and update timestamps to the current time:

```bash
# Download the logs
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis-server.log

# Update timestamps to current time while preserving traffic patterns
python3 << 'EOF'
from datetime import datetime, timedelta
import re

# Read all log lines
with open('redis-server.log', 'r') as f:
    logs = f.readlines()

# Parse Redis timestamp format: DD Mon YYYY HH:MM:SS.mmm
def parse_redis_time(time_str):
    return datetime.strptime(time_str, "%d %b %Y %H:%M:%S.%f")

# Extract timestamps using regex
pattern = r'\d+:\w+ (\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2}\.\d+)'
timestamps = []
for log in logs:
    match = re.search(pattern, log)
    if match:
        timestamps.append(parse_redis_time(match.group(1)))

if not timestamps:
    print('❌ No timestamps found in logs')
    exit(1)

# Calculate time shift
newest_time = max(timestamps)
now = datetime.now()
time_shift = now - newest_time

# Update all timestamps
updated_logs = []
for log in logs:
    match = re.search(pattern, log)
    if match:
        original_time = parse_redis_time(match.group(1))
        new_time = original_time + time_shift
        new_timestamp = new_time.strftime("%d %b %Y %H:%M:%S.%f")[:-3]  # Trim to milliseconds
        updated_log = log.replace(match.group(1), new_timestamp)
        updated_logs.append(updated_log)
    else:
        updated_logs.append(log)

# Write back
with open('redis-server.log', 'w') as f:
    f.writelines(updated_logs)

print('✅ Log timestamps updated to current time')
EOF
```

The dataset includes:
- 10,000 log entries with realistic Redis activity distributed over 24 hours
- Traffic peaks during typical busy hours (9-11am, 1-3pm, 7-9pm)
- Mix of log levels: INFO (70-85%), WARNING (7-27%), DEBUG (3-5%)
- Varied attributes: multiple process IDs, roles, client addresses, and metrics
- Common events: connections, commands, persistence operations, memory warnings

## Create test collector configuration {#test-config}

Create a file named `redis-demo.yaml` with the following configuration:

```yaml
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
```

## Run ClickStack with demo configuration {#run-demo}

Run ClickStack with the demo logs and configuration:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

::::note
**This mounts the log file directly into the container. This is done for testing purposes with static demo data.**
::::

## Verify logs in HyperDX {#verify-demo-logs}

Once ClickStack is running:

1. Open HyperDX at http://localhost:8080
2. Navigate to the **Logs** view
3. Set time range to "Last 1 Day"
4. Filter by `source: redis-demo`
5. You should see 10,000 log entries

<Image img={log_view} alt="Log view"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring Redis with ClickStack, we provide essential visualizations for Redis logs.

<VerticalStepper>

## <a href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json">Download</a> the dashboard configuration. {#download-dashboard}

## Import Pre-built Dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section.
2. Click "Import Dashboard" in the upper right corner under the ellipses.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the redis-logs-dashboard.json file and click finish import.

<Image img={finish_import} alt="Finish Import"/>

## The dashboard will be created with all visualizations pre-configured. {#created-dashboard}

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
