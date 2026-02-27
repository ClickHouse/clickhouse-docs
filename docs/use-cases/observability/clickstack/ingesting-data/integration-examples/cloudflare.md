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
import clickpipe_s3 from '@site/static/images/clickstack/cloudflare/clickpipe-s3.png';
import continuous_ingestion from '@site/static/images/clickstack/cloudflare/continuous-ingestion.png';
import parse_information from '@site/static/images/clickstack/cloudflare/parse-information.png';
import add_source from '@site/static/images/clickstack/cloudflare/add-source.png';
import configure_optional from '@site/static/images/clickstack/cloudflare/configure-optional-fields.png';
import save_source from '@site/static/images/clickstack/cloudflare/save-source.png';
import search_view from '@site/static/images/clickstack/cloudflare/search-view.png';
import log_view from '@site/static/images/clickstack/cloudflare/log-view.png';
import import_dashboard from '@site/static/images/clickstack/cloudflare/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudflare/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudflare/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Cloudflare Logs with ClickStack {#cloudflare-clickstack}

:::note[TL;DR]
This guide shows you how to ingest Cloudflare logs into ClickStack using ClickPipes. Cloudflare Logpush writes logs to S3, and ClickPipes continuously ingests new files into ClickHouse. Unlike most ClickStack integration guides that use the OpenTelemetry Collector, this guide uses [ClickPipes](/integrations/clickpipes) to pull data directly from S3.

A demo dataset is available if you want to explore the dashboards before configuring production ingestion.
:::

## Overview {#overview}

