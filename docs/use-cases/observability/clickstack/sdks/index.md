---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'Language SDKs for ClickStack - The ClickHouse Observability Stack'
title: 'Language SDKs'
---

Users typically send data to ClickStack via the **OpenTelemetry Collector**, either directly from language SDKs or through intermediate OpenTelemetry collector acting as agents e.g. collecting infrastructure metrics and logs.

Language SDKs are responsible for collecting telemetry from within your application - most notably **traces** and **logs** - and exporting this data to the OpenTelemetry Collector, via the OTLP endpoint, which handles ingestion into ClickHouse.

In browser-based environments, SDKs may also be responsible for collecting **session data**, including UI events, clicks, and navigation thus enabling replays of user sessions. 

## How It Works {#how-it-works}

1. Your application uses a a ClickStack SDK (e.g., Node.js, Python, Go). These SDKs are based on the OpenTelemetry SDKs with additional features and usability enhancements.
2. The SDK collects and exports traces and logs via OTLP (HTTP or gRPC).
3. The OpenTelemetry Collector receives the telemetry and writes it to ClickHouse via the configured exporters.

## Supported Languages {#supported-languages}

<br/>

| Language | Description | Link |
|----------|-------------|------|
| Browser | JavaScript SDK for Browser-based applications | [Documentation](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir applications | [Documentation](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go applications and microservices | [Documentation](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java applications | [Documentation](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS applications | [Documentation](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js applications | [Documentation](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | JavaScript runtime for server-side applications | [Documentation](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno applications | [Documentation](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python applications and web services | [Documentation](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native mobile applications | [Documentation](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails applications and web services | [Documentation](/use-cases/observability/clickstack/sdks/ruby-on-rails) |




