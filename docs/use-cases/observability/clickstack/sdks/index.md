---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'Language SDKs for ClickStack - The ClickHouse Observability Stack'
title: 'SDKs'
---

Users typically send data to ClickStack via the **OpenTelemetry Collector**, either directly from language SDKs or through intermediate OpenTelemetry collector acting as agents e.g. collecting infrastructure metrics and logs.

Language SDKs are responsible for collecting telemetry from within your application - most notably **traces** and **logs** - and exporting this data to the OpenTelemetry Collector, via the otlp endpoint, which handles ingestion into ClickHouse.

In browser-based environments, SDKs may also be responsible for collecting **session data**, including UI events, clicks, and navigation thus enabling replays of user sessions. 

## How It Works {#how-it-works}

1. Your application uses a a ClickStack SDK (e.g., Node.js, Python, Go). These SDKs are based on the OpenTelemtry SDKs with additional features and usability enhancements.
2. The SDK collects and exports traces and logs via OTLP (HTTP or gRPC).
3. The OpenTelemetry Collector receives the telemetry and writes it to ClickHouse via the configured exporters.

## Supported Languages {#supported-languages}