Cloudflare [Logpush](https://developers.cloudflare.com/logs/about/) exports HTTP request logs to destinations like Amazon S3. Forwarding these logs to ClickStack allows you to:

- Analyze edge traffic, cache performance, and security events alongside your other observability data
- Query logs using ClickHouse SQL
- Retain logs beyond Cloudflare's default retention

This guide uses [ClickPipes](/integrations/clickpipes) to continuously ingest Cloudflare log files from S3 into ClickHouse.

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

<Image img={clickpipe_s3} alt="Clickpipe s3"/>

**Connection:**
- **S3 file path**: Your Cloudflare logs bucket path with a wildcard to match files. If you enabled daily subfolders in Logpush, use `**` to match across subdirectories:
  - No subfolders: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/*`
  - Daily subfolders: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/**/*`
- **Authentication**: Select your authentication method and provide the credentials or IAM Role ARN

**Ingestion settings:**

Click **Incoming data**, then configure:
- Toggle on **Continuous ingestion**
- **Ordering**: Lexicographical order

<Image img={continuous_ingestion} alt="Continuous ingestion"/>

Cloudflare Logpush writes files with date-based naming (e.g., `20250127/...`), which is naturally lexicographical. ClickPipes polls for new files every 30 seconds and ingests any file with a name greater than the last processed file.

**Schema mapping:**

Click **Parse information**. ClickPipes samples your log files and auto-detects the schema. Review the mapped columns and adjust types as needed. Define a **Sorting key** for the destination table — for Cloudflare logs, a good choice is `(EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)`.

<Image img={parse_information} alt="Parse information"/>

Click **Complete Setup**.

:::note
When first created, ClickPipes performs an initial load of **all existing files** in the specified path before switching to continuous polling. If your bucket contains a large backlog of Cloudflare logs, this initial load may take some time.
:::

#### Configure HyperDX data source {#configure-source}

ClickPipes ingests Cloudflare logs into a flat table with Cloudflare's native field names. To view these logs in HyperDX, configure a custom data source that maps Cloudflare columns to HyperDX's log view.

1. Open HyperDX → **Team Settings** → **Sources**

<Image img={add_source} alt="Add source"/>

2. Click **Add source** and configure the following settings. Click **Configure Optional Fields** to access all fields:

<Image img={configure_optional} alt="Configure optional"/>

| Setting | Value |
|---|---|
| **Name** | `Cloudflare Logs` |
| **Source Data Type** | Log |
| **Database** | `default` |
| **Table** | `cloudflare_http_logs` |
| **Timestamp Column** | `toDateTime(EdgeStartTimestamp / 1000000000)` |
| **Default Select** | `EdgeStartTimestamp, ClientRequestMethod, ClientRequestURI, EdgeResponseStatus, ClientCountry` |
| **Service Name Expression** | `'cloudflare'` |
| **Log Level Expression** | `multiIf(EdgeResponseStatus >= 500, 'ERROR', EdgeResponseStatus >= 400, 'WARN', 'INFO')` |
| **Body Expression** | `concat(ClientRequestMethod, ' ', ClientRequestURI, ' ', toString(EdgeResponseStatus))` |
| **Log Attributes Expression** | `map('http.method', ClientRequestMethod, 'http.status_code', toString(EdgeResponseStatus), 'http.url', ClientRequestURI, 'client.country', ClientCountry, 'client.ip', ClientIP, 'cache.status', CacheCacheStatus, 'bot.score', toString(BotScore), 'cloudflare.ray_id', RayID, 'cloudflare.colo', EdgeColoCode)` |
| **Resource Attributes Expression** | `map('cloudflare.zone', ClientRequestHost)` |
| **Implicit Column Expression** | `concat(ClientRequestMethod, ' ', ClientRequestURI)` |

3. Click **Save Source**

<Image img={save_source} alt="Save source"/>

This maps Cloudflare's native columns directly to HyperDX's log viewer without any data transformation or duplication. The **Body** displays a request summary like `GET /api/v1/users 200`, and all Cloudflare fields are available as searchable attributes.

#### Verify data in HyperDX {#verify-hyperdx}

Navigate to the **Search** view and select the **Cloudflare Logs** source. Set the time range to cover your data. You should see log entries with:

- Request summaries in the Body column (e.g., `GET /api/v1/users 200`)
- Severity levels color-coded by HTTP status (INFO for 2xx, WARN for 4xx, ERROR for 5xx)
- Searchable attributes like `http.status_code`, `client.country`, `cache.status`, and `bot.score`

<Image img={search_view} alt="Search view"/>

<Image img={log_view} alt="Log view"/>

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

#### Configure HyperDX data source {#configure-demo-source}

Follow the [data source configuration steps](#configure-source) to create a HyperDX source pointing to the `cloudflare_http_logs` table. If you already configured the source in the production integration section, this step is not needed.

#### Verify demo data {#verify-demo}

```sql
SELECT count() FROM cloudflare_http_logs;
-- Should return 5000
```

Navigate to the **Search** view in HyperDX, select the **Cloudflare Logs** source, and set the time range to **2026-02-23 00:00:00 - 2026-02-26 00:00:00**.

You should see log entries with request summaries, searchable Cloudflare attributes, and severity levels based on HTTP status codes.

<Image img={search_view} alt="Search view"/>

<Image img={log_view} alt="Log view"/>

:::note[Timezone Display]
HyperDX displays timestamps in your browser's local timezone. The demo data spans **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)**. The wide time range ensures you'll see the demo logs regardless of your location. Once you see the logs, you can narrow the range to a 24-hour period for clearer visualizations.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudflare-logs-dashboard.json')} download="cloudflare-logs-dashboard.json" eventName="docs.cloudflare_logs_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import dashboard {#import-dashboard}

1. HyperDX → **Dashboards** → **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard"/>

2. Upload `cloudflare-logs-dashboard.json` → **Finish Import**

<Image img={finish_import} alt="Import dashboard"/>

#### View dashboard {#view-dashboard}

<Image img={example_dashboard} alt="Example dashboard"/>

:::note
For the demo dataset, set the time range to **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)** (adjust based on your local timezone). The imported dashboard won't have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Data not appearing in ClickHouse {#no-data}

Verify the table was created and contains data:
```sql
SHOW TABLES FROM default LIKE 'cloudflare_http_logs';
SELECT count() FROM cloudflare_http_logs;
```

If the table exists but is empty, check ClickPipes for errors: ClickHouse Cloud Console → **Data Sources** → Your ClickPipe → **Logs**. For authentication issues with private buckets, see the [S3 ClickPipes access control documentation](/docs/integrations/clickpipes/object-storage/s3/overview#access-control).

### Logs not appearing in HyperDX {#no-hyperdx}

If data is in ClickHouse but not visible in HyperDX, check the data source configuration:

- Verify a source exists for `cloudflare_http_logs` under HyperDX → **Team Settings** → **Sources**
- Ensure the **Timestamp Column** is set to `toDateTime(EdgeStartTimestamp / 1000000000)` — Cloudflare timestamps are in nanoseconds and need to be converted
- Verify your time range in HyperDX covers the data. For the demo dataset, use **2026-02-23 00:00:00 - 2026-02-26 00:00:00**

## Next steps {#next-steps}

Now that you have Cloudflare logs flowing into ClickStack:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for security events (WAF blocks, bot traffic spikes, error rate thresholds)
- Optimize [retention policies](/use-cases/observability/clickstack/ttl) based on your data volume
- Create additional dashboards for specific use cases (API performance, cache optimization, geographic traffic analysis)

## Going to production {#going-to-production}

This guide demonstrates ingesting Cloudflare logs using a public demo dataset. For production deployments, configure Cloudflare Logpush to write to your own S3 bucket and set up ClickPipes with [IAM role-based authentication](/docs/cloud/data-sources/secure-s3) for secure access. Select only the [Logpush fields](https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/zone/http_requests/) you need to reduce storage costs and ingestion volume. Enable daily subfolders in Logpush for better file organization and use `**/*` in your ClickPipes path pattern to match across subdirectories.

See the [S3 ClickPipes documentation](/docs/integrations/clickpipes/object-storage/s3/overview) for advanced configuration options including [SQS-based unordered ingestion](/docs/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-any-order) for handling backfills and out-of-order files.
