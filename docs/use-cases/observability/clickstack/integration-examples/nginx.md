---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'Monitoring Nginx with ClickStack'
sidebar_label: 'Nginx'
pagination_prev: null
pagination_next: null
description: 'Monitoring Nginx with ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/example-dashboard.png';

# Monitoring Nginx with ClickStack {#nginx-clickstack}

::::note[TLDR]
This guide shows you how to monitor nginx with ClickStack by configuring the OpenTelemetry collector to ingest nginx access logs. You'll learn how to:

- Configure nginx to output JSON-formatted logs
- Create a custom OTel collector configuration for log ingestion
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize nginx metrics (requests, errors, latency)

A demo dataset with 10,000 sample logs is provided to test the integration before connecting your production nginx instances.

Time Required: 5-10 minutes.
::::

## Prerequisites {#prerequisites}
- ClickStack instance running
- Existing nginx installation
- Access to modify nginx configuration files

## Integration with existing nginx {#existing-nginx}

This section covers configuring your existing nginx installation to send logs to ClickStack by modifying the ClickStack OTel collector configuration.

<VerticalStepper>

## Configure nginx log format {#configure-nginx}
First, configure nginx to output logs in JSON format for easier parsing. Add this log format definition to your nginx.conf:

```json
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

## Create custom otel collector configuration {#custom-otel}

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

::::note
- You only define new receivers and pipelines in the custom config
- The processors (memory_limiter, transform, batch) and exporters (clickhouse) are already defined in the base ClickStack configuration - you just reference them by name
- The time_parser operator extracts timestamps from nginx's time_local field to preserve original log timing
- The pipelines route data from your receivers to the ClickHouse exporter via the existing processors
::::

## Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at /etc/otelcol-contrib/custom.config.yaml
2. Set the environment variable CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
3. Mount your nginx log directories so the collector can read them

Update your ClickStack deployment configuration to include these settings, this example uses docker compose.

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

::::note
Ensure the ClickStack collector has appropriate permissions to read the nginx log files. In production, use read-only mounts (:ro) and follow the principle of least privilege.
::::

## Verifying Logs in ClickStack {#verifying-logs}
Once configured, log into HyperDX and verify logs are flowing:

1. Navigate to the Logs view
2. Filter by source:nginx to see only nginx logs
3. Verify you see JSON-parsed log entries with fields like request_method, request_uri, status, etc.
</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

- Verify the environment variable CUSTOM_OTELCOL_CONFIG_FILE is set correctly
- Check that the custom config file is mounted at /etc/otelcol-contrib/custom.config.yaml
- Verify the file is mounted as a file, not a directory: docker exec `<container>` ls -la /etc/otelcol-contrib/

### No logs appearing in HyperDX {#no-logs}

- Ensure nginx is writing JSON logs: tail -f /var/log/nginx/access.log
- Check the collector can read the logs: docker exec `<container>` cat /var/log/nginx/access.log
- Verify the effective config includes your filelog receiver: docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
- Check for errors in the collector logs: docker exec `<container>` cat /etc/otel/supervisor-data/agent.log

## Demo dataset {#demo-dataset}

For users who want to test the nginx integration before configuring their production systems, we provide a sample dataset of pre-generated nginx access logs with realistic traffic patterns.

<VerticalStepper>

## Using the Sample Dataset {#using-data}

1. [Download](../../../../../static/examples/nginx-sample-logs.json) and place the sample file in `/tmp/nginx-demo/access.log` 

2. **Create a test collector config** (`nginx-demo.yaml`):

```yaml
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
```

3. **Run ClickStack with the demo config:**

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /tmp/nginx-demo:/tmp/nginx-demo:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

4. **Verify in HyperDX:**

- Navigate to the Logs view
- Filter by `source:nginx-demo`
- Set time range to last 24 hours
- You should see ~10,000 log entries

You can query the data to verify patterns:

```shell
docker exec clickstack-demo clickhouse-client --query "
SELECT 
  toHour(Timestamp) as hour,
  count() as total_logs,
  countIf(toInt32(LogAttributes['status']) >= 500) as server_errors,
  countIf(toInt32(LogAttributes['status']) >= 400 AND toInt32(LogAttributes['status']) < 500) as client_errors,
  round(avg(toFloat64OrNull(LogAttributes['request_time'])), 3) as avg_response_time
FROM default.otel_logs 
WHERE LogAttributes['source'] = 'nginx-demo'
GROUP BY hour
ORDER BY hour
"
```

::::note 
The demo dataset uses dynamic timestamps (last 24 hours from generation). The traffic patterns are intentionally dramatic to make visualizations clear and obvious in dashboards.
::::
</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring nginx with ClickStack, we provide a pre-built dashboard with essential nginx metrics and visualizations.

### Import Pre-built Dashboard {#import-dashboard}
[Download](../../../../../static/examples/example-dashboard.json) the dashboard configuration.

1. Open HyperDX and navigate to the Dashboards section.
2. Click "Import Dashboard" in the upper right corner under the elipses.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the Example Dashboard.json file and click finish import.

<Image img={finish_import} alt="Finish Import"/>

4. The dashboard will be created with all visualizations pre-configured.

<Image img={example_dashboard} alt="Example Dashboard"/>

### Customizing the Dashboard {#customizing}

The dashboard can be customized to fit your specific needs:
- Filter by specific endpoints, methods, or other log attributes
- Change time buckets for different zoom levels
- Create additional charts for metrics like:
  - Top requested endpoints
  - Geographic distribution (if using IP geolocation)
  - User agent analysis
  - Bytes sent/received trends

## Next Steps {#next-steps}
If you want to explore further, here are some next steps to experiment with your dashboard

- Set up alerts for critical metrics (error rates, latency thresholds)
- Create additional dashboards for specific use cases (API monitoring, security events)
- Correlate with other data sources by adding traces and metrics to the same dashboard
