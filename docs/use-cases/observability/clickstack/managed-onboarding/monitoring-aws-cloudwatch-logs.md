---
slug: /use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs
title: 'Monitoring AWS CloudWatch logs'
description: 'Forward AWS CloudWatch logs into Managed ClickStack via the OpenTelemetry CloudWatch receiver'
doc_type: 'guide'
keywords: ['clickstack', 'aws', 'cloudwatch', 'logs', 'managed', 'observability', 'otel']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';

This guide walks you through forwarding AWS CloudWatch logs into Managed ClickStack using the OpenTelemetry [`awscloudwatch` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver), then viewing them in the ClickStack UI.

The pattern is two collectors in series. A **receiver collector** running close to AWS (on EC2, ECS, EKS, or any host with AWS API access) polls CloudWatch via its API and forwards events to your **ClickStack gateway collector** via OTLP. The gateway writes them to ClickHouse. Splitting the roles keeps AWS credentials on the AWS side and lets the gateway handle all ingestion concerns. For background on the gateway role, see [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles).

This guide assumes you've completed [Setting up your OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) and have a ClickStack gateway collector running.

The gateway can be deployed either as a **Docker container** (see [Setting up your OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)) or as a **Helm release** in Kubernetes via the upstream OpenTelemetry Helm chart with the ClickStack collector image (see [Deploying the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector)). **Ensure you have recorded its OTLP endpoint** and the `OTLP_AUTH_TOKEN` you set when deploying it.

<VerticalStepper headerLevel="h2">

## Gather your prerequisites {#gather-prerequisites}

You'll need:

- An **AWS account** with one or more CloudWatch log groups and credentials with the IAM permissions below.
- A host with **Docker** installed, AWS API access, and outbound network access to your gateway. Typically this is an EC2 instance in the same AWS account and region as the log groups.
- The **OTLP endpoint** of your ClickStack gateway collector, reachable from this host (for example `https://otel.example.com:4318` for a public gateway, or `http://10.0.1.20:4318` for one on a private network).
- The `OTLP_AUTH_TOKEN` value you set on the gateway. If you didn't secure the gateway, you can drop the `authorization` header from the config below.

:::note Why a separate collector
The CloudWatch receiver needs to call the AWS API and requires AWS credentials, so it can't share the ClickStack gateway image. Run it on infrastructure with AWS access, and keep it in the same region as your log groups to minimise latency and API cost.
:::

## Configure AWS credentials {#configure-aws}

The receiver picks up AWS credentials from the standard environment variables. Export them on the host that will run the collector.

**For AWS SSO users:**

```shell
aws sso login --profile YOUR_PROFILE_NAME
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)
aws sts get-caller-identity
```

**For IAM users with long-term credentials:**

```shell
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"
aws sts get-caller-identity
```

The credentials need the following IAM policy to read CloudWatch logs:

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

:::note Production credentials
For production, prefer instance-attached credentials over long-term keys: an IAM role on EC2, IRSA on EKS, or a task role on ECS. The same collector config below works without any credential env vars when the receiver can resolve credentials from the instance metadata service.
:::

## Configure the CloudWatch receiver {#configure-receiver}

Export your gateway endpoint and auth token, then create an `otel-collector-config.yaml`:

```shell
export OTEL_COLLECTOR_ENDPOINT="https://otel.example.com:4318"
export OTLP_AUTH_TOKEN="a-strong-shared-secret"
```

**Example 1: Named log groups (recommended)**

```yaml
# otel-collector-config.yaml
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
    endpoint: ${OTEL_COLLECTOR_ENDPOINT}
    headers:
      authorization: ${OTLP_AUTH_TOKEN}

service:
  pipelines:
    logs:
      receivers: [awscloudwatch]
      processors: [batch]
      exporters: [otlphttp]
```

**Example 2: Autodiscover log groups by prefix**

```yaml
# otel-collector-config.yaml
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
    endpoint: ${OTEL_COLLECTOR_ENDPOINT}
    headers:
      authorization: ${OTLP_AUTH_TOKEN}

service:
  pipelines:
    logs:
      receivers: [awscloudwatch]
      processors: [batch]
      exporters: [otlphttp]
```

Key settings to adjust:

- `region` to match where your log groups live.
- `poll_interval` (`1m` default). Lower values give near-real-time logs at the cost of more AWS API calls.
- `groups.named` for an explicit list, or `groups.autodiscover.prefix` to pick up every group matching a prefix.

For the full set of options, see the [CloudWatch receiver documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver).

:::note Recent logs only
On first run, the receiver checkpoints at the current time and only fetches logs from that point forward. Historical logs aren't backfilled.
:::

## Start the receiver collector {#start-collector}

Create a `docker-compose.yaml` alongside `otel-collector-config.yaml`:

```yaml
# docker-compose.yaml
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
      - OTEL_COLLECTOR_ENDPOINT
      - OTLP_AUTH_TOKEN
    restart: unless-stopped
```

Start the collector:

```shell
docker compose up -d
```

Tail its logs to confirm it's polling CloudWatch and exporting to the gateway:

```shell
docker compose logs -f otel-collector
```

## Confirm in the ClickStack UI {#confirm-in-ui}

Open your service in the [ClickHouse Cloud console](https://console.clickhouse.cloud) and select **ClickStack** from the left menu.

<Image img={clickstack_cloud} size="lg" alt="Launch ClickStack" border/>

In the **Search** view, switch the source to `Logs` and set the time range to **Last 15 minutes**. CloudWatch events should appear within a couple of poll intervals.

<Image img={log_search_view} size="lg" alt="ClickStack Search view with CloudWatch logs"/>

Each event carries the source group and stream as resource attributes:

- `ResourceAttributes['aws.region']`: the AWS region (for example `us-east-1`)
- `ResourceAttributes['cloudwatch.log.group.name']`: the source log group
- `ResourceAttributes['cloudwatch.log.stream']`: the source log stream
- `Body`: the original log line

<Image img={error_log_column_values} size="lg" alt="CloudWatch attributes in the log detail view"/>

If nothing shows up:

- Run `aws sts get-caller-identity` on the collector host to confirm credentials are valid.
- Tail the collector with `docker compose logs -f otel-collector` and look for `AccessDeniedException` (IAM), `security token` errors (expired SSO credentials), or `connection refused` (unreachable gateway).
- Verify `OTEL_COLLECTOR_ENDPOINT` is reachable from the collector host (`curl -v ${OTEL_COLLECTOR_ENDPOINT}`).
- Confirm `OTLP_AUTH_TOKEN` matches the value set on the gateway.

## Import the CloudWatch dashboard (optional) {#import-dashboard}

A pre-built dashboard with log volume, severity breakdown, and error distribution is available for download.

<TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">Download `cloudwatch-logs-dashboard.json`</TrackedLink>, then in the ClickStack UI navigate to **Dashboards**, click the ellipses in the upper right, and select **Import Dashboard**.

<Image img={import_dashboard} size="lg" alt="Import dashboard button"/>

Upload the JSON file and click **Finish Import**.

<Image img={finish_import} size="lg" alt="Finish import dialog"/>

The dashboard is created with all visualisations wired up to the logs source.

<Image img={example_dashboard} size="lg" alt="CloudWatch Logs dashboard"/>

## Further reading {#further-reading}

- [AWS CloudWatch logs integration reference](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) for the demo dataset, full troubleshooting, and tuning options.
- [Securing the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) with TLS on the OTLP endpoint and least-privilege ingestion users.
- [Processing, filtering, and enriching](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) events at the gateway.
- [Going to production](/use-cases/observability/clickstack/production) for recommendations when going to production.

</VerticalStepper>
