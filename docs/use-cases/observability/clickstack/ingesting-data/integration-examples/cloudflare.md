---
slug: /use-cases/observability/clickstack/integrations/cloudflare-logs
title: 'Monitoring Cloudflare Logs with ClickStack'
sidebar_label: 'Cloudflare Logs'
pagination_prev: null
pagination_next: null
description: 'Ingest Cloudflare Logpush data into ClickStack using ClickPipes for continuous log ingestion from S3'
doc_type: 'guide'
keywords: ['Cloudflare', 'logs', 'ClickStack', 'ClickPipes', 'S3']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Cloudflare Logs with ClickStack {#cloudflare-clickstack}

:::note[TL;DR]
This guide shows you how to ingest Cloudflare logs into ClickStack using ClickPipes. Cloudflare Logpush writes logs to S3, and ClickPipes continuously ingests new files into ClickHouse. Unlike most ClickStack integration guides that use the OpenTelemetry Collector, this guide uses [ClickPipes](/integrations/clickpipes) to pull data directly from S3.

A demo dataset is available if you want to explore the dashboards before configuring production ingestion.
:::

## Overview {#overview}

Cloudflare [Logpush](https://developers.cloudflare.com/logs/about/) exports detailed request logs — including edge timing, cache status, security events, and bot scores — to destinations like Amazon S3. While Cloudflare's dashboard provides basic analytics, forwarding logs to ClickStack lets you:

- Query edge traffic patterns using ClickHouse SQL
- Correlate Cloudflare data with application logs, traces, and metrics in a unified platform
- Retain logs longer than Cloudflare's default retention
- Build custom dashboards for cache performance, security analysis, and geographic traffic distribution

This guide uses ClickPipes with continuous ingestion to automatically process new Cloudflare log files as they appear in S3 — with exactly-once semantics.

## Integration with existing Cloudflare Logpush {#existing-cloudflare}

This section assumes you have Cloudflare Logpush configured to export logs to S3. If not, follow [Cloudflare's AWS S3 setup guide](https://developers.cloudflare.com/logs/get-started/enable-destinations/aws-s3/) first.

### Prerequisites {#prerequisites}

- **ClickHouse Cloud service** running (ClickPipes is a Cloud-only feature — not available in ClickStack OSS)
- Cloudflare Logpush actively writing logs to an S3 bucket
- S3 bucket name and region where Cloudflare writes logs

<VerticalStepper headerLevel="h4">

#### Configure S3 authentication {#configure-auth}

ClickPipes needs permission to read from your S3 bucket. Follow the [Accessing S3 data securely](/docs/cloud/data-sources/secure-s3) guide to configure either IAM role-based access or credentials-based access.

For full details on ClickPipes S3 authentication and permissions, see the [S3 ClickPipes reference documentation](/docs/integrations/clickpipes/object-storage/s3/overview#access-control).

#### Create ClickPipes job {#create-clickpipes}

1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
2. **Source**: Amazon S3

**Connection:**
- **S3 file path**: Your Cloudflare logs bucket path with a wildcard to match files. If you enabled daily subfolders in Logpush, use `**` to match across subdirectories:
  - No subfolders: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/*`
  - Daily subfolders: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/**/*`
- **Authentication**: Select your authentication method and provide the credentials or IAM Role ARN

**Ingestion settings:**

Click **Incoming data**, then configure:
- Toggle on **Continuous ingestion**
- **Ordering**: Lexicographical order

Cloudflare Logpush writes files with date-based naming (e.g., `20250127/...`), which is naturally lexicographical. ClickPipes polls for new files every 30 seconds and ingests any file with a name greater than the last processed file.

**Schema mapping:**

Click **Parse information**. ClickPipes samples your log files and auto-detects the schema. Review the mapped columns and adjust types as needed. Define a **Sorting key** for the destination table — for Cloudflare logs, a good choice is `(EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)`.

Click **Complete Setup**.

:::note
When first created, ClickPipes performs an initial load of **all existing files** in the specified path before switching to continuous polling. If your bucket contains a large backlog of Cloudflare logs, this initial load may take some time.
:::

#### Verify data in ClickHouse {#verify-data}

Wait a few minutes for initial ingestion (longer if the bucket has existing files), then query:
```sql
-- Check row count
SELECT count() FROM cloudflare_http_logs;

-- View recent requests
SELECT 
    EdgeStartTimestamp,
    ClientIP,
    ClientCountry,
    ClientRequestMethod,
    ClientRequestPath,
    EdgeResponseStatus
FROM cloudflare_http_logs
ORDER BY EdgeStartTimestamp DESC
LIMIT 10;
```

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the integration before configuring their production Cloudflare Logpush, we provide a sample dataset with realistic HTTP request logs.

<VerticalStepper headerLevel="h4">

#### Start ClickPipes with the demo dataset {#start-demo}

1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
2. **Source**: Amazon S3
3. **Authentication**: Public
4. **S3 file path**: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/cloudflare/cloudflare-http-logs.json`
5. Click **Incoming data**
6. Select **JSON** as the format
7. Click **Parse information** and review the detected schema
8. Set the **Table name** to `cloudflare_http_logs`
9. Click **Complete Setup**

The dataset includes 5,000 HTTP request log entries spanning 24 hours with realistic patterns including traffic from multiple countries, cache hits and misses, API and static asset requests, error responses, and security events.

#### Verify demo data {#verify-demo}

```sql
SELECT count() FROM cloudflare_http_logs;
-- Should return 5000

SELECT 
    EdgeResponseStatus,
    count() as requests
FROM cloudflare_http_logs
GROUP BY EdgeResponseStatus
ORDER BY requests DESC
LIMIT 10;
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

## Advanced: SQS-based ingestion {#sqs-ingestion}

The default lexicographical ordering works well for Cloudflare Logpush since files are named with date-based prefixes. However, if you need to handle backfills, retries, or files that arrive out of order, you can configure SQS-based event-driven ingestion.

With SQS, S3 sends a notification to an SQS queue whenever Cloudflare uploads a new file, and ClickPipes processes the file immediately regardless of naming order.

<VerticalStepper headerLevel="h4">

#### Create SQS queue {#create-sqs}

1. AWS Console → SQS → **Create queue**
2. **Type**: Standard
3. **Name**: `cloudflare-logs-queue`
4. Click **Create queue**
5. Copy the **Queue URL**

**Configure access policy:**

Select your queue → **Access policy** tab → **Edit** → Replace with:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": "SQS:SendMessage",
      "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:cloudflare-logs-queue",
      "Condition": {
        "ArnLike": {
          "aws:SourceArn": "arn:aws:s3:::YOUR-BUCKET-NAME"
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

1. S3 bucket → **Properties** → **Event notifications** → **Create event notification**
2. **Name**: `cloudflare-new-file`
3. **Event types**: ✓ All object create events
4. **Destination**: SQS queue → Select `cloudflare-logs-queue`
5. Click **Save changes**

#### Add SQS permissions {#sqs-permissions}

Your IAM role or user needs the following SQS permissions in addition to the standard S3 permissions:

```json
{
  "Effect": "Allow",
  "Action": [
    "sqs:ReceiveMessage",
    "sqs:DeleteMessage",
    "sqs:GetQueueAttributes",
    "sqs:ListQueues"
  ],
  "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:cloudflare-logs-queue"
}
```

#### Update ClickPipes configuration {#update-clickpipes}

When creating or editing your ClickPipe, change the ingestion settings:
- **Ordering**: Any order
- **SQS Queue URL**: Paste the Queue URL from the SQS step

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

### ClickPipes not processing files {#clickpipes-errors}

**Check IAM permissions:**
- Verify ClickHouse can access the S3 bucket
- If using SQS, confirm SQS permissions are correct

**View ClickPipes logs:**
- ClickHouse Cloud Console → Data Sources → Your ClickPipe → **Logs**

### Data not appearing in ClickHouse {#no-data}

**Verify table exists:**
```sql
SHOW TABLES FROM default LIKE 'cloudflare_http_logs';
```

**Check for schema errors:**
```sql
SELECT * FROM system.query_log 
WHERE type = 'ExceptionWhileProcessing'
  AND query LIKE '%cloudflare%'
ORDER BY event_time DESC
LIMIT 10;
```

### SQS not receiving messages {#no-sqs-messages}

**Verify S3 event notification:**
- S3 bucket → Properties → Event notifications → Confirm configuration exists

**Test SQS policy:**
```bash
aws sqs get-queue-attributes \
  --queue-url YOUR-QUEUE-URL \
  --attribute-names Policy
```

## Next steps {#next-steps}

- Set up [alerts](/use-cases/observability/clickstack/alerts) for security events
- Optimize [retention policies](/use-cases/observability/clickstack/ttl) based on data volume
- Create custom dashboards for specific use cases

## Going to production {#going-to-production}

For production deployments:

- **Choose your ingestion mode**: Lexicographical order works well for Cloudflare's date-based file naming. Consider [SQS-based ingestion](#sqs-ingestion) if you need to handle backfills or out-of-order files.
- **Select Logpush fields carefully**: Cloudflare offers [many fields](https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/zone/http_requests/) for HTTP requests. Only include the fields you need to reduce storage costs and ingestion volume.
- **Enable daily subfolders** in Cloudflare Logpush for better organization and use `**/*` in your ClickPipes path pattern.
- **Configure SQS Dead Letter Queue** for failed message handling if using SQS-based ingestion.
- **Review partitioning strategy** based on your query patterns.
