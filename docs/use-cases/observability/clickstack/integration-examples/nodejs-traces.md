---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: 'Monitoring Node.js Traces with ClickStack'
sidebar_label: 'Node.js Traces'
pagination_prev: null
pagination_next: null
description: 'Monitoring Node.js application traces with ClickStack'
doc_type: 'guide'
keywords: ['Node.js', 'traces', 'OTEL', 'ClickStack', 'distributed tracing']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import api_key from '@site/static/images/clickstack/api-key.png';
import search_view from '@site/static/images/clickstack/nodejs/traces-search-view.png';
import trace_view from '@site/static/images/clickstack/nodejs/trace-view.png';
import finish_import from '@site/static/images/clickstack/nodejs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/nodejs/example-traces-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Node.js Traces with ClickStack {#nodejs-traces-clickstack}

:::note[TL;DR]
This guide shows you how to capture distributed traces from your Node.js application and visualize them in ClickStack using OpenTelemetry automatic instrumentation. You'll learn how to:

- Install and configure OpenTelemetry for Node.js with automatic instrumentation
- Send traces to ClickStack's OTLP endpoint
- Verify traces are appearing in HyperDX
- Use a pre-built dashboard to visualize application performance

A demo dataset with sample traces is available if you want to test the integration before instrumenting your production application.

Time Required: 10-15 minutes
:::

## Integration with existing Node.js application {#existing-nodejs}

This section covers adding distributed tracing to your existing Node.js application using OpenTelemetry's automatic instrumentation.

