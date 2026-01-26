---
slug: /use-cases/observability/clickstack/integrations/cloudflare
title: 'Monitoring Cloudflare Logs with ClickStack'
sidebar_label: 'Cloudflare Logs'
pagination_prev: null
pagination_next: null
description: 'Monitoring Cloudflare with ClickStack'
doc_type: 'guide'
---

# Monitoring Cloudflare Logs with ClickStack {#cloudflare-clickstack}

:::note[TL;DR]
This guide shows you how to ingest Cloudflare logs into ClickStack using AWS S3, SQS, and ClickPipes. You'll learn how to:

- Configure Cloudflare Logpush to export logs to S3
- Set up AWS infrastructure (S3 bucket, SQS queue, IAM roles)
- Create a ClickPipes job to ingest logs into ClickHouse
- Use pre-built dashboards to visualize security, performance, and traffic metrics

**Why not OTLP?** Cloudflare exports logs in JSON format to S3. This guide uses ClickPipes (ClickHouse's managed ingestion service) instead of the OpenTelemetry Collector, as it's purpose-built for object storage ingestion with exactly-once semantics.

Time Required: 30-40 minutes
:::

## What is Cloudflare? {#what-is-cloudflare}

Cloudflare is a global CDN and security service that sits between your users and your application. It acts as a managed reverse proxy, providing:

- **CDN/Caching** - Speeds up websites from 300+ global edge locations
- **DDoS Protection** - Blocks malicious traffic
- **Web Application Firewall (WAF)** - Protects against attacks
- **DNS** - Fast, reliable DNS service
- **Bot Management** - Identifies and mitigates bot traffic

**Why monitor Cloudflare logs?**

Since Cloudflare sits in front of your application, it sees every request before your servers do. Cloudflare logs contain critical data that your application logs don't:

- **Security**: Bot attacks, WAF blocks, DDoS mitigation events
- **Performance**: Edge response times, cache hit rates, geographic latency
- **Traffic**: Request patterns by region, device type, endpoint usage
- **Cost**: Bandwidth consumption by endpoint and region

## Use Cases {#use-cases}

### Security Analysis
```sql
-- Identify bot attack patterns
SELECT
    ClientCountry,
    BotScore,
    EdgeResponseStatus,
    count() as requests
FROM cloudflare_logs
WHERE BotScore < 30
  AND timestamp > now() - interval 1 hour
GROUP BY ALL
ORDER BY requests DESC
```

### Performance Monitoring
```sql
-- Analyze cache effectiveness by region
SELECT
    ClientCountry,
    CacheCacheStatus,
    avg(EdgeTimeToFirstByteMs) as avg_ttfb_ms,
    count() as requests
FROM cloudflare_logs
WHERE timestamp > now() - interval 24 hour
GROUP BY ALL
```

### Cost Optimization
```sql
-- Find bandwidth-heavy endpoints
SELECT
    ClientRequestPath,
    sum(EdgeResponseBytes) / 1e9 as gb_transferred,
    count() as requests
FROM cloudflare_logs
WHERE timestamp > now() - interval 30 day
GROUP BY ClientRequestPath
ORDER BY gb_transferred DESC
LIMIT 20
```

## Architecture Overview {#architecture}

This integration uses an event-driven pipeline:
```
Cloudflare Logpush
    ↓ (writes JSON files)
AWS S3 Bucket
    ↓ (triggers event notification)
AWS SQS Queue
    ↓ (ClickPipes polls for new files)
ClickPipes
    ↓ (reads files, inserts data)
ClickHouse
    ↓ (optional: schema transformation)
HyperDX (visualization)
```

**Why this architecture?**
- **Event-driven**: Instant processing when files arrive (vs polling every 30s)
- **Handles out-of-order data**: Cloudflare exports from multiple regions simultaneously
- **Exactly-once semantics**: ClickPipes prevents duplicates even with retries
- **Fully managed**: No custom code or infrastructure to maintain

## Prerequisites {#prerequisites}

- **Cloudflare account** with Logpush access (requires Workers Paid plan - $5/month)
- **AWS account** with permissions to create S3, SQS, and IAM resources
- **ClickHouse Cloud** instance
- **ClickStack** deployment (optional, for HyperDX visualization)

## Step-by-Step Setup {#setup}

<VerticalStepper headerLevel="h3">

### Part 1: AWS Infrastructure Setup (20 minutes) {#aws-setup}

#### Create S3 Bucket {#create-s3}

1. Go to AWS Console → S3 → Create Bucket
2. **Bucket name**: `cloudflare-logs-YOUR-COMPANY` (must be globally unique)
3. **Region**: Choose region closest to you (e.g., `us-east-1`)
4. **Block Public Access**: Keep enabled (default)
5. Click **Create bucket**

#### Create SQS Queue {#create-sqs}

1. Go to AWS Console → SQS → Create Queue
2. **Queue name**: `cloudflare-logs-queue`
3. **Type**: Standard (not FIFO)
4. Click **Create queue**
5. **Copy the Queue URL** - you'll need this later

**Configure SQS Trust Policy:**

1. Select your queue → **Access Policy** tab → Edit
2. Replace with this policy (update placeholders):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "s3.amazonaws.com"
    },
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

