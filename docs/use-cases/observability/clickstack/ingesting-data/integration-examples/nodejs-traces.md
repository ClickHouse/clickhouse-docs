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

This section covers adding distributed tracing to your existing Node.js application using OpenTelemetry automatic instrumentation.

If you would like to test the integration before configuring your own existing setup, you can test with our preconfigured setup and sample data in the [demo dataset section](#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running with OTLP endpoints accessible (ports 4317/4318)
- Existing Node.js application (Node.js 14 or higher)
- npm or yarn package manager
- ClickStack hostname or IP address

<VerticalStepper headerLevel="h4">

#### Install and configure OpenTelemetry {#install-configure}

Install the `@hyperdx/node-opentelemetry` package and initialize it at the start of your application. See the [Node.js SDK guide](/use-cases/observability/clickstack/sdks/nodejs#getting-started) for detailed installation steps.

#### Get ClickStack API key {#get-api-key}

An API key to send traces to ClickStack's OTLP endpoint.

1. Open HyperDX at your ClickStack URL (e.g., http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

#### Run your application {#run-application}

Start your Node.js application with the environment variables set:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
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

<Image img={search_view} alt="Traces search view"/>

Click on any trace to see the detailed view with spans, timing, and attributes:

<Image img={trace_view} alt="Individual trace view"/>

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
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### Get ClickStack API key {#get-api-key-demo}

An API key to send traces to ClickStack's OTLP endpoint.

1. Open HyperDX at your ClickStack URL (e.g., http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

Set your API key as an environment variable:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Send the traces to ClickStack {#send-traces}

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

You should see a response like `{"partialSuccess":{}}` indicating the traces were successfully sent.

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

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.node_traces_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download-dashboard}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the **Dashboards** section
2. Click **Import Dashboard** in the upper right corner (under the ellipses)

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Upload the `nodejs-traces-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import"/>

#### The dashboard will be created with all visualizations pre-configured {#created-dashboard}

<Image img={example_dashboard} alt="Example dashboard"/>

:::note
For the demo dataset, set the time range to **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (adjust based on your local timezone). The imported dashboard won't have a time range specified by default.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Demo traces not appearing via curl {#demo-traces-not-appearing}

If you've sent traces via curl but don't see them in HyperDX, try sending the traces a second time:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

This is a known issue that occurs when using the demo approach via curl and doesn't affect instrumented production applications.

### No traces appearing in HyperDX {#no-traces}

**Verify environment variables are set:**

```bash
echo $CLICKSTACK_API_KEY
# Should output your API key

echo $OTEL_EXPORTER_OTLP_ENDPOINT
# Should output http://localhost:4318 or your ClickStack host
```

**Verify network connectivity:**

```bash
curl -v http://localhost:4318/v1/traces
```
Should connect successfully to the OTLP endpoint.

**Check application logs:**
Look for OpenTelemetry initialization messages when your app starts. The HyperDX SDK should output confirmation that it's initialized.

## Next steps {#next-steps}
If you want to explore further, here are some next steps to experiment with your dashboard:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical metrics (error rates, latency thresholds)
- Create additional dashboards for specific use cases (API monitoring, security events)

## Going to production {#going-to-production}

This guide uses the HyperDX SDK which sends traces directly to ClickStack's OTLP endpoint. This works well for development, testing, and small-to-medium production deployments.
For larger production environments or if you need additional control over telemetry data, consider deploying your own OpenTelemetry Collector as an agent. 
See [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production deployment patterns and collector configuration examples.
