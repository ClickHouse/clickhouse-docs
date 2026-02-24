---
slug: /use-cases/observability/clickstack/integrations/cloudflare-logs
title: 'Monitoring Cloudflare Logs with ClickStack'
sidebar_label: 'Cloudflare Logs'
pagination_prev: null
pagination_next: null
description: 'Ingest Cloudflare Logpush data into ClickStack using ClickPipes for continuous, event-driven log ingestion from S3'
doc_type: 'guide'
keywords: ['Cloudflare', 'logs', 'ClickStack', 'ClickPipes', 'S3', 'SQS']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Cloudflare Logs with ClickStack {#cloudflare-clickstack}

:::note[TL;DR]
This guide shows you how to ingest Cloudflare logs into ClickStack using ClickPipes. You'll set up event-driven ingestion where Cloudflare Logpush writes to S3, S3 notifies an SQS queue, and ClickPipes continuously ingests new files into ClickHouse.

Unlike most ClickStack integration guides that use the OpenTelemetry Collector, this guide uses [ClickPipes](/integrations/clickpipes) — ClickHouse Cloud's managed ingestion service — to pull data directly from S3.

A demo dataset is available if you want to explore the dashboards before configuring production ingestion.

Time Required: 20-30 minutes
:::

## Overview {#overview}

Cloudflare [Logpush](https://developers.cloudflare.com/logs/about/) exports detailed request logs — including edge timing, cache status, security events, and bot scores — to destinations like Amazon S3. While Cloudflare's dashboard provides basic analytics, forwarding logs to ClickStack lets you:

- Query edge traffic patterns using ClickHouse SQL
- Correlate Cloudflare data with application logs, traces, and metrics in a unified platform
- Retain logs longer than Cloudflare's default retention
- Build custom dashboards for cache performance, security analysis, and geographic traffic distribution

This guide uses ClickPipes with SQS-based event notifications to achieve continuous, low-latency ingestion. When Cloudflare uploads a new log file to S3, an SQS notification triggers ClickPipes to process the file automatically — with exactly-once semantics and no polling delay.

## Integration with existing Cloudflare Logpush {#existing-cloudflare}

This section assumes you have Cloudflare Logpush configured to export logs to S3. If not, follow [Cloudflare's AWS S3 setup guide](https://developers.cloudflare.com/logs/get-started/enable-destinations/aws-s3/) first.

### Prerequisites {#prerequisites}

- **ClickHouse Cloud service** running (ClickPipes is a Cloud-only feature — not available in ClickStack OSS)
- Cloudflare Logpush actively writing logs to an S3 bucket
- AWS permissions to create SQS queues, S3 event notifications, and IAM roles
- S3 bucket name and region where Cloudflare writes logs

<VerticalStepper headerLevel="h4">

#### Create SQS queue {#create-sqs}

Create an SQS queue to receive notifications when Cloudflare uploads new log files to S3.

**Via AWS Console:**
1. Navigate to SQS → **Create queue**
2. **Type**: Standard
3. **Name**: `cloudflare-logs-queue`
4. Click **Create queue**
5. Copy the **Queue URL** and **Queue ARN**

**Configure access policy:**

Select your queue → **Access policy** tab → **Edit** → Replace with:
```json
{
  "Version": "2012-10-17",
  "Id": "cloudflare-s3-notifications",
  "Statement": [
    {
      "Sid": "AllowS3ToSendMessage",
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": "SQS:SendMessage",
      "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:cloudflare-logs-queue",
      "Condition": {
        "ArnLike": {
          "aws:SourceArn": "arn:aws:s3:::YOUR-BUCKET-NAME"
        },
        "StringEquals": {
          "aws:SourceAccount": "ACCOUNT_ID"
        }
      }
    }
  ]
}
```

Replace `REGION`, `ACCOUNT_ID`, and `YOUR-BUCKET-NAME` with your values.

:::note
We strongly recommend configuring a **Dead Letter Queue (DLQ)** for the SQS queue. This makes it easier to debug and retry failed messages. You can add a DLQ in the SQS console under **Dead-letter queue** settings when creating or editing the queue.
:::

#### Configure S3 event notifications {#s3-notifications}

Configure your S3 bucket to notify the queue when new files arrive.

1. S3 bucket → **Properties** → **Event notifications** → **Create event notification**
2. **Name**: `cloudflare-new-file`
3. **Event types**: ✓ All object create events
4. **Destination**: SQS queue → Select `cloudflare-logs-queue`
5. Click **Save changes**

#### Create IAM role for ClickPipes {#create-iam}

ClickPipes needs permission to read from S3 and consume SQS messages.

**Get ClickHouse Cloud IAM ARN:**
1. ClickHouse Cloud Console → **Settings** → **Network Security Information**
2. Copy the **IAM Role ARN**

**Create IAM role:**
1. AWS Console → IAM → **Roles** → **Create role**
2. **Trusted entity**: Custom trust policy
3. Paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "YOUR-CLICKHOUSE-CLOUD-ARN"
    },
    "Action": "sts:AssumeRole"
  }]
}
```
4. **Role name**: `clickhouse-clickpipes-cloudflare`
5. Click **Create role**

**Add permissions:**
1. Select role → **Add permissions** → **Create inline policy**
2. Paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:cloudflare-logs-queue"
    }
  ]
}
```
3. **Policy name**: `ClickPipesCloudflareAccess`
4. Copy the **Role ARN**

