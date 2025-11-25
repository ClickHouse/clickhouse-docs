---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: 'Monitoring EC2 Host Logs with ClickStack'
sidebar_label: 'EC2 Host Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring EC2 Host Logs with ClickStack'
doc_type: 'guide'
keywords: ['EC2', 'AWS', 'host logs', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'system monitoring', 'cloud metadata']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/host-logs/ec2/search-view.png';
import log_view from '@site/static/images/clickstack/host-logs/ec2/log-view.png';
import search_view_demo from '@site/static/images/clickstack/host-logs/ec2/search-view-demo.png';
import log_view_demo from '@site/static/images/clickstack/host-logs/ec2/log-view-demo.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Monitoring EC2 Host Logs with ClickStack {#ec2-host-logs-clickstack}

:::note[TL;DR]
Monitor EC2 system logs with ClickStack by installing OpenTelemetry Collector on your instances. The collector automatically enriches logs with EC2 metadata (instance ID, region, availability zone, instance type). You'll learn how to:

- Install and configure OpenTelemetry Collector on EC2 instances
- Automatically enrich logs with EC2 metadata
- Send logs to ClickStack via OTLP
- Use a pre-built dashboard to visualize EC2 host logs with cloud context

A demo dataset with sample logs and simulated EC2 metadata is available for testing.

Time Required: 10-15 minutes
:::

## Integration with existing EC2 instance {#existing-ec2}

This section covers installing OpenTelemetry Collector on your EC2 instances to collect system logs and send them to ClickStack with automatic EC2 metadata enrichment. This distributed architecture is production-ready and scales to multiple instances.

:::note[Running ClickStack on the same EC2 instance?]
If ClickStack is running on the same EC2 instance whose logs you want to monitor, you can use the all-in-one approach similar to the [Generic Host Logs guide](/use-cases/observability/clickstack/integrations/host-logs). Mount `/var/log` into the ClickStack container and add the `resourcedetection` processor to your custom config to automatically capture EC2 metadata. This guide focuses on the more common distributed architecture for production deployments.
:::

If you would like to test the EC2 host logs integration before configuring your production instance, you can test with our preconfigured setup and sample data in the ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset) section.

##### Prerequisites {#prerequisites}
- ClickStack instance running (can be on-premises, cloud, or local)
- EC2 instance running (Ubuntu, Amazon Linux, or other Linux distribution)
- Network connectivity from EC2 instance to ClickStack's OTLP endpoint (port 4318 for HTTP or 4317 for gRPC)
- EC2 instance metadata service accessible (enabled by default)

<VerticalStepper headerLevel="h4">

#### Verify EC2 metadata is accessible {#verify-metadata}

From your EC2 instance, verify the metadata service is accessible:
```bash
# Get metadata token (IMDSv2)
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Verify instance metadata
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
```

You should see your instance ID, region, and instance type. If these commands fail, verify:
- The instance metadata service is enabled
- IMDSv2 is not blocked by security groups or network ACLs
- You're running these commands from the EC2 instance itself

:::note
EC2 metadata is available at `http://169.254.169.254` from within the instance. The OpenTelemetry `resourcedetection` processor uses this endpoint to automatically enrich logs with cloud context.
:::

#### Verify syslog files exist {#verify-syslog}

Verify that your EC2 instance is writing syslog files:
```bash
# Ubuntu instances
ls -la /var/log/syslog

# Amazon Linux / RHEL instances
ls -la /var/log/messages

# View recent entries
tail -20 /var/log/syslog
# or
tail -20 /var/log/messages
```

#### Install OpenTelemetry Collector {#install-collector}

Install the OpenTelemetry Collector Contrib distribution on your EC2 instance:
```bash
# Download the latest release
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.114.0/otelcol-contrib_0.114.0_linux_amd64.tar.gz

# Extract and install
tar -xvf otelcol-contrib_0.114.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/

# Verify installation
otelcol-contrib --version
```

#### Create collector configuration {#create-config}

Create a configuration file for the OpenTelemetry Collector at `/etc/otelcol-contrib/config.yaml`:
```bash
sudo mkdir -p /etc/otelcol-contrib
```

Choose the configuration based on your Linux distribution:

<Tabs groupId="os-type">
<TabItem value="modern-linux" label="Modern Linux (Ubuntu 24.04+)" default>

