---
slug: /use-cases/observability/clickstack/integrations/systemd-logs
title: 'Monitoring Systemd Logs with ClickStack'
sidebar_label: 'Systemd/Journald Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring Systemd and Journald Logs with ClickStack'
doc_type: 'guide'
keywords: ['systemd', 'journald', 'journal', 'OTEL', 'ClickStack', 'system logs', 'systemctl']
---
import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Systemd Logs with ClickStack {#systemd-logs-clickstack}

:::note[TL;DR]
This guide shows you how to monitor systemd journal logs with ClickStack by running the OpenTelemetry Collector with the journald receiver. You'll learn how to:
- Deploy the OpenTelemetry Collector to read systemd journal entries
- Send systemd logs to ClickStack via OTLP
- Use a pre-built dashboard to visualize systemd log insights (service status, errors, authentication events)

A demo dataset with sample logs is available if you want to test the integration before configuring your production systems.

Time Required: 10-15 minutes
:::

## Integration with existing systems {#existing-systems}

Monitor your existing Linux system's journald logs by running the OpenTelemetry Collector with the journald receiver to collect system logs and send them to ClickStack via OTLP.

If you want to test this integration first without modifying your existing setup, skip to the [demo dataset section](#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running
- Linux system with systemd (Ubuntu 16.04+, CentOS 7+, Debian 8+, etc.)
- Network access between ClickStack and the system being monitored
- Docker or Docker Compose installed on the monitored system

<VerticalStepper headerLevel="h4">

#### Get ClickStack API key {#get-api-key}

The OpenTelemetry Collector sends data to ClickStack's OTLP endpoint, which requires authentication.

1. Open HyperDX at your ClickStack URL (e.g., http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

5. Set it as an environment variable:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Verify systemd journal is running {#verify-systemd}

Ensure your system is using systemd and has journal logs:

```bash
# Check systemd version
systemctl --version

# View recent journal entries
journalctl -n 20

# Check journal disk usage
journalctl --disk-usage
```

If journal storage is in memory only, enable persistent storage:

```bash
# Create journal directory for persistent storage
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald

# Verify persistent storage
journalctl --verify
```

#### Create OpenTelemetry Collector configuration {#create-otel-config}

Create a configuration file for the OpenTelemetry Collector:

```yaml
cat > otel-config.yaml << 'EOF'
receivers:
  journald:
    directory: /var/log/journal
    priority: info
    units:
      - sshd
      - nginx
      - docker
      - containerd
      - systemd

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  
  resource:
    attributes:
      - key: service.name
        value: systemd-logs
        action: insert
      - key: host.name
        from_attribute: _HOSTNAME
        action: upsert
  
  attributes:
    actions:
      - key: unit
        from_attribute: _SYSTEMD_UNIT
        action: upsert
      - key: priority
        from_attribute: PRIORITY
        action: upsert

exporters:
  otlphttp:
    endpoint: ${CLICKSTACK_ENDPOINT}
    headers:
      authorization: ${CLICKSTACK_API_KEY}

service:
  pipelines:
    logs:
      receivers: [journald]
      processors: [resource, attributes, batch]
      exporters: [otlphttp]
EOF
```

**Configuration breakdown:**

| Section | Parameter | Description |
|---------|-----------|-------------|
| `receivers.journald` | `directory` | Path to journal files (default: `/var/log/journal`) |
| | `units` | Specific systemd units to collect (empty = all units) |
| | `priority` | Minimum log priority: emerg, alert, crit, err, warning, notice, info, debug |
| `processors.resource` | `service.name` | Logical service name for grouping logs |
| | `host.name` | Hostname extracted from journal metadata |
| `processors.attributes` | `unit` | Systemd unit name (service, timer, etc.) |
| | `priority` | Syslog priority level |
| `exporters.otlphttp` | `endpoint` | ClickStack OTLP endpoint |
| | `authorization` | API key for authentication |

#### Deploy with Docker Compose {#deploy-docker-compose}

This example shows deploying the OTel Collector alongside ClickStack. Adjust service names and endpoints to match your existing deployment:

```yaml
services:
  clickstack:
    image: clickhouse/clickstack-all-in-one:latest
    ports:
      - "8080:8080"
      - "4317:4317"
      - "4318:4318"
    networks:
      - monitoring
  
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.115.1
    depends_on:
      - clickstack
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      - CLICKSTACK_ENDPOINT=http://clickstack:4318
    volumes:
      - ./otel-config.yaml:/etc/otelcol/config.yaml:ro
      - /var/log/journal:/var/log/journal:ro
      - /run/log/journal:/run/log/journal:ro
      - /etc/machine-id:/etc/machine-id:ro
    command: ["--config=/etc/otelcol/config.yaml"]
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

**Key configuration points:**
- `otel/opentelemetry-collector-contrib:0.115.1` - Official image includes `journalctl` binary
- `/var/log/journal:/var/log/journal:ro` - Persistent journal storage
- `/run/log/journal:/run/log/journal:ro` - Volatile journal storage
- `/etc/machine-id:/etc/machine-id:ro` - Required for journal identification
- `http://clickstack:4318` - OTLP HTTP endpoint (use your ClickStack hostname)

Start the services:

```bash
docker compose up -d
```

#### Alternative: Docker Run {#docker-run}

If not using Docker Compose, run the collector directly:

```bash
docker run -d --name otel-collector \
  --network host \
  -e CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY} \
  -e CLICKSTACK_ENDPOINT=http://localhost:4318 \
  -v "$(pwd)/otel-config.yaml:/etc/otelcol/config.yaml:ro" \
  -v /var/log/journal:/var/log/journal:ro \
  -v /run/log/journal:/run/log/journal:ro \
  -v /etc/machine-id:/etc/machine-id:ro \
  otel/opentelemetry-collector-contrib:0.115.1 \
  --config=/etc/otelcol/config.yaml
```

:::note
The collector container requires:
- Access to `/var/log/journal` (persistent journal storage)
- Access to `/run/log/journal` (volatile journal storage)
- Access to `/etc/machine-id` for journal identification
- The `journalctl` command is available in the official OpenTelemetry Collector Contrib image
:::

#### Verify logs in HyperDX {#verifying-logs}

Once configured, log into HyperDX and verify logs are flowing:

1. Navigate to the Search view
2. Set source to Logs
3. Filter by `service.name:systemd-logs` to see systemd-specific logs
4. You should see structured log entries with fields like `unit`, `priority`, `MESSAGE`, `_HOSTNAME`, etc.

To generate test logs:

```bash
# Generate test log entries
logger -t test-app "Testing systemd logs integration"

# Restart services to generate logs
sudo systemctl restart ssh
sudo systemctl restart cron

# View the logs
journalctl -t test-app -n 5
journalctl -u ssh -n 10
```

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the systemd logs integration before configuring their production systems, we provide a sample dataset of pre-generated systemd journal logs with realistic patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

Download the binary journal file:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/systemd/system.journal
```

The dataset includes:
- Service start/stop events (nginx, docker, sshd)
- Failed SSH login attempts (brute force attack pattern)
- Systemd unit failures and restarts
- Kernel messages
- User session activity
- Cron job executions

#### Prepare the journal directory {#prepare-journal}

Create the directory structure required by the journald receiver:

```bash
# Create directory with the machine ID from the demo data
mkdir -p demo-journal/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
mv system.journal demo-journal/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/
```

#### Build ClickStack image with journalctl {#build-image}

The journald receiver requires the `journalctl` binary. Create a custom image:

```bash
cat > Dockerfile << 'EOF'
FROM clickhouse/clickstack-all-in-one:latest
RUN apk add --no-cache systemd
EOF

docker build -t clickstack-with-journalctl .
```

:::note
This adds the `systemd` package (which includes `journalctl`) to the ClickStack image. This is only needed for the demo - production deployments use the separate OTel Collector which already has journalctl.
:::

#### Create demo collector configuration {#demo-config}

Create a configuration file for the demo:

```bash
cat > systemd-demo.yaml << 'EOF'
receivers:
  journald:
    directory: /var/log/journal
    priority: info

service:
  pipelines:
    logs/systemd-demo:
      receivers: [journald]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Run ClickStack with demo data {#run-demo}

Start ClickStack with the demo journal:

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/systemd-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/demo-journal:/var/log/journal:ro" \
  clickstack-with-journalctl
```

#### Verify logs in HyperDX {#verify-demo-logs}

Once ClickStack is running:

1. Open [HyperDX](http://localhost:8080/) and log in to your account (you may need to create an account first)
2. Navigate to the Search view and set the source to `Logs`
3. Set the time range to **2025-11-14 00:00:00 - 2025-11-17 00:00:00**

:::note[Timezone Display]
HyperDX displays timestamps in your browser's local timezone. The demo data spans **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)**. The wide time range ensures you'll see the demo logs regardless of your location. Once you see the logs, you can narrow the range to a 24-hour period for clearer visualizations.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring systemd logs with ClickStack, we provide essential visualizations for systemd journal data.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/systemd-logs-dashboard.json')} download="systemd-logs-dashboard.json" eventName="docs.systemd_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `systemd-logs-dashboard.json` file and click **Finish Import**

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

Key visualizations include:
- Log volume over time by priority
- Top systemd units generating logs
- Service failures and restarts
- SSH authentication attempts
- Error and warning trends
- Unit status changes

:::note
For the demo dataset, set the time range to **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** (adjust based on your local timezone). The imported dashboard will not have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No logs appearing in HyperDX {#no-logs}

**Verify API key is set and passed to the container:**

```bash
# Check environment variable
echo $CLICKSTACK_API_KEY

# Verify it's in the container (for separate collector)
docker exec otel-collector env | grep CLICKSTACK_API_KEY
```

If missing, set it and restart:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d otel-collector
```

**Check if logs are reaching ClickHouse:**

```bash
docker exec clickstack clickhouse-client --query "
SELECT COUNT(*) as log_count
FROM otel_logs
WHERE ServiceName = 'systemd-logs'
"
```

If you don't see any results, check the collector logs:

```bash
docker logs otel-collector | grep -i "error\|journald" | tail -20
```

**Verify journal access from container:**

```bash
# Check journal directory is mounted
docker exec otel-collector ls -la /var/log/journal

# Check machine-id is mounted
docker exec otel-collector cat /etc/machine-id
```

### Authentication errors {#auth-errors}

If you see `Authorization failed` or `401 Unauthorized` in the collector logs:

1. Verify the API key in HyperDX UI (Settings → API Keys → Ingestion API Key)
2. Re-export and restart:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
```

### Permission denied errors {#permission-denied}

If the collector logs show permission errors when accessing the journal:

```bash
# Option 1: Run container as root (add to docker-compose.yaml)
otel-collector:
  user: root
  # ... rest of config

# Option 2: Add systemd-journal group (more complex, requires matching GID)
```

### Journal files not found {#journal-not-found}

If the collector can't find journal files:

```bash
# Check if systemd is using persistent storage
journalctl --disk-usage

# If using volatile storage only, enable persistent:
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald

# Verify persistent storage exists
ls -la /var/log/journal/
```

### Network connectivity issues {#network-issues}

If the collector logs show `Connection refused`:

Verify all containers are on the same Docker network:

```bash
docker compose ps
docker network inspect <network-name>
```

Test connectivity:

```bash
# From collector to ClickStack
docker exec otel-collector sh -c "timeout 2 sh -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```

## Going to production {#going-to-production}

This guide uses a separate OpenTelemetry Collector to read systemd logs and send them to ClickStack's OTLP endpoint, which is the recommended production pattern.

For production environments with multiple hosts, consider:
- Deploying the collector as a DaemonSet in Kubernetes
- Running the collector as a systemd service on each host
- Centralizing configuration management via OpAMP
- Using the OpenTelemetry Operator for automated deployment

See [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production deployment patterns and collector configuration examples.