Replace:
- `REGION` with your AWS region (e.g., `us-east-1`)
- `ACCOUNT_ID` with your AWS account ID
- `cloudflare-logs-YOUR-COMPANY` with your bucket name

#### Configure S3 Event Notifications {#s3-notifications}

1. Go to your S3 bucket → **Properties** tab
2. Scroll to **Event notifications** → **Create event notification**
3. **Name**: `cloudflare-new-file`
4. **Event types**: Check `All object create events (s3:ObjectCreated:*)`
5. **Destination**: SQS Queue
6. **SQS Queue**: Select `cloudflare-logs-queue`
7. Click **Save changes**

#### Create IAM Role for ClickHouse Cloud {#create-iam}

**Step 1: Get ClickHouse Cloud IAM ARN**

1. Go to ClickHouse Cloud Console
2. Navigate to **Settings** → **Network Security Information**
3. **Copy the IAM Role ARN** (looks like: `arn:aws:iam::123456789:role/clickhouse-cloud-prod-us-east-1`)

**Step 2: Create IAM Role**

1. Go to AWS Console → IAM → Roles → **Create Role**
2. **Trusted entity type**: Custom trust policy
3. Paste this policy (update `CLICKHOUSE_CLOUD_ARN`):
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

4. Click **Next**
5. **Role name**: `clickhouse-clickpipes-cloudflare`

**Step 3: Add Permissions Policy**