If you would like to test the integration before configuring your own existing setup, you can test with our preconfigured setup and sample data in the [demo dataset section](#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running with OTLP endpoints accessible (ports 4317/4318)
- Existing Node.js application (Node.js 14 or higher)
- npm or yarn package manager
- ClickStack hostname or IP address

<VerticalStepper headerLevel="h4">

#### Install OpenTelemetry package {#install-package}

Install the HyperDX OpenTelemetry package which includes automatic instrumentation for popular Node.js frameworks:

```bash
npm install @hyperdx/node-opentelemetry
```

This package includes automatic instrumentation for:
- **Express**, **Koa**, **Fastify** (web frameworks)
- **HTTP/HTTPS** (outgoing requests)
- **MongoDB**, **PostgreSQL**, **Redis** (databases)
- **AWS SDK**, **gRPC** (cloud services)

:::note
For the complete list of automatically instrumented libraries, see the [OpenTelemetry Node.js instrumentation documentation](https://opentelemetry.io/docs/languages/js/libraries/).
:::

#### Configure OpenTelemetry in your application {#configure-otel}

Add OpenTelemetry initialization at the **very beginning** of your application's entry point (typically `index.js`, `server.js`, or `app.js`).

**Important:** This must be the first code that runs, before any other imports.

```javascript
// This MUST be first - before any other requires/imports
const HyperDX = require('@hyperdx/node-opentelemetry');

HyperDX.init({
    apiKey: process.env.CLICKSTACK_API_KEY,
    service: 'my-nodejs-app',
    endpoint: process.env.CLICKSTACK_ENDPOINT || 'http://localhost:4318'
});

// Now import your application code
const express = require('express');
const app = express();

// Your application code...
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

For ES modules (using `import`):

```javascript
// This MUST be first
import * as HyperDX from '@hyperdx/node-opentelemetry';

HyperDX.init({
    apiKey: process.env.CLICKSTACK_API_KEY,
    service: 'my-nodejs-app',
    endpoint: process.env.CLICKSTACK_ENDPOINT || 'http://localhost:4318'
});

// Now import your application code
import express from 'express';
const app = express();
// ... rest of your code
```

##### Understanding the configuration {#understanding-configuration}

**Configuration options:**
- `apiKey`: Your ClickStack Ingestion API Key (required)
- `service`: A name to identify your application in HyperDX (required)
- `endpoint`: ClickStack OTLP HTTP endpoint (default: http://localhost:4318)

**What gets traced automatically:**
- HTTP requests (incoming and outgoing)
- Database queries (MongoDB, PostgreSQL, MySQL, Redis)
- Framework routing (Express, Koa, Fastify)
- AWS SDK calls
- gRPC calls

Each trace includes:
- Request method, path, and status code
- Response time
- Error details (if any)
- Database query details
- External API calls

#### Get ClickStack API key {#get-api-key}

1. Open HyperDX at your ClickStack URL
2. Navigate to **Team Settings → API Keys**
3. Copy your **Ingestion API Key**
4. Set it as an environment variable:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Run your application {#run-application}

Start your Node.js application with the environment variables set:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export CLICKSTACK_ENDPOINT=http://your-clickstack-host:4318

node index.js
```

Or add them to your `.env` file if using a package like `dotenv`:

```env
CLICKSTACK_API_KEY=your-api-key-here
CLICKSTACK_ENDPOINT=http://localhost:4318
```

#### Generate some traffic {#generate-traffic}

Make requests to your application to generate traces:

```bash
# Simple requests
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# Simulate load
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### Verify traces in HyperDX {#verify-traces}

Once configured, log into HyperDX and verify traces are flowing. You should see something like this. If you don't see traces, try adjusting your time range:

Click on any trace to see the detailed view with spans, timing, and attributes:

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test Node.js tracing with ClickStack before instrumenting their production applications, we provide a sample dataset of pre-generated Node.js application traces with realistic traffic patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

Download the sample traces file:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### Start ClickStack {#start-clickstack}

If you don't have ClickStack running yet, start it with:

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

#### Get ClickStack API key {#get-api-key}

An API key to send traces to ClickStack's OTLP endpoint.

1. Open HyperDX at your ClickStack URL (e.g., http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

#### Send traces to ClickStack {#send-traces}

Set your API key as an environment variable:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

Then send the traces to ClickStack:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

You should see a response like `{"partialSuccess":{}}` indicating the traces were successfully sent. All 1,000 traces will be ingested into ClickStack.

#### Verify traces in HyperDX {#verify-demo-traces}

1. Open [HyperDX](http://localhost:8080/) and log in to your account (you may need to create an account first)
2. Navigate to the **Search** view and set the source to **Traces**
3. Set the time range to **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

<Image img={search_view} alt="Traces search view"/>

<Image img={trace_view} alt="Individual trace view"/>

:::note[Timezone Display]
HyperDX displays timestamps in your browser's local timezone. The demo data spans **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**. The wide time range ensures you'll see the demo traces regardless of your location. Once you see the traces, you can narrow the range to a 24-hour period for clearer visualizations.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring Node.js application performance, we provide a pre-built dashboard with essential trace visualizations.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.nodejs_traces_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download-dashboard}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the **Dashboards** section
2. Click **Import Dashboard** in the upper right corner (under the ellipses)

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the `nodejs-traces-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import"/>

#### The dashboard will be created with all visualizations pre-configured {#created-dashboard}

<Image img={example_dashboard} alt="Example dashboard"/>

:::note
For the demo dataset, set the time range to **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (adjust based on your local timezone). The imported dashboard will not have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No traces appearing in HyperDX {#no-traces}

**Verify OpenTelemetry is initialized:**
Check that `HyperDX.init()` is called **before** any other imports. The initialization must happen first:

```javascript
// CORRECT - init is first
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({ /* config */ });
const express = require('express');

// WRONG - other imports before init
const express = require('express');
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({ /* config */ });
```

**Check environment variables are set:**
```bash
echo $CLICKSTACK_API_KEY
echo $CLICKSTACK_ENDPOINT
```
Both should output the correct values (not empty).

**Verify network connectivity:**
```bash
# Test OTLP HTTP endpoint
curl http://your-clickstack-host:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d '{"resourceSpans":[]}'
```
Should return a 200 OK response.

**Check application logs:**
Look for OpenTelemetry initialization messages when your app starts. The HyperDX SDK should output confirmation that it's configured.

**Verify your application is receiving requests:**
```bash
# Generate test traffic
curl http://localhost:3000/
```
Check your application logs to confirm requests are being processed.

## Next steps {#next-steps}

Now that you have traces flowing from your Node.js application, consider:

- **Add logs and metrics**: Complete the observability picture with the [Node.js SDK guide](/use-cases/observability/clickstack/sdks/nodejs)
- **Set up alerts**: Create alerts for high error rates or latency spikes
- **Custom instrumentation**: Add manual spans for business-critical operations
- **Trace sampling**: For high-traffic applications, configure sampling strategies to reduce data volume

## Going to production {#going-to-production}

This guide uses the HyperDX SDK which sends traces directly to ClickStack's OTLP endpoint. This works well for development, testing, and small-to-medium production deployments.
For larger production environments or if you need additional control over telemetry data, consider deploying your own OpenTelemetry Collector as an agent. 
See [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production deployment patterns and collector configuration examples.
