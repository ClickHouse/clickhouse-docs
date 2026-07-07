---
slug: /use-cases/observability/clickstack/example-datasets/instrument-app
title: 'Instrument an application with Managed ClickStack'
sidebar_label: 'HackerNews Analyzer demo'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'Guide to instrument a Node.js application with OpenTelemetry and send logs, metrics, and traces to Managed ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'instrumentation', 'opentelemetry', 'managed clickstack', 'observability']
---

import InstrumentApplication from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

This guide shows how to instrument a simple Node.js application using OpenTelemetry and send its logs, metrics, and traces to [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed). The backend is instrumented with no changes to the application source code.

The [HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) is a small Node.js app that queries the HackerNews dataset hosted in the public ClickHouse demo instance. Every chart, table, and search box is backed by a real ClickHouse query, so every interaction produces a trace whose main span is the HTTPS call from the backend out to ClickHouse.

## Prerequisites {#prerequisites}

- An OTel collector available and reachable, ingesting into your Managed ClickStack service. You need its OTLP endpoint and an ingestion token.
- Node 18+ and npm.

<InstrumentApplication />

## Learn more {#learn-more}

- [Session Replay](/use-cases/observability/clickstack/session-replay): feature overview, SDK options, and privacy controls.
- [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo): a self-contained demo with a local ClickStack instance.
- [ClickStack Getting Started](/use-cases/observability/clickstack/getting-started): deploy ClickStack and ingest your first data.
- [All Sample Datasets](/use-cases/observability/clickstack/sample-datasets): other example datasets and guides.
