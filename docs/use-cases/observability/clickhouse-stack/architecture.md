---
slug: /use-cases/observability/clickhouse-stack/architecture
pagination_prev: null
pagination_next: null
description: 'Architecture of ClickStack ClickHouse Observability Stack'
title: 'Architecture'
---

The ClickStack architecture is built around three core components: **ClickHouse**, **HyperDX**, and a **OpenTelemetry (OTel) Collector**. A **MongoDB** instance provides storage for application state. Together, they provide a high-performance, open-source observability stack optimized for logs, metrics, and traces.

## Architecture Overview {#architecture-overview}



`ARCHITECURE DIAGRAM`




## ClickHouse: The Database Engine {#clickhouse}

At the heart of ClickStack is ClickHouse, a column-oriented database designed for real-time analytics at scale. It powers the ingestion and querying of observability data, enabling:

- Sub-second search across terabytes of events
- Ingestion of billions of high-cardinality records per day
- High compression rates for atleast 10x on observability data
- Native support for semi-structured JSON data, allowing dynamic schema evolution
- A powerful SQL engine with hundreds of built-in analytical functions

ClickHouse handles observability data as wide events, allowing for deep correlation across logs, metrics, and traces in a single unified structure.

## OpenTelemetry Collector: Data Ingestion {#open-telemetry-collector}

ClickStack includes a pre-configured OpenTelemetry (OTel) Collector to ingest telemetry in an open, standardized way. Users can send data using the oltp protocol via:

- gRPC (port `4317`)
- HTTP (port `4318`)

The collector exports telemetry to ClickHouse in efficient batches. It supports optimized table schemas per data source, ensuring scalable performance across all signal types.

## HyperDX: The Interface {#hyperdx}

HyperDX is the user interface for ClickStack. It offers:

- Natural language and Lucene-style search
- Live tailing for real-time debugging
- Unified views of logs, metrics, and traces
- Session replay for frontend observability
- Dashboard creation and alert configuration
- SQL query interface for advanced analysis

Designed specifically for ClickHouse, HyperDX combines powerful search with intuitive workflows, enabling users to spot anomalies, investigate issues, and gain insights fast. 

## MongoDB: Application State {#mongo}

ClickStack uses MongoDB to store application-level state, including:

- Dashboards
- Alerts
- User profiles
- Saved visualizations

This separation of state from event data ensures performance and scalability while simplifying backup and configuration.

This modular architecture enables ClickStack to deliver an out-of-the-box observability platform that is fast, flexible, and open-source.
