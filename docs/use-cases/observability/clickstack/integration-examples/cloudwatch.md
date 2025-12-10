---
slug: /use-cases/observability/clickstack/integrations/aws-cloudwatch-logs
title: 'Monitoring AWS CloudWatch Logs with ClickStack'
sidebar_label: 'AWS CloudWatch Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring AWS CloudWatch Logs with ClickStack'
doc_type: 'guide'
keywords: ['AWS', 'CloudWatch', 'OTEL', 'ClickStack', 'logs']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view.png';
import demo_search_view from '@site/static/images/clickstack/cloudwatch/demo-search-view.png';
import error_log_overview from '@site/static/images/clickstack/cloudwatch/error-log-overview.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring AWS CloudWatch Logs with ClickStack {#cloudwatch-clickstack}

:::note[TL;DR]
This guide shows you how to forward AWS CloudWatch logs to ClickStack using the OpenTelemetry Collector's AWS CloudWatch receiver. You'll learn how to:
- Configure the OpenTelemetry Collector to pull logs from CloudWatch
- Set up AWS credentials and IAM permissions
- Send CloudWatch logs to ClickStack via OTLP
- Filter and autodiscover log groups
- Use a pre-built dashboard to visualize CloudWatch log patterns

A demo dataset with sample logs is available if you want to test the integration before configuring your production AWS environment.

Time Required: 10-15 minutes
:::

## Overview {#overview}

AWS CloudWatch is a monitoring service for AWS resources and applications. While CloudWatch provides log aggregation, forwarding logs to ClickStack allows you to:
- Analyze logs alongside metrics and traces in a unified platform
- Query logs using ClickHouse's SQL interface
- Reduce costs by archiving or reducing CloudWatch retention

This guide shows you how to forward CloudWatch logs to ClickStack using the OpenTelemetry Collector.

## Integration with existing CloudWatch log groups {#existing-cloudwatch}

This section covers configuring the OpenTelemetry Collector to pull logs from your existing CloudWatch log groups and forward them to ClickStack.

If you would like to test the integration before configuring your production setup, you can test with our demo dataset in the [demo dataset section](#demo-dataset).

### Prerequisites {#prerequisites}
- ClickStack instance running
- AWS account with CloudWatch log groups
- AWS credentials with appropriate IAM permissions
- Docker installed (for running the OpenTelemetry Collector)

<VerticalStepper headerLevel="h4">

#### Get ClickStack API key {#get-api-key}

The OpenTelemetry Collector sends data to ClickStack's OTLP endpoint, which requires authentication.

1. Open HyperDX at your ClickStack URL (e.g., http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

Save this as an environment variable:
```bash
export CLICKSTACK_API_KEY="your-api-key-here"
```

#### Configure AWS credentials {#configure-aws}

Export your AWS credentials as environment variables. The method depends on your authentication type:

**For AWS SSO users (recommended for most organizations):**
```bash
# Login to SSO
aws sso login --profile YOUR_PROFILE_NAME

# Export credentials to environment variables
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

# Verify credentials work
aws sts get-caller-identity
```

Replace `YOUR_PROFILE_NAME` with your AWS SSO profile name (e.g., `AccountAdministrators-123456789`).

**For IAM users with long-term credentials:**
```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"

# Verify credentials work
aws sts get-caller-identity
```

**Required IAM permissions:**

The AWS account associated with these credentials needs the following IAM policy to read CloudWatch logs:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchLogsRead",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:FilterLogEvents"
      ],
      "Resource": "arn:aws:logs:*:YOUR_ACCOUNT_ID:log-group:*"
    }
  ]
}
```

Replace `YOUR_ACCOUNT_ID` with your AWS account ID.

#### Configure the CloudWatch receiver {#configure-receiver}

Create an `otel-collector-config.yaml` file with the CloudWatch receiver configuration.

**Example 1: Named log groups (recommended)**

This configuration collects logs from specific named log groups:
```yaml
receivers:
  awscloudwatch:
    region: us-east-1
    logs:
      poll_interval: 1m
      max_events_per_request: 100
      groups:
        named:
          /aws/lambda/my-function:
          /aws/ecs/my-service:
          /aws/eks/my-cluster/cluster:

processors:
  batch:
    timeout: 10s

exporters:
  otlphttp:
    endpoint: http://localhost:4318
    headers:
      authorization: ${CLICKSTACK_API_KEY}

service:
  pipelines:
    logs:
      receivers: [awscloudwatch]
      processors: [batch]
      exporters: [otlphttp]
```

**Example 2: Autodiscover log groups with prefix**

This configuration autodiscovers and collects logs from up to 100 log groups starting with the prefix `/aws/lambda`:
```yaml
receivers:
  awscloudwatch:
    region: us-east-1
    logs:
      poll_interval: 1m
      max_events_per_request: 100
      groups:
        autodiscover:
          limit: 100
          prefix: /aws/lambda

processors:
  batch:
    timeout: 10s

exporters:
  otlphttp:
    endpoint: http://localhost:4318
    headers:
      authorization: ${CLICKSTACK_API_KEY}

service:
  pipelines:
    logs:
      receivers: [awscloudwatch]
      processors: [batch]
      exporters: [otlphttp]
```

**Configuration parameters:**
- `region`: AWS region where your log groups are located
- `poll_interval`: How often to check for new logs (e.g., `1m`, `5m`)
- `max_events_per_request`: Maximum number of log events to fetch per request
- `groups.autodiscover.limit`: Maximum number of log groups to discover
- `groups.autodiscover.prefix`: Filter log groups by prefix
- `groups.named`: Explicitly list log group names to collect

For more configuration options, see the [CloudWatch receiver documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver).

**Replace the following:**
- `${CLICKSTACK_API_KEY}` → Uses the environment variable you set earlier
- `http://localhost:4318` → Your ClickStack endpoint (use your ClickStack host if running remotely)
- `us-east-1` → Your AWS region
- Log group names/prefixes → Your actual CloudWatch log groups

:::note
The CloudWatch receiver only fetches logs from recent time windows (based on `poll_interval`). When first started, it begins from the current time. Historical logs are not retrieved by default.
:::

#### Start the collector {#start-collector}

Create a `docker-compose.yaml` file:

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-config.yaml
    environment:
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
      - AWS_SESSION_TOKEN
      - AWS_REGION
      - CLICKSTACK_API_KEY
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Then start the collector:

```bash
docker compose up -d
```

View collector logs:

```bash
docker compose logs -f otel-collector
```

#### Verify logs in HyperDX {#verify-logs}

Once the collector is running:

1. Open HyperDX at http://localhost:8080 (or your ClickStack URL)
2. Navigate to the **Logs** view
3. Wait 1-2 minutes for logs to appear (based on your poll interval)
4. Search for logs from your CloudWatch log groups

<Image img={log_search_view} alt="Log Search View"/>

Look for these key attributes in the logs:
- `ResourceAttributes['aws.region']`: Your AWS region (e.g., "us-east-1")
- `ResourceAttributes['cloudwatch.log.group.name']`: The CloudWatch log group name
- `ResourceAttributes['cloudwatch.log.stream']`: The log stream name
- `Body`: The actual log message content

<Image img={error_log_column_values} alt="Error Log Column Values"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the CloudWatch logs integration before configuring their production AWS environment, we provide a sample dataset with pre-generated logs showing realistic patterns from multiple AWS services.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/aws/cloudwatch/cloudwatch-logs.jsonl
```

The dataset includes 24 hours of CloudWatch logs from multiple services:
- **Lambda functions**: Payment processing, order management, authentication
- **ECS services**: API gateway with rate limiting and timeouts
- **Background jobs**: Batch processing with retry patterns

#### Start ClickStack {#start-clickstack}

If you don't already have ClickStack running:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Wait a few moments for ClickStack to fully start up.

#### Import the demo dataset {#import-demo-data}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_logs FORMAT JSONEachRow
" < cloudwatch-logs.jsonl
```

This imports the logs directly into ClickStack's logs table.

#### Verify the demo data {#verify-demo-logs}

Once imported:

