---
slug: /use-cases/observability
title: 'Observability'
pagination_prev: null
pagination_next: null
description: 'Landing page for the Observability use case guide'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
---

Welcome to our Observability use case guide. In this guide you'll learn how you can get setup and use ClickHouse for Observability.

Navigate to the pages below to explore the different sections of this guide.

| Page                                                        | Description                                                                                                                                                                                                              |
|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](./introduction.md)                           | This guide is designed for users looking to build their own SQL-based Observability solution using ClickHouse, focusing on logs and traces.                                                                              |
| [Schema design](./schema-design.md)                         | Learn why users are recommended to create their own schema for logs and traces, along with some best practices for doing so.                                                                                             |
| [Managing data](./managing-data.md)                         | Deployments of ClickHouse for Observability invariably involve large datasets, which need to be managed. ClickHouse offers a number of features to assist with data management.                                          |
| [Integrating OpenTelemetry](./integrating-opentelemetry.md) | Any Observability solution requires a means of collecting and exporting logs and traces. For this purpose, ClickHouse recommends the OpenTelemetry (OTel) project. Learn more about how to integrate it with ClickHouse. |
| [Using Grafana](./grafana.md)                               | Learn how to use Grafana, the preferred visualization tool for Observability data in ClickHouse, with ClickHouse.
| [Demo Application](./demo-application.md)                   | The Open Telemetry project includes a demo application. A maintained fork of this application with ClickHouse as a data source for logs and traces can be found linked on this page.|
