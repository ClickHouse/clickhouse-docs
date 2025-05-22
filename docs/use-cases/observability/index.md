---
slug: /use-cases/observability
title: 'Observability'
pagination_prev: null
pagination_next: null
description: 'Landing page for the Observability use case guide'
---

ClickHouse offers unmatched speed, scale, and cost-efficiency for observability. This guide provides two paths depending on your needs:

## ClickStack - The ClickHouse Observability Stack {#clickstack}

The ClickHouse Observability Stack is our **recommended approach** for most users.

It provides an opinionated, scalable solution that works out of the box — from single-node deployments to **multi-petabyte** scale.

| Page                                              | Description                                                                                         |
|---------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| [Getting started](./clickhouse-stack/getting-started.md)   | Quickly get started with the ClickHouse Observability Stack.                                         |
| [Architecture](./clickhouse-stack/architecture.md)        | Learn about the ClickHouse Observability Stack architecture.                                         |
| [Deployment](./clickhouse-stack/deployment.md)            | For users moving beyond the getting started experience and needing alternative deployment options.  |
| [Scaling](./clickhouse-stack/scaling.md)                  | Learn how to scale components of the ClickHouse Observability Stack.                                 |
| [Production](./clickhouse-stack/production.md)            | Considerations for taking the stack to production.                                                   |

## Build-Your-Own Stack {#build-your-own-stack}

For users with **custom requirements** — such as highly specialized ingestion pipelines, schema designs, or extreme scaling needs — we provide guidance to build a custom observability stack with ClickHouse as the core database.

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](./build-your-own/introduction.md)            | This guide is designed for users looking to build their own observability solution using ClickHouse, focusing on logs and traces.                                             |
| [Schema design](./build-your-own/schema-design.md)          | Learn why users are recommended to create their own schema for logs and traces, along with some best practices for doing so.                                                  |
| [Managing data](./build-your-own/managing-data.md)          | Deployments of ClickHouse for observability invariably involve large datasets, which need to be managed. ClickHouse offers features to assist with data management.           |
| [Integrating OpenTelemetry](./build-your-own/integrating-opentelemetry.md) | Collecting and exporting logs and traces using OpenTelemetry with ClickHouse.                                                           |
| [Using Visualization Tools](./build-your-own/grafana.md)    | Learn how to use observability visualization tools for ClickHouse, including HyperDX and Grafana.                                       |
| [Demo Application](./build-your-own/demo-application.md)    | Explore the OpenTelemetry demo application forked to work with ClickHouse for logs and traces.                                           |
