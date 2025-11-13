---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'Monitoring Host Logs with ClickStack'
sidebar_label: 'Generic Host Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring Host Logs with ClickStack'
doc_type: 'guide'
keywords: ['host logs', 'systemd', 'journald', 'syslog', 'OTEL', 'ClickStack', 'system monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Host Logs with ClickStack {#host-logs-clickstack}

:::note[TL;DR]
This guide shows you how to monitor host system logs with ClickStack by configuring the OpenTelemetry collector to ingest systemd journal logs. You'll learn how to:

- Configure the OTel collector to read from systemd journal
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize host log insights (errors, warnings, service activity)

A demo dataset with sample logs is available if you want to test the integration before configuring your production hosts.

Time Required: 5-10 minutes
:::

## Integration with existing hosts {#existing-hosts}

This section covers configuring your existing Linux hosts to send system logs to ClickStack by modifying the ClickStack OTel collector configuration.

If you would like to test the host logs integration before configuring your own existing setup, you can test with our preconfigured setup and sample data in the ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset) section.

##### Prerequisites {#prerequisites}
- ClickStack instance running
- Linux system with systemd/journald (Ubuntu 16.04+, RHEL 7+, Debian 8+)
- Access to `/var/log/journal` directory

<VerticalStepper headerLevel="h4">

#### Verify journald is running {#verify-journald}

First, verify that systemd-journald is active on your system:

```bash
# Check journald status
systemctl status systemd-journald

# View recent journal entries to confirm logs are being collected
journalctl -n 20
```