```yaml
sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
receivers:
  filelog/syslog:
    include:
      - /var/log/syslog
      - /var/log/**/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout_type: gotime
        layout: '2006-01-02T15:04:05.999999-07:00'
      
      - type: add
        field: attributes.source
        value: "ec2-host-logs"

processors:
  resourcedetection:
    detectors: [ec2, system]
    timeout: 5s
    override: false
    ec2:
      tags:
        - ^Name
        - ^Environment
        - ^Team
  
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  otlphttp:
    endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
    headers:
      authorization: "${env:CLICKSTACK_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [filelog/syslog]
      processors: [resourcedetection, batch]
      exporters: [otlphttp]
EOF
```

</TabItem>
<TabItem value="legacy-linux" label="Legacy Linux (Amazon Linux 2, RHEL, older Ubuntu)">

```yaml
sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
receivers:
  filelog/syslog:
    include:
      - /var/log/messages
      - /var/log/**/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%b %d %H:%M:%S'
      
      - type: add
        field: attributes.source
        value: "ec2-host-logs"

processors:
  resourcedetection:
    detectors: [ec2, system]
    timeout: 5s
    override: false
    ec2:
      tags:
        - ^Name
        - ^Environment
        - ^Team
  
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  otlphttp:
    endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
    headers:
      authorization: "${env:CLICKSTACK_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [filelog/syslog]
      processors: [resourcedetection, batch]
      exporters: [otlphttp]
EOF
```

</TabItem>
</Tabs>
<br/>

**Replace the following in the configuration:**
- `YOUR_CLICKSTACK_HOST`: The hostname or IP address where ClickStack is running
- For local testing, you can use an SSH tunnel (see Troubleshooting section)

This configuration:
- Reads system log files from standard locations (`/var/log/syslog` for Ubuntu, `/var/log/messages` for Amazon Linux/RHEL)
- Parses syslog format to extract structured fields (timestamp, hostname, unit/service, PID, message)
- **Automatically detects and adds EC2 metadata** using the resourcedetection processor
- Optionally includes EC2 tags (Name, Environment, Team) if present
- Sends logs to ClickStack via OTLP HTTP

:::note[EC2 Metadata Enrichment]
The `resourcedetection` processor automatically adds these attributes to every log:
- `cloud.provider`: "aws"
- `cloud.platform`: "aws_ec2"
- `cloud.region`: AWS region (e.g., "us-east-1")
- `cloud.availability_zone`: AZ (e.g., "us-east-1a")
- `cloud.account.id`: AWS account ID
- `host.id`: EC2 instance ID (e.g., "i-1234567890abcdef0")
- `host.type`: Instance type (e.g., "t3.medium")
- `host.name`: Instance hostname
:::

#### Set ClickStack API key {#set-api-key}

Export your ClickStack API key as an environment variable:
```bash
export CLICKSTACK_API_KEY="your-api-key-here"
```

To make this persistent across reboots, add it to your shell profile:
```bash
echo 'export CLICKSTACK_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

#### Run the collector {#run-collector}

Start the OpenTelemetry Collector:
```bash
CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
```

:::note[For production use]
Configure the collector to run as a systemd service so it starts automatically on boot and restarts on failure. See the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/deployment/) for details.
:::

#### Verifying Logs in HyperDX {#verifying-logs}

Once the collector is running, log into HyperDX and verify logs are flowing with EC2 metadata:

1. Navigate to the search view
2. Set source to Logs
3. Filter by `source:ec2-host-logs`
4. Click on a log entry to expand it
5. Verify you see EC2 metadata in the resource attributes:
   - `cloud.provider`
   - `cloud.region`
   - `host.id` (instance ID)
   - `host.type` (instance type)
   - `cloud.availability_zone`

<Image img={search_view} alt="EC2 logs search view"/>
<Image img={log_view} alt="EC2 log detail showing metadata"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the EC2 host logs integration before configuring their production instances, we provide a sample dataset with simulated EC2 metadata.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

Download the sample log file:
```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

The dataset includes:
- System boot sequence
- SSH login activity (successful and failed attempts)
- Security incident (brute force attack with fail2ban response)
- Scheduled maintenance (cron jobs, anacron)
- Service restarts (rsyslog)
- Kernel messages and firewall activity
- Mix of normal operations and notable events

#### Create test collector configuration {#test-config}

