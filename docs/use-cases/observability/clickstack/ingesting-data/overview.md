---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Ingesting data into ClickStack'
sidebar_label: 'Overview'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'Overview for ingesting data to ClickStack'
---

All data is ingested into ClickStack via the **OpenTelemetry Collector**, which acts as the primary entry point for logs, metrics, traces, and session data.


_INSERT_DIAGRAM_


This collector exposes two OTLP endpoints:

- **HTTP** - port `4318`
- **gRPC** - port `4317`

Users can send data to these endpoints either directly from [language SDKs](/use-cases/observability/clickstack/sdks) or through intermediate OpenTelemetry collector acting as agents e.g. collecting infrastructure metrics and logs.

More specifically:

- [**Language SDKs**](/use-cases/observability/clickstack/sdks) are responsible for collecting telemetry from within your application - most notably **traces** and **logs** - and exporting this data to the OpenTelemetry Collector, via the OTLP endpoint, which handles ingestion into ClickHouse. For more details on the language SDKs available with ClickStack see [SDKs](/use-cases/observability/clickstack/sdks)

- **OpenTelemetry agents** are OTel collector instances deployed at the edge—on servers, Kubernetes nodes, or alongside applications. They collect infrastructure telemetry (e.g. logs, metrics) or receive events directly from applications instrumented with SDKs. In this case, the agent runs on the same host as the application, often as a sidecar or DaemonSet. These agents forward data to the central ClickStack OTel collector, which acts as a gateway, typically deployed once per cluster, data center, or region. The gateway receives OTLP events from agents or applications and handles ingestion into ClickHouse. See [OTel Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) for more details.