Common journal locations:
- **Linux (systemd)**: `/var/log/journal`
- **macOS**: See [legacy syslog configuration](#legacy-syslog)
- **Docker**: Mount host's `/var/log/journal` directory

:::note
If `journalctl` is not available or journald is not running, your system may be using traditional syslog. See the [legacy syslog configuration](#legacy-syslog) section instead.
:::

#### Create custom OTel collector configuration {#custom-otel}

ClickStack allows you to extend the base OpenTelemetry Collector configuration by mounting a custom configuration file and setting an environment variable. The custom configuration is merged with the base configuration managed by HyperDX via OpAMP.

Create a file named `host-logs-monitoring.yaml` with the following configuration:

```yaml
receivers:
  journald:
    directory: /var/log/journal
    start_at: end
    priority: info
    operators:
      - type: add
        field: attributes.source
        value: "host-logs"
      
      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [journald]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

This configuration:
- Reads systemd journal logs from their standard location
- Filters to `info` priority and above (excludes debug logs)
- Adds `source: host-logs` attribute for filtering in HyperDX
- Captures all system logs including service logs, kernel messages, and authentication events
- Routes logs to the ClickHouse exporter via a dedicated pipeline

:::note
- You only define new receivers and pipelines in the custom config
- The processors (`memory_limiter`, `transform`, `batch`) and exporters (`clickhouse`) are already defined in the base ClickStack configuration - you just reference them by name
- The systemd journal automatically includes rich metadata like systemd unit, hostname, process ID, and priority level
- This configuration uses `start_at: end` to avoid re-ingesting logs on collector restarts. For testing, change to `start_at: beginning` to see historical logs immediately.
:::

#### Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at `/etc/otelcol-contrib/custom.config.yaml`
2. Set the environment variable `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Mount your systemd journal directory so the collector can read them
4. Run with appropriate permissions to access journal files

##### Option 1: Docker Compose {#docker-compose}

Update your ClickStack deployment configuration:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    user: "0:0"  # Required for journal access
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/journal:/var/log/journal:ro
      # ... other volumes ...
```

##### Option 2: Docker Run (All-in-One Image) {#all-in-one}

If you're using the all-in-one image with docker run:
```bash
docker run --name clickstack \
  --user 0:0 \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/journal:/var/log/journal:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Ensure the ClickStack collector has appropriate permissions to read the journal files. Running as root (`--user 0:0`) is the simplest approach. In production, consider creating a dedicated user and adding it to the `systemd-journal` group:

```bash
# Create user and add to systemd-journal group
sudo useradd -r otelcol
sudo usermod -a -G systemd-journal otelcol
```

Then run the container with `--user $(id -u otelcol):$(id -g otelcol)` instead of `--user 0:0`.
:::

#### Verifying Logs in HyperDX {#verifying-logs}

Once configured, log into HyperDX and verify logs are flowing:

1. Navigate to the search view
2. Set source to Logs
3. Filter by `source:host-logs` to see host-specific logs
4. You should see structured log entries with fields like `unit` (systemd unit name), `priority`, `hostname`, `message`, etc.

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the host logs integration before configuring their production systems, we provide a sample dataset of pre-generated system logs with realistic patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

Download the sample log file:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

The dataset includes:
- System service start/stop events
- Kernel messages
- Authentication events
- Application logs from common services
- Mix of info, warning, and error severity levels

#### Create test collector configuration {#test-config}

Create a file named `host-logs-demo.yaml` with the following configuration:

```yaml
cat > host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning  # Read from beginning for demo data
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+)\[(?P<pid>\d+)\]: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%b %d %H:%M:%S'
      
      - type: add
        field: attributes.source
        value: "host-demo"
      
      - type: add
        field: resource["service.name"]
        value: "host-demo"

service:
  pipelines:
    logs/host-demo:
      receivers: [filelog/journal]
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
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**This mounts the log file directly into the container. This is done for testing purposes with static demo data.**
:::

#### Verify logs in HyperDX {#verify-demo-logs}

Once ClickStack is running:

1. Open [HyperDX](http://localhost:8080/) and log in to your account (you may need to create an account first)
2. Navigate to the Search view and set the source to `Logs`
3. Set the time range to **2025-11-15 00:00:00 - 2025-11-16 00:00:00**

:::note
If you don't see logs, ensure the time range is set to 2025-11-15 00:00:00 - 2025-11-16 00:00:00 and 'Logs' is selected as the source.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring host logs with ClickStack, we provide essential visualizations for system logs.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `host-logs-dashboard.json` file and click **Finish Import**

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

Key visualizations include:
- Log volume over time by severity
- Error and warning event distribution
- Top systemd units generating logs
- Recent critical system events
- Service start/stop activity timeline

:::note
For the demo dataset, ensure the time range is set to 2025-11-15 00:00:00 - 2025-11-16 00:00:00. The imported dashboard will not have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

Verify the environment variable is set:
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Check the custom config file is mounted and readable:
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### No logs appearing in HyperDX {#no-logs}

**Verify journald is running and accessible:**
```bash
# Check journald status on host
systemctl status systemd-journald

# Verify journal directory exists and is accessible
docker exec <container> ls -la /var/log/journal
```

**Test if collector can read journal:**
```bash
# Try reading journal from inside container
docker exec <container> journalctl -n 10

# If permission denied, check user/group permissions
docker exec <container> id
```

**Check the effective config includes your journald receiver:**
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 journald
```

**Check for errors in the collector logs:**
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i journal
```

**If using the demo dataset, verify the log file is accessible:**
```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```

### Permission issues {#permission-issues}

If you see permission errors when trying to read journal files:

```bash
# Option 1: Run as root (simplest for testing)
docker run --user 0:0 ...

# Option 2: Add collector user to systemd-journal group (production)
sudo usermod -a -G systemd-journal otelcol
# Then restart the container
```

On some systems (Ubuntu 24.04+), you may need to explicitly add the user to the `systemd-journal` group even when running as root.

## Legacy: Traditional Syslog {#legacy-syslog}

For systems without systemd journal support (older Linux distributions, BSD systems, macOS), you can use the traditional syslog approach.

Create a file named `host-syslog-monitoring.yaml` with the following configuration:

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/syslog
      - /var/log/messages
      - /var/log/system.log  # macOS
    start_at: end
    operators:
      - type: syslog_parser
        protocol: rfc3164
      
      - type: add
        field: attributes.source
        value: "host-syslog"
      
      - type: add
        field: resource["service.name"]
        value: "host-syslog-production"

service:
  pipelines:
    logs/host-syslog:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

Mount the appropriate log directories when running ClickStack:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-syslog-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
The syslog parser automatically extracts fields like severity, facility, hostname, and message from traditional syslog format.
:::

## Next steps {#next-steps}

After setting up host logs monitoring:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical system events (service failures, kernel panics, authentication failures)
- Filter by specific systemd units to monitor particular services
- Correlate host logs with application logs for comprehensive troubleshooting
- Create custom dashboards for security monitoring (authentication events, sudo usage)

## Going to production {#going-to-production}

This guide extends ClickStack's built-in OpenTelemetry Collector for quick setup. For production deployments, we recommend running your own OTel Collector and sending data to ClickStack's OTLP endpoint. See [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production configuration.
