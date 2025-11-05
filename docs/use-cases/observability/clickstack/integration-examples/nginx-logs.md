---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'Monitoring Nginx logs with ClickStack'
sidebar_label: 'Nginx logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring nginx logs with ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-logs-import.png';
import example_dashboard from '@site/static/images/clickstack/nginx-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';
import search_view from '@site/static/images/clickstack/nginx-logs-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring nginx Logs with ClickStack {#nginx-clickstack}

:::note[TL;DR]
This guide shows you how to monitor nginx with ClickStack by configuring the OpenTelemetry collector to ingest nginx access logs. You'll learn how to:

- Configure nginx to output JSON-formatted logs
- Create a custom OTel collector configuration for log ingestion
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize nginx metrics

A demo dataset with sample logs is available if you want to test the integration before configuring your production nginx.

Time Required: 5-10 minutes
:::

## Integration with existing nginx {#existing-nginx}

This section covers configuring your existing nginx installation to send logs to ClickStack by modifying the ClickStack OTel collector configuration.
If you would like to test the integration before configuring your own existing setup, you can test with our preconfigured setup and sample data in the [following section](/use-cases/observability/clickstack/integrations/nginx#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running
- Existing nginx installation
- Access to modify nginx configuration files

<VerticalStepper headerLevel="h4">

#### Configure nginx log format {#configure-nginx}
First, configure nginx to output logs in JSON format for easier parsing. Add this log format definition to your nginx.conf:

The `nginx.conf` file is typically located at:
- **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
- **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` or `/opt/homebrew/etc/nginx/nginx.conf`
- **Docker**: Configuration is usually mounted as a volume

Add this log format definition to the `http` block:

```nginx
http {
    log_format json_combined escape=json
    '{'
      '"time_local":"$time_local",'
      '"remote_addr":"$remote_addr",'
      '"request_method":"$request_method",'
      '"request_uri":"$request_uri",'
      '"status":$status,'
      '"body_bytes_sent":$body_bytes_sent,'
      '"request_time":$request_time,'
      '"upstream_response_time":"$upstream_response_time",'
      '"http_referer":"$http_referer",'
      '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;
    error_log /var/log/nginx/error.log warn;
}
```

After making this change, reload nginx.

#### Create custom OTel collector configuration {#custom-otel}

ClickStack allows you to extend the base OpenTelemetry Collector configuration by mounting a custom configuration file and setting an environment variable. The custom configuration is merged with the base configuration managed by HyperDX via OpAMP.

Create a file named nginx-monitoring.yaml with the following configuration:

```yaml
receivers:
  filelog:
    include:
      - /var/log/nginx/access.log
      - /var/log/nginx/error.log
    start_at: end 
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx"

service:
  pipelines:
    logs/nginx:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

This configuration:
- Reads nginx logs from their standard locations
- Parses JSON log entries
- Extracts and preserves the original log timestamps
- Adds source: nginx attribute for filtering in HyperDX
- Routes logs to the ClickHouse exporter via a dedicated pipeline

:::note
- You only define new receivers and pipelines in the custom config
- The processors (memory_limiter, transform, batch) and exporters (clickhouse) are already defined in the base ClickStack configuration - you just reference them by name
- The time_parser operator extracts timestamps from nginx's time_local field to preserve original log timing
- The pipelines route data from your receivers to the ClickHouse exporter via the existing processors
:::

#### Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at /etc/otelcol-contrib/custom.config.yaml
2. Set the environment variable CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
3. Mount your nginx log directories so the collector can read them

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
      - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/nginx:/var/log/nginx:ro
      # ... other volumes ...
```

##### Option 2: Docker Run (All-in-One Image) {#all-in-one}

If using the all-in-one image with docker run:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Ensure the ClickStack collector has appropriate permissions to read the nginx log files. In production, use read-only mounts (:ro) and follow the principle of least privilege.
:::

#### Verifying Logs in HyperDX {#verifying-logs}
Once configured, log into HyperDX and verify logs are flowing:

1. Navigate to the search view
2. Set source to Logs, and verify you see log entries with fields like request, request_time, upstream_response_time, etc.

This is an example of what you should see:

<Image img={search_view} alt="Log view"/>

<Image img={log_view} alt="Log view"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the nginx integration before configuring their production systems, we provide a sample dataset of pre-generated nginx access logs with realistic traffic patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

```bash
# Download the logs
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

The dataset includes:
- Log entries with realistic traffic patterns
- Various endpoints and HTTP methods
- Mix of successful requests and errors
- Realistic response times and byte counts

#### Create test collector configuration {#test-config}

Create a file named `nginx-demo.yaml` with the following configuration:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # Read from beginning for demo data
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx-demo"

service:
  pipelines:
    logs/nginx-demo:
      receivers: [filelog]
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
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Verify logs in HyperDX {#verify-demo-logs}

Once ClickStack is running (you may have to create an account and login first):

1. Open [HyperDX with demo time range](http://localhost:8080/search?from=1760976000000&to=1761062400000&isLive=false&source=690235c1a9b7fc5a7c0fffc7&select=Timestamp,ServiceName,SeverityText,Body&where=&whereLanguage=lucene&filters=[]&orderBy=)

Here's what you should see in your search view:

:::note
If you don't see logs, ensure the time range is set to 2025-10-20 11:00:00 - 2025-10-21 11:00:00 and 'Logs' is selected as the source. Using the link is important to get the proper time range of results.
:::

<Image img={search_view} alt="Log view"/>

<Image img={log_view} alt="Log view"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring nginx with ClickStack, we provide essential visualizations for nginx logs.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}
1. Open HyperDX and navigate to the Dashboards section.
2. Click "Import Dashboard" in the upper right corner under the ellipses.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the nginx-logs-dashboard.json file and click finish import.

<Image img={finish_import} alt="Finish Import"/>

#### The dashboard will be created with all visualizations pre-configured {#created-dashboard}

:::note
Ensure the time range is set to 2025-10-20 11:00:00 - 2025-10-21 11:00:00. The imported dashboard will not have a time range specified by default.
:::

<Image img={example_dashboard} alt="Example Dashboard"/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

- Verify the environment variable CUSTOM_OTELCOL_CONFIG_FILE is set correctly

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

- Check that the custom config file is mounted at /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

- View the custom config content to verify it's readable

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### No logs appearing in HyperDX {#no-logs}

- Ensure nginx is writing JSON logs 
```bash
tail -f /var/log/nginx/access.log
```
- Check the collector can read the logs 
```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

- Verify the effective config includes your filelog receiver 
```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

- Check for errors in the collector logs
```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```

## Next steps {#next-steps}
If you want to explore further, here are some next steps to experiment with your dashboard

- Set up alerts for critical metrics (error rates, latency thresholds)
- Create additional dashboards for specific use cases (API monitoring, security events)
