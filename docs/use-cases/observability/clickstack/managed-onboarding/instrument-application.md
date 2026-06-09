---
slug: /use-cases/observability/clickstack/instrument-application
title: 'Instrument an application in 5 mins with ClickStack'
description: 'Instrument a Node.js application with OpenTelemetry and send its logs, metrics, and traces into Managed ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'instrumentation', 'opentelemetry', 'managed', 'observability', 'sdk', 'nodejs']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import InstrumentApplication from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

This guide shows how to instrument a small Node.js application with OpenTelemetry and send its logs, metrics, and traces into Managed ClickStack. The backend is instrumented with no changes to the application source code.

The [HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) is a Node.js app that queries the HackerNews dataset hosted in the public ClickHouse demo. Every chart, table, and search box is backed by a real ClickHouse query, so every interaction produces a trace whose main span is the HTTPS call from the backend out to ClickHouse.

This guide assumes you've completed [Setting up your OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) and have a ClickStack collector running and reachable from the machine you run this application on. **Ensure you have recorded its OTLP endpoint** and the `OTLP_AUTH_TOKEN` you set when deploying it.

## Prerequisites {#prerequisites}

- A ClickStack collector reachable from this machine. If you haven't deployed one yet, follow [Setting up your OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) first.
- The OTLP endpoint of that collector and the `OTLP_AUTH_TOKEN` you set on it.
- Node 18+ and npm.

<InstrumentApplication />

## Further reading {#further-reading}

- [Monitoring Kubernetes](/use-cases/observability/clickstack/monitoring-kubernetes): collect logs, infra metrics, and Kubernetes events from a cluster.
- [Monitoring AWS CloudWatch logs](/use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs): forward CloudWatch logs via the OpenTelemetry CloudWatch receiver.
- [Session Replay](/use-cases/observability/clickstack/session-replay): feature overview, SDK options, and privacy controls.
- [Going to production](/use-cases/observability/clickstack/production) for recommendations when going to production.
