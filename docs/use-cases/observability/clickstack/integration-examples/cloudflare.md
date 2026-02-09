---
slug: /use-cases/observability/clickstack/integrations/cloudflare
title: 'Monitoring Cloudflare Logs with ClickStack'
sidebar_label: 'Cloudflare Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring Cloudflare Logs with ClickStack'
doc_type: 'guide'
keywords: ['Cloudflare', 'CDN', 'WAF', 'logs', 'ClickStack', 'ClickPipes', 'S3', 'SQS']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Cloudflare Logs with ClickStack {#cloudflare-clickstack}

:::note[TL;DR]
This guide shows you how to ingest Cloudflare logs into ClickStack using AWS S3, SQS, and ClickPipes. You'll learn how to:

- Configure AWS infrastructure (S3, SQS, IAM roles) for event-driven ingestion
- Set up Cloudflare Logpush to export logs to S3
- Create a ClickPipes job to continuously ingest logs into ClickHouse
- Use pre-built dashboards to visualize security, performance, and traffic metrics

A demo dataset with sample logs is available if you want to test the integration before configuring your production Cloudflare account.

Time Required: 30-40 minutes
:::

## Overview {#overview}

Cloudflare logs capture security events, cache performance, and traffic patterns from requests passing through Cloudflare's CDN. This guide shows how to ingest these logs into ClickHouse using ClickPipes and AWS S3. This integration uses [ClickPipes](/integrations/clickpipes) instead of the OpenTelemetry Collector because Cloudflare exports logs as JSON files to object storage rather than via OTLP protocol. ClickPipes provides managed S3 ingestion with exactly-once semantics.

## Integration with existing Cloudflare account {#existing-cloudflare}

This section covers configuring your existing Cloudflare account to export logs to ClickStack via AWS S3 and ClickPipes.

If you would like to test the integration before configuring your production setup, you can test with our demo dataset in the [demo dataset section](#demo-dataset).

### Prerequisites {#prerequisites}

- ClickStack instance running
- Cloudflare account with Logpush access (requires Workers Paid plan)
- AWS account with permissions to create S3, SQS, and IAM resources

<VerticalStepper headerLevel="h4">

#### Create S3 bucket {#create-s3}

Create an S3 bucket named `cloudflare-logs-YOUR-COMPANY` in the same AWS region as your ClickHouse instance.

#### Create SQS queue {#create-sqs}

Create a Standard SQS queue named `cloudflare-logs-queue`. Copy the Queue URL for later.

**Configure trust policy:**

Select your queue → **Access Policy** tab → Edit → paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "s3.amazonaws.com"},
    "Action": "SQS:SendMessage",
    "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:cloudflare-logs-queue",
    "Condition": {
      "ArnLike": {
        "aws:SourceArn": "arn:aws:s3:::cloudflare-logs-YOUR-COMPANY"
      }
    }
  }]
}
```

**Replace:**
- `REGION` → Your AWS region (e.g., `us-east-1`)
- `ACCOUNT_ID` → Your AWS account ID
- `cloudflare-logs-YOUR-COMPANY` → Your bucket name

#### Configure S3 event notifications {#s3-notifications}

1. Go to your S3 bucket → **Properties** tab
2. Scroll to **Event notifications** → **Create event notification**
3. **Name**: `cloudflare-new-file`
4. **Event types**: ✓ All object create events (`s3:ObjectCreated:*`)
5. **Destination**: SQS Queue
6. **SQS Queue**: Select `cloudflare-logs-queue`
7. Click **Save changes**

#### Create IAM role for ClickHouse Cloud {#create-iam}

:::tip
If you already have a ClickPipes IAM role for S3 access, you can add the permissions from this step to that existing role instead of creating a new one.
:::

**Get ClickHouse Cloud IAM ARN:**

1. ClickHouse Cloud Console → **Settings** → **Network Security Information**
2. Copy the **IAM Role ARN** (e.g., `arn:aws:iam::123456789:role/clickhouse-cloud-prod-us-east-1`)

**Create IAM role:**

1. AWS Console → IAM → Roles → **Create Role**
2. **Trusted entity type**: Custom trust policy
3. Paste this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "CLICKHOUSE_CLOUD_ARN"
    },
    "Action": "sts:AssumeRole"
  }]
}
```

4. **Role name**: `clickhouse-clickpipes-cloudflare`
5. Click **Create role**

