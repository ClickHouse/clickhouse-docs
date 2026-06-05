---
slug: /use-cases/observability/clickstack/example-datasets/instrument-app
title: 'Instrument an application with Managed ClickStack'
unlisted: true
pagination_prev: null
pagination_next: null
description: 'Guide to instrument a Node.js application with OpenTelemetry and send logs, metrics, and traces to Managed ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'instrumentation', 'opentelemetry', 'managed clickstack', 'observability']
---

import Image from '@theme/IdealImage';
import hackernews_main from '@site/static/images/clickstack/getting-started/hackernews_main.png';
import instrument_app_clickstack_logs from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_logs.png';
import instrument_app_clickstack_traces from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_traces.png';
import instrument_app_clickstack_sessions from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_sessions.png';

This guide shows how to instrument a simple Node.js application using OpenTelemetry and send its logs, metrics, and traces to [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed). The backend is instrumented with no changes to the application source code.

The [HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) is a small Node.js app that queries the HackerNews dataset hosted in the public ClickHouse demo instance. Every chart, table, and search box is backed by a real ClickHouse query, so every interaction produces a trace whose main span is the HTTPS call from the backend out to ClickHouse.

## Prerequisites {#prerequisites}

- An OTel collector available and reachable, ingesting into your Managed ClickStack service. You need its OTLP endpoint and an ingestion token.
- Node 18+ and npm.

## Running the demo {#running-the-demo}

<VerticalStepper headerLevel="h3">

### Clone and run the application {#clone-and-run-the-application}

Clone the repository, install dependencies, and create your `.env` file:

```bash
git clone https://github.com/ClickHouse/hn-news-analyzer.git
cd hn-news-analyzer
npm install
cp .env.example .env
```

The ClickHouse data source defaults to the public read-only demo cluster, so the app runs without any further configuration. Start it:

```bash
./run.sh
```

Open [http://localhost:5001](http://localhost:5001). You will see a year selector, summary statistics, an activity chart, top users and domains tables, and a search box. Click around: switch years, drill into stories.

<Image img={hackernews_main} alt="The HackerNews Analyzer application running locally"/>

At this point the application is running but uninstrumented. ClickStack shows no data: it is waiting for telemetry. This is the "before" state.

## Step 2 — Get the connection details {#get-connection-details}

The application needs two values to reach the collector:

- `OTEL_EXPORTER_OTLP_ENDPOINT` — the OTLP endpoint your collector exposes (commonly port `4318` for OTLP over HTTP).
- `OTEL_EXPORTER_OTLP_HEADERS` — the authorization header carrying your ingestion token, in the form `authorization=<token>`.

Open `.env` and set them:

```bash
OTEL_SERVICE_NAME=hn-analyzer-api
OTEL_EXPORTER_OTLP_ENDPOINT=https://<your-collector-endpoint>:4318
OTEL_EXPORTER_OTLP_HEADERS=authorization=<your-ingestion-token>
```

The SDK uses `OTEL_EXPORTER_OTLP_HEADERS` to set the authorization header for all three signals: traces, metrics, and logs. If your collector runs locally and doesn't enforce auth, you can leave the value empty (`OTEL_EXPORTER_OTLP_HEADERS=authorization=`), but the variable must be present — the SDK skips initialization entirely if it's unset or fully empty.

## Step 3 — Instrument the application {#instrument-the-application}

Instrumentation has three parts: install the SDKs, switch the launch command, and enable the browser SDK. None of it changes the application's business logic.

### Install the SDKs {#install-sdks}

Install both the backend and browser OpenTelemetry SDKs:

```bash
npm install @hyperdx/node-opentelemetry @hyperdx/browser
```

### Use the opentelemetry-instrument CLI {#use-open-telemetry-cli}

The application is launched by `run.sh`, which has two `exec` lines at the bottom: one active, one commented. Switch which one is active so Node is wrapped by `opentelemetry-instrument`:

```diff
 # BEFORE — plain node, no instrumentation, collector stays silent:
-exec node scripts/entrypoint.js
+# exec node scripts/entrypoint.js

 # AFTER — same source, wrapped by opentelemetry-instrument CLI.
-# exec npx opentelemetry-instrument scripts/entrypoint.js
+exec npx opentelemetry-instrument scripts/entrypoint.js
```

That is the entire backend change. The auto-instrumentation is loaded by `opentelemetry-instrument` at process start.

### Enable the browser SDK {#enable-browser-sdk}

To capture distributed traces (browser to backend) and session replays, enable the browser SDK in `src/web/telemetry.ts`. Uncomment the import and the `HyperDX.init({...})` block:

```javascript
import HyperDX from '@hyperdx/browser';

export function initTelemetry(): void {
  HyperDX.init({
    url: __OTLP_ENDPOINT__,
    apiKey: __OTLP_AUTH_TOKEN__,
    service: 'hn-analyzer-web',
    tracePropagationTargets: [/localhost:5001/i, /\/api\//i],
    consoleCapture: true,
    advancedNetworkCapture: true,
  });
}
```

No extra `.env` edits are required. `__OTLP_ENDPOINT__` and `__OTLP_AUTH_TOKEN__` are compile-time constants injected by `vite.config.ts`: the endpoint is `OTEL_EXPORTER_OTLP_ENDPOINT` and the token is parsed out of `OTEL_EXPORTER_OTLP_HEADERS`, the same values the backend uses.

> **Security note:** The ingestion token is baked into the public browser bundle and is readable by anyone inspecting the network tab.

## Step 4 — Generate traffic and view telemetry {#generate-traffic-and-view-telemetry}

Restart the application so the new launch command and freshly built browser bundle take effect:

```bash
# Ctrl-C the previous run, then:
./run.sh
```

Reload the browser tab so Vite serves the updated bundle, then refresh the app a few times, switch years, and click into stories to generate traffic.

Open the ClickStack UI:

1. Go to **Search** and filter to the last 5 minutes. Logs for `hn-analyzer-api` stream in.

<Image img={instrument_app_clickstack_logs} alt="ClickStack Logs"/>

2. Click into a request and walk up the trace. You will see the Express handler span, a child HTTP span pointing at the ClickHouse cluster with real network duration, and correlated `console.log` records on the same trace.

<Image img={instrument_app_clickstack_traces} alt="ClickStack Traces"/>

3. Open **Session Replay** to play back a scrubbable video of a browser session, synced to the trace timeline.

<Image img={instrument_app_clickstack_sessions} alt="ClickStack Sessions"/>

Logs, metrics, traces, and session replays all land in the same UI, share the same query language, and are correlated automatically.

## Summary {#summary}

Instrumenting this application took three actions: installing the OpenTelemetry packages, wrapping the launch command, and uncommenting the browser init block. No business logic changed. With an OTLP endpoint and an ingestion token, the collector and Managed ClickStack handled ingestion, scaling, storage, and schema, and logs, metrics, traces, and session replays arrived correlated in a single UI.