#### Create ClickPipes job {#create-clickpipes}

1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
2. **Source**: Amazon S3

**Connection:**
- **Bucket**: Your Cloudflare logs bucket
- **Region**: Your bucket region
- **Authentication**: IAM Role → Paste Role ARN from previous step

**Ingestion:**
- **Mode**: Continuous
- **Ordering**: Any order
- ✓ **Enable SQS**
- **Queue URL**: Paste from Step 1

**Schema:**

ClickPipes auto-detects schema from your logs. Review and adjust field types as needed.

**Example schema:**
```sql
CREATE TABLE cloudflare_logs (
    EdgeStartTimestamp DateTime64(3),
    ClientIP String,
    ClientCountry LowCardinality(String),
    ClientRequestMethod LowCardinality(String),
    ClientRequestPath String,
    EdgeResponseStatus UInt16,
    EdgeResponseBytes UInt64,
    CacheCacheStatus LowCardinality(String),
    BotScore Nullable(UInt16),
    SecurityAction LowCardinality(Nullable(String)),
    RayID String
) ENGINE = MergeTree()
ORDER BY (EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)
PARTITION BY toYYYYMMDD(EdgeStartTimestamp);
```

Click **Create ClickPipe**

#### Verify data in ClickHouse {#verify-data}

Wait 2-3 minutes for initial ingestion, then query:
```sql
-- Check row count
SELECT count() FROM cloudflare_logs;

-- View recent requests
SELECT 
    EdgeStartTimestamp,
    ClientIP,
    ClientCountry,
    ClientRequestMethod,
    ClientRequestPath,
    EdgeResponseStatus
FROM cloudflare_logs
ORDER BY EdgeStartTimestamp DESC
LIMIT 10;
```

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test before configuring production, we provide sample Cloudflare logs.

<VerticalStepper headerLevel="h4">

#### Download sample dataset {#download-sample}
```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/cloudflare/cloudflare-logs.json.gz
```

The dataset includes 24 hours of HTTP requests with realistic patterns covering traffic spikes, security events, and geographic distribution.

#### Upload to S3 {#upload-demo}
```bash
aws s3 cp cloudflare-logs.json.gz \
  s3://YOUR-BUCKET-NAME/demo/20250127_demo.json.gz
```

This triggers SQS notification → ClickPipes processes automatically.

#### Verify demo data {#verify-demo}
```sql
SELECT count() FROM cloudflare_logs;
-- Should show demo records

SELECT 
    toDate(EdgeStartTimestamp) as date,
    count() as requests
FROM cloudflare_logs
GROUP BY date
ORDER BY date DESC;
```

</VerticalStepper>

## Dashboards and visualization {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudflare-logs-dashboard.json')} download="cloudflare-logs-dashboard.json" eventName="docs.cloudflare_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import dashboard {#import-dashboard}

1. HyperDX → **Dashboards** → **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard"/>

2. Upload `cloudflare-logs-dashboard.json` → **Finish Import**

#### View dashboard {#view-dashboard}

The dashboard includes:
- Request rate and traffic volume
- Geographic distribution
- Cache hit rates
- Error rates by status code
- Security events

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No files appearing in S3 {#no-s3-files}

**Verify Cloudflare Logpush is active:**
- Cloudflare Dashboard → Analytics & Logs → Logs → Check job status

**Generate test traffic:**
```bash
curl https://your-cloudflare-domain.com
```

Wait 2-3 minutes and check S3.

### SQS not receiving messages {#no-sqs-messages}

**Verify S3 event notification:**
- S3 bucket → Properties → Event notifications → Confirm configuration exists

**Test SQS policy:**
```bash
aws sqs get-queue-attributes \
  --queue-url YOUR-QUEUE-URL \
  --attribute-names Policy
```

### ClickPipes not processing files {#clickpipes-errors}

**Check IAM permissions:**
- Verify ClickHouse can assume the role
- Confirm S3 and SQS permissions are correct

**View ClickPipes logs:**
- ClickHouse Cloud Console → Data Sources → Your ClickPipe → **Logs**

### Data not appearing in ClickHouse {#no-data}

**Verify table exists:**
```sql
SHOW TABLES FROM default LIKE 'cloudflare_logs';
```

**Check for schema errors:**
```sql
SELECT * FROM system.query_log 
WHERE type = 'ExceptionWhileProcessing'
  AND query LIKE '%cloudflare_logs%'
ORDER BY event_time DESC
LIMIT 10;
```

## Next steps {#next-steps}

- Set up [alerts](/use-cases/observability/clickstack/alerts) for security events
- Optimize [retention policies](/use-cases/observability/clickstack/ttl) based on data volume
- Create custom dashboards for specific use cases

## Going to production {#going-to-production}

For production deployments:
- Enable daily subfolders in Cloudflare Logpush for better organization
- Configure SQS Dead Letter Queue for failed message handling
- Set up CloudWatch alarms for queue depth monitoring
- Review partitioning strategy based on query patterns