1. Open HyperDX at http://localhost:8080 and log in (create an account if needed)
2. Navigate to the **Logs** view
3. Set the time range to **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**
4. Search for `cloudwatch-demo` or filter by `LogAttributes['source'] = 'cloudwatch-demo'`

You should see logs from multiple CloudWatch log groups.

<Image img={demo_search_view} alt="Demo search view"/>

:::note[Timezone Display]
HyperDX displays timestamps in your browser's local timezone. The demo data spans **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**. Set your time range to **2025-12-06 00:00:00 - 2025-12-09 00:00:00** to ensure you see the demo logs regardless of your location. Once you see the logs, you can narrow the range to a 24-hour period for clearer visualizations.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you monitor CloudWatch logs with ClickStack, we provide a pre-built dashboard with essential visualizations.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `cloudwatch-logs-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

<Image img={example_dashboard} alt="CloudWatch Logs dashboard"/>

:::note
For the demo dataset, set the time range to **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** (adjust based on your local timezone). The imported dashboard will not have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No logs appearing in HyperDX {#no-logs}

**Verify AWS credentials are configured:**

```bash
aws sts get-caller-identity
```

If this fails, your credentials are invalid or expired.

**Check IAM permissions:**
Ensure your AWS credentials have the required `logs:DescribeLogGroups` and `logs:FilterLogEvents` permissions.

**Check collector logs for errors:**
```bash
# If using Docker directly, logs appear in stdout
# If using Docker Compose:
docker compose logs otel-collector
```

Common errors:
- `The security token included in the request is invalid`: Credentials are invalid or expired. For temporary credentials (SSO), ensure `AWS_SESSION_TOKEN` is set.
- `operation error CloudWatch Logs: FilterLogEvents, AccessDeniedException`: IAM permissions are insufficient
- `failed to refresh cached credentials, no EC2 IMDS role found`: AWS credentials environment variables are not set
- `connection refused`: ClickStack endpoint is unreachable

**Verify CloudWatch log groups exist and have recent logs:**
```bash
# List your log groups
aws logs describe-log-groups --region us-east-1

# Check if a specific log group has recent logs (last hour)
aws logs filter-log-events \
  --log-group-name /aws/lambda/my-function \
  --region us-east-1 \
  --start-time $(date -u -v-1H +%s)000 \
  --max-items 5
```

### Only seeing old logs or missing recent logs {#missing-recent}

**The CloudWatch receiver starts from "now" by default:**

When the collector first starts, it creates a checkpoint at the current time and only fetches logs after that point. Historical logs are not retrieved.

**To collect recent historical logs:**

Stop and remove the collector's checkpoint, then restart:
```bash
# Stop the collector
docker stop <container-id>

# Restart fresh (checkpoints are stored in container, so removing it resets)
docker run --rm ...
```

The receiver will create a new checkpoint and fetch logs from the current time forward.

### Invalid security token / credentials expired {#expired-credentials}

If using temporary credentials (AWS SSO, assumed role), they expire after a period of time.

**Re-export fresh credentials:**
```bash
# For SSO users:
aws sso login --profile YOUR_PROFILE_NAME
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

# For IAM users:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Restart the collector
docker restart <container-id>
```

### High latency or missing recent logs {#latency}

**Reduce poll interval:**
The default `poll_interval` is 1 minute. For near-real-time logs, reduce it:
```yaml
logs:
  poll_interval: 30s  # Poll every 30 seconds
```

**Note:** Lower poll intervals increase AWS API calls and may incur higher CloudWatch API costs.

### Collector using too much memory {#memory}

**Reduce batch size or increase timeout:**
```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 100
```

**Limit autodiscovery:**
```yaml
groups:
  autodiscover:
    limit: 50  # Reduce from 100 to 50
```

## Next steps {#next-steps}

Now that you have CloudWatch logs flowing into ClickStack:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical events (connection failures, error spikes)
- Reduce CloudWatch costs by adjusting retention periods or archiving to S3, now that you have logs in ClickStack
- Filter noisy log groups by removing them from the collector configuration to reduce ingestion volume