**Add permissions policy:**

1. Select your new role → **Add permissions** → **Create inline policy**
2. Paste this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:Get*",
        "s3:List*"
      ],
      "Resource": [
        "arn:aws:s3:::cloudflare-logs-YOUR-COMPANY",
        "arn:aws:s3:::cloudflare-logs-YOUR-COMPANY/*"
      ]
    },
    {
      "Sid": "SQSAccess",
      "Effect": "Allow",
      "Action": [
        "sqs:DeleteMessage",
        "sqs:ListQueues",
        "sqs:ReceiveMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:cloudflare-logs-queue"
    }
  ]
}
```

3. **Policy name**: `ClickPipesCloudflareAccess`
4. Copy the **Role ARN** for ClickPipes configuration

#### Configure Cloudflare Logpush {#configure-logpush}

Configure Cloudflare to export logs to your S3 bucket. Follow Cloudflare's step-by-step guide: [Enable Logpush to Amazon S3](https://developers.cloudflare.com/logs/logpush/logpush-job/enable-destinations/aws-s3/)

**Use these settings:**
- **Dataset**: HTTP Requests
- **Bucket**: `cloudflare-logs-YOUR-COMPANY` (from Step 1)
- **Path**: `logs/`
- **Daily subfolders**: ✓ Enabled
- **Timestamp format**: RFC3339

**Recommended fields:** `ClientIP`, `EdgeStartTimestamp`, `EdgeResponseStatus`, `ClientCountry`, `ClientRequestMethod`, `ClientRequestPath`, `CacheCacheStatus`, `BotScore`, `WAFAction`, `RayID`

For complete field reference: [Cloudflare HTTP Request Fields](https://developers.cloudflare.com/logs/reference/log-fields/zone/http_requests/)

**Verify logs flowing:**
```bash
# After 2-3 minutes, check S3
aws s3 ls s3://cloudflare-logs-YOUR-COMPANY/logs/ --recursive
```

#### Create ClickPipes job {#create-clickpipes}

1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
2. **Source**: Amazon S3

**Connection details:**
- **Bucket**: `cloudflare-logs-YOUR-COMPANY`
- **Path**: `logs/`
- **Region**: Your S3 region
- **Authentication**: IAM Role
- **IAM Role ARN**: Paste from Step 4

**Ingestion settings:**
- **Mode**: Continuous
- **Order**: Any order (unordered mode)
- ✓ **Enable SQS**
- **Queue URL**: Paste from Step 2

**Schema configuration:**

ClickPipes will auto-detect the schema from your Cloudflare logs. Review and adjust field types as needed:
```sql
CREATE TABLE cloudflare_logs (
    EdgeStartTimestamp DateTime64(3),
    ClientIP String,
    ClientCountry LowCardinality(String),
    ClientDeviceType LowCardinality(String),
    ClientRequestMethod LowCardinality(String),
    ClientRequestPath String,
    ClientRequestURI String,
    EdgeResponseStatus UInt16,
    EdgeResponseBytes UInt64,
    CacheCacheStatus LowCardinality(String),
    BotScore UInt8,
    WAFAction LowCardinality(String),
    RayID String
) ENGINE = MergeTree()
ORDER BY (EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)
PARTITION BY toYYYYMMDD(EdgeStartTimestamp);
```

**Optimization tips:**
- Use `LowCardinality` for fields with fewer than 10k unique values
- Partition by date for efficient time-range queries
- Include commonly filtered fields in `ORDER BY`

Click **Create ClickPipe**

#### Verify data in ClickHouse {#verify-clickhouse}

Wait 2-3 minutes for data to flow, then query:
```sql
-- Check data is arriving
SELECT count() FROM cloudflare_logs;

-- View recent requests
SELECT 
    EdgeStartTimestamp,
    ClientIP,
    ClientRequestMethod,
    ClientRequestPath,
    EdgeResponseStatus,
    CacheCacheStatus
FROM cloudflare_logs
ORDER BY EdgeStartTimestamp DESC
LIMIT 10;
```

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the Cloudflare logs integration before configuring their production account, we provide a sample dataset with realistic HTTP request patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}
```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/cloudflare/cloudflare-http-requests.json.gz
```

The dataset includes 24 hours of HTTP requests with realistic patterns:
- Geographic distribution across 10 countries
- Mix of desktop, mobile, and bot traffic
- Cache hits, misses, and dynamic content
- Security events (bot detections, WAF actions)
- Performance variations by region and endpoint

#### Upload to S3 for testing {#upload-demo}
```bash
# Upload to your S3 bucket
aws s3 cp cloudflare-http-requests.json.gz \
  s3://cloudflare-logs-YOUR-COMPANY/logs/demo/20250127T100000Z_20250127T110000Z_demo.json.gz