1. Select your new role → **Add permissions** → **Create inline policy**
2. Switch to JSON tab
3. Paste this policy (update placeholders):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::cloudflare-logs-YOUR-COMPANY"
    },
    {
      "Sid": "S3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Resource": "arn:aws:s3:::cloudflare-logs-YOUR-COMPANY/*"
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

4. **Policy name**: `ClickPipesCloudflareAccess`
5. Click **Create policy**
6. **Copy the Role ARN** - you'll need this for ClickPipes

### Part 2: Cloudflare Configuration (5 minutes) {#cloudflare-config}

#### Configure Logpush Job {#logpush}

1. Log into Cloudflare Dashboard
2. Select your domain/zone
3. Go to **Analytics & Logs** → **Logs** → **Add Logpush Job**
4. **Select a dataset**: HTTP Requests
5. **Select a destination**: Amazon S3
6. **Destination details**:
   - **Bucket name**: `cloudflare-logs-YOUR-COMPANY`
   - **Bucket path**: `logs/` (optional, keeps files organized)
   - **Bucket region**: Your S3 region
   - **Organize into daily subfolders**: ✓ Recommended
7. **Authentication**: [TODO: Need to test which method Cloudflare uses]
8. **Select fields**: Choose fields or select all (can be customized later)
9. **Advanced settings**:
   - **Timestamp format**: RFC3339 (recommended)
   - **Sampling rate**: 1.0 (100%, adjust if high traffic)
10. Click **Validate destination**
11. Once validated, click **Save and Start**

:::note
Cloudflare sends an ownership challenge file to verify bucket access. This should happen automatically during validation.
:::

#### Verify Logs Flowing to S3 {#verify-s3}

Wait 2-3 minutes, then check your S3 bucket:
```bash
# Using AWS CLI
aws s3 ls s3://cloudflare-logs-YOUR-COMPANY/logs/ --recursive

# You should see files like:
# logs/2025/01/26/20250126T1000Z_20250126T1001Z_abc123.json.gz
```

### Part 3: ClickPipes Setup (15 minutes) {#clickpipes-setup}

#### Create ClickPipes Job {#create-clickpipes}

1. Go to ClickHouse Cloud Console
2. Navigate to **Data Sources** → **Create ClickPipe**
3. **Source**: Amazon S3

**Connection Details:**
- **Bucket**: `cloudflare-logs-YOUR-COMPANY`
- **Path**: `logs/` (match Cloudflare Logpush path)
- **Region**: Your S3 region
- **Authentication method**: IAM Role
- **IAM Role ARN**: Paste the role ARN from Step 1

**Ingestion Mode:**
- **Mode**: Continuous
- **Order**: Any order (unordered mode)
- **Enable SQS**: ✓ Checked
- **SQS Queue URL**: Paste your SQS URL

Click **Test Connection** → Should show success

#### Configure Schema {#configure-schema}

ClickPipes will auto-detect the schema from a sample file.

**Recommended table schema:**
```sql
CREATE TABLE cloudflare_logs (
    EdgeStartTimestamp DateTime64(3),
    ClientIP String,
    ClientCountry LowCardinality(String),
    ClientDeviceType LowCardinality(String),
    ClientRequestHost String,
    ClientRequestMethod LowCardinality(String),
    ClientRequestPath String,
    ClientRequestURI String,
    EdgeResponseStatus UInt16,
    EdgeResponseBytes UInt64,
    CacheCacheStatus LowCardinality(String),
    EdgeTimeToFirstByteMs UInt32,
    WAFAction LowCardinality(String),
    BotScore UInt8,
    RayID String
    -- Add other fields as needed
) ENGINE = MergeTree()
ORDER BY (EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)
PARTITION BY toYYYYMMDD(EdgeStartTimestamp)
SETTINGS index_granularity = 8192;
```

**Review and adjust**:
- Field names should match Cloudflare's schema
- Use `LowCardinality` for fields with few unique values
- Partition by date for better query performance

Click **Create ClickPipe**

#### Verify Data Ingestion {#verify-ingestion}

Wait 2-3 minutes for data to flow, then query:
```sql
-- Check if logs are arriving
SELECT count() FROM cloudflare_logs;

-- View sample data
SELECT * FROM cloudflare_logs 
ORDER BY EdgeStartTimestamp DESC 
LIMIT 10;
```

</VerticalStepper>

## (Optional) Schema Transformation {#schema-transformation}

If you want to transform Cloudflare logs into ClickStack's OTLP schema for HyperDX visualization:
```sql
CREATE MATERIALIZED VIEW cloudflare_logs_otel
TO otel_logs AS
SELECT
    toUnixTimestamp64Nano(EdgeStartTimestamp) AS TimeUnixNano,
    'cloudflare' AS ServiceName,
    ClientRequestURI AS Body,
    map(
        'http.client_ip', ClientIP,
        'http.status_code', toString(EdgeResponseStatus),
        'http.method', ClientRequestMethod,
        'http.url', ClientRequestURI,
        'geo.country', ClientCountry,
        'cache.status', CacheCacheStatus,
        'bot.score', toString(BotScore),
        'waf.action', WAFAction
    ) AS Attributes
FROM cloudflare_logs;
```

## Dashboards and Visualization {#dashboards}

[TODO: Create pre-built dashboard once testing is complete]

**Planned visualizations:**
- Traffic by country (map)
- Request rate over time
- Cache hit rate
- Error rate (4xx, 5xx)
- Bot traffic analysis
- WAF blocks over time
- Top endpoints by traffic
- Response time percentiles

## Troubleshooting {#troubleshooting}

### No files appearing in S3 {#no-s3-files}

**Check Cloudflare Logpush status:**
1. Cloudflare Dashboard → Analytics & Logs → Logs
2. Verify job shows "Healthy" status
3. Check "Last Push" timestamp

**Generate test traffic:**
```bash
# Send requests to your Cloudflare-proxied domain
curl https://your-domain.com
```

Wait 2-3 minutes and check S3 again.

### SQS not receiving messages {#no-sqs-messages}

**Check S3 event notifications:**
1. S3 Console → Your bucket → Properties → Event notifications
2. Verify notification is configured for `s3:ObjectCreated:*`
3. Check destination is correct SQS queue

**Check SQS trust policy:**
```bash
# View queue policy
aws sqs get-queue-attributes \
  --queue-url YOUR_QUEUE_URL \
  --attribute-names Policy
```

### ClickPipes not processing files {#clickpipes-not-processing}

**Check IAM permissions:**
- Verify ClickHouse Cloud can assume the IAM role
- Check role has access to both S3 and SQS

**Check ClickPipes logs:**
1. ClickHouse Cloud Console → Data Sources → Your ClickPipe
2. View **Logs** tab for error messages

**Common errors:**
- `Access Denied` → IAM permissions issue
- `Invalid JSON` → Check Cloudflare output format matches expected schema
- `Queue not found` → Verify SQS URL is correct

### Data not appearing in ClickHouse {#no-data-clickhouse}

**Check table exists:**
```sql
SHOW TABLES FROM default WHERE name = 'cloudflare_logs';
```

**Check for insert errors:**
```sql
-- Query system logs for errors
SELECT * FROM system.query_log 
WHERE type = 'ExceptionWhileProcessing'
  AND query LIKE '%cloudflare_logs%'
ORDER BY event_time DESC
LIMIT 10;
```

## Cost Considerations {#costs}

**AWS Costs (approximate for 1TB/day of logs):**
- S3 storage: ~$23/month (0.023/GB)
- SQS requests: ~$0.40-0.50/month (first 1M requests free)
- Data transfer: Usually free (S3 → ClickHouse in same region)
- **Total AWS: ~$25/month**

**Cloudflare Costs:**
- Logpush requires Workers Paid plan: $5/month
- No per-GB charges for Logpush

**ClickHouse Cloud Costs:**
- Depends on usage tier and retention
- 1TB/day compressed ~10:1 → ~3TB/month storage
- Estimate: $50-150/month (varies by tier)

**Total: ~$80-180/month for 1TB/day**

Compare to Datadog: ~$3,000-5,000/month for same volume.

## Next Steps {#next-steps}

- Set up [alerts](/use-cases/observability/clickstack/alerts) for security events (DDoS attacks, WAF blocks)
- Create [custom dashboards](/use-cases/observability/clickstack/dashboards) for your specific use cases
- Correlate Cloudflare logs with application traces using RayID
- Optimize retention and TTL policies for cost management

## Additional Resources {#resources}

- [Cloudflare Logpush Documentation](https://developers.cloudflare.com/logs/logpush/)
- [ClickPipes S3 Integration](https://clickhouse.com/docs/integrations/clickpipes/object-storage/s3)
- [Cloudflare Log Fields Reference](https://developers.cloudflare.com/logs/reference/log-fields/)
