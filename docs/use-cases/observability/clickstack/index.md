---
slug: /use-cases/observability/clickstack
title: 'ClickStack - The ClickHouse Observability Stack'
pagination_prev: null
pagination_next: null
description: 'Landing page for the ClickHouse Observability Stack'
keywords: ['ClickStack', 'observability stack', 'HyperDX', 'OpenTelemetry', 'logs', 'traces', 'metrics']
doc_type: 'landing-page'
---

**ClickStack** is an open source, production-grade observability platform built on ClickHouse and OpenTelemetry (OTel) that unifies logs, traces, metrics, and sessions in a single high-performance solution. It enables developers and SREs to monitor and debug complex systems end-to-end without switching tools or manually correlating data.

ClickStack can be deployed in two ways. With **ClickStack Open Source**, you run and manage all components yourself, including ClickHouse, the ClickStack UI (HyperDX), and the OpenTelemetry Collector. With **Managed ClickStack**, ClickHouse and the ClickStack UI (HyperDX) are fully managed in ClickHouse Cloud, including authentication and operational concerns, leaving you to run only the OpenTelemetry Collector that receives telemetry from your workloads and forwards it via OTLP to ClickHouse Cloud.

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | Introduction to ClickStack and its key features |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | Quick start guide and basic setup instructions |
| [Sample Datasets](/use-cases/observability/clickstack/sample-datasets) | Sample datasets and use cases |
| [Architecture](/use-cases/observability/clickstack/architecture) | System architecture and components overview |
| [Deployment](/use-cases/observability/clickstack/deployment) | Deployment guides and options |
| [Configuration](/use-cases/observability/clickstack/config) | Detailed configuration options and settings |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | Guidelines for ingesting data to ClickStack |
| [Search](/use-cases/observability/clickstack/search) | How to search and query your observability data |
| [Production](/use-cases/observability/clickstack/production) | Best practices for production deployment |