# This will trigger SQS notification → ClickPipes will process automatically
```

#### Verify demo data in ClickHouse {#verify-demo}

Once uploaded and processed:

1. Query the data:
```sql
SELECT count() FROM cloudflare_logs;

-- Should show ~1000 demo records
```

2. Set time range in HyperDX to **2025-01-27 10:00:00 - 2025-01-27 11:00:00**

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you monitor Cloudflare with ClickStack, we provide pre-built dashboards with essential visualizations.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudflare-logs-dashboard.json')} download="cloudflare-logs-dashboard.json" eventName="docs.cloudflare_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `cloudflare-logs-dashboard.json` file and click **Finish Import**

#### View the dashboard {#view-dashboard}

The dashboard includes visualizations for:
- Request rate and traffic volume over time
- Geographic distribution (top countries)
- Cache hit rate and performance
- Error rates by status code
- Bot traffic and security events
- Top endpoints by request volume

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No files appearing in S3 {#no-s3-files}

**Check Cloudflare Logpush job status:**
```bash
# Via Cloudflare dashboard
Analytics & Logs → Logs → Verify job shows "Healthy"
```

**Generate test traffic:**
```bash
curl https://your-cloudflare-domain.com
```

Wait 2-3 minutes and check S3:
```bash
aws s3 ls s3://cloudflare-logs-YOUR-COMPANY/logs/ --recursive
```

### SQS not receiving notifications {#no-sqs-messages}

**Verify S3 event notifications configured:**
- S3 Console → Bucket → Properties → Event notifications
- Confirm notification exists for `s3:ObjectCreated:*` events

**Check SQS trust policy:**
```bash
aws sqs get-queue-attributes \
  --queue-url YOUR_QUEUE_URL \
  --attribute-names Policy
```

### ClickPipes not processing files {#clickpipes-errors}

**Check IAM role permissions:**
- Verify ClickHouse Cloud can assume the role
- Confirm role has access to both S3 bucket and SQS queue

**View ClickPipes logs:**
- ClickHouse Cloud Console → Data Sources → Your ClickPipe → Logs tab

**Common errors:**
- `Access Denied` → IAM permissions insufficient
- `Queue not found` → Verify SQS URL is correct
- `Schema mismatch` → Check Cloudflare fields match table schema

### Data not appearing in ClickHouse {#no-data}

**Verify table exists:**
```sql
SHOW TABLES FROM default LIKE 'cloudflare_logs';
```

**Check for processing errors:**
```sql
SELECT * FROM system.query_log 
WHERE type = 'ExceptionWhileProcessing'
  AND query LIKE '%cloudflare_logs%'
ORDER BY event_time DESC
LIMIT 10;
```

## Next steps {#next-steps}

- Set up [alerts](/use-cases/observability/clickstack/alerts) for security events (bot attacks, WAF blocks, error rate spikes)
- Create [custom dashboards](/use-cases/observability/clickstack/dashboards) for your specific use cases
- Optimize [retention policies](/use-cases/observability/clickstack/ttl) based on data volume

## Going to production {#going-to-production}

This guide demonstrates ClickPipes for managed ingestion from S3. For production deployments:

- Enable daily subfolders in Cloudflare Logpush for better S3 organization
- Configure SQS Dead Letter Queue (DLQ) for failed message handling
- Set up CloudWatch alarms for SQS queue depth
- Consider partitioning strategy based on query patterns (by date, country, or status)
- Review ClickPipes monitoring dashboards for ingestion health

## Additional resources {#resources}

- [Cloudflare Logpush Documentation](https://developers.cloudflare.com/logs/logpush/)
- [Cloudflare HTTP Request Fields](https://developers.cloudflare.com/logs/reference/log-fields/zone/http_requests/)
- [ClickPipes S3 Integration](https://clickhouse.com/docs/integrations/clickpipes/object-storage/s3)
- [ClickPipes Unordered Mode](https://clickhouse.com/blog/clickpipes-s3-unordered-mode)