Create a file named `ec2-host-logs-demo.yaml` with the following configuration:
```yaml
cat > ec2-host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      
      - type: add
        field: attributes.source
        value: "ec2-demo"

processors:
  # Simulate EC2 metadata for demo (no real EC2 instance required)
  resource:
    attributes:
      - key: service.name
        value: "ec2-demo"
        action: insert
      - key: cloud.provider
        value: "aws"
        action: insert
      - key: cloud.platform
        value: "aws_ec2"
        action: insert
      - key: cloud.region
        value: "us-east-1"
        action: insert
      - key: cloud.availability_zone
        value: "us-east-1a"
        action: insert
      - key: host.id
        value: "i-0abc123def456789"
        action: insert
      - key: host.type
        value: "t3.medium"
        action: insert
      - key: host.name
        value: "prod-web-01"
        action: insert

service:
  pipelines:
    logs/ec2-demo:
      receivers: [filelog/journal]
      processors:
        - resource
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

:::note
For demo purposes, we manually add EC2 metadata using the `resource` processor. In production with real EC2 instances, use the `resourcedetection` processor which automatically queries the EC2 metadata API.
:::

#### Run ClickStack with demo configuration {#run-demo}

Run ClickStack with the demo logs and configuration:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/ec2-host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Verify logs in HyperDX {#verify-demo-logs}

Once the collector is running:

1. Open [HyperDX](http://localhost:8080/) and log in to your account (you may need to create an account first)
2. Navigate to the Search view and set the source to `Logs`
3. Set the time range to **2025-11-10 00:00:00 - 2025-11-13 00:00:00**
4. Filter by `source:ec2-demo`
5. Expand a log entry to view EC2 metadata in the resource attributes

<Image img={search_view_demo} alt="EC2 logs search view"/>
<Image img={log_view_demo} alt="EC2 log detail with metadata"/>

:::note[Timezone Display]
HyperDX displays timestamps in your browser's local timezone. The demo data spans **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. The wide time range ensures you'll see the demo logs regardless of your location. Once you see the logs, you can narrow the range to a 24-hour period for clearer visualizations.
:::

You should see logs with simulated EC2 context including:
- Instance ID: `i-0abc123def456789`
- Region: `us-east-1`
- Availability Zone: `us-east-1a`
- Instance Type: `t3.medium`

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring EC2 host logs with ClickStack, we provide essential visualizations with cloud context.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `host-logs-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import"/>

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

<Image img={logs_dashboard} alt="EC2 logs dashboard"/>

You can filter dashboard visualizations by EC2 context:
- `cloud.region:us-east-1` - Show logs from specific region
- `host.type:t3.medium` - Filter by instance type
- `host.id:i-0abc123def456` - Logs from specific instance

:::note
For the demo dataset, set the time range to **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (adjust based on your local timezone). The imported dashboard will not have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### EC2 metadata not appearing in logs {#no-metadata}

**Verify the EC2 metadata service is accessible:**
```bash
# Get metadata token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Test metadata endpoint
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

If this fails, verify:
- The instance metadata service is enabled
- IMDSv2 is not blocked by security groups
- You're running the collector on the EC2 instance itself

**Check collector logs for metadata errors:**
```bash
# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# If running in foreground, check stdout
```

### No logs appearing in HyperDX {#no-logs}

**Verify syslog files exist and are being written:**
```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**Check collector can read the log files:**
```bash
cat /var/log/syslog | head -20
```

**Verify network connectivity to ClickStack:**
```bash
# Test OTLP endpoint
curl -v http://YOUR_CLICKSTACK_HOST:4318/v1/logs

# Should get a response (even if error, means endpoint is reachable)
```

**Check collector logs for errors:**
```bash
# If running in foreground
# Look for error messages in stdout

# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "error\|failed"
```

### Logs parsing incorrectly {#logs-not-parsing}

**Verify your syslog format:**

For Ubuntu 24.04+:
```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

For Amazon Linux 2 / Ubuntu 20.04:
```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/messages
```

If your format doesn't match, use the appropriate configuration tab in the [Create collector configuration](#create-config) section based on your distribution.

### Collector not starting as systemd service {#systemd-issues}

**Check service status:**
```bash
sudo systemctl status otelcol-contrib
```

**View detailed logs:**
```bash
sudo journalctl -u otelcol-contrib -n 50
```

**Common issues:**
- API key not set correctly in environment
- Config file syntax errors
- Permission issues reading log files

## Next steps {#next-steps}

After setting up EC2 host logs monitoring:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical system events (service failures, authentication failures, disk warnings)
- Filter by EC2 metadata attributes (region, instance type, instance ID) to monitor specific resources
- Correlate EC2 host logs with application logs for comprehensive troubleshooting
- Create custom dashboards for security monitoring (SSH attempts, sudo usage, firewall blocks)
