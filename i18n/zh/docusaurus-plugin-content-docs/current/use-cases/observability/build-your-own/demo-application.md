---
title: '演示应用程序'
description: '可观测性演示应用程序'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry 项目包含一个[演示应用程序](https://opentelemetry.io/docs/demo/)。该应用程序的一个受维护分支使用 ClickHouse 作为日志和追踪的数据源，可以在[这里](https://github.com/ClickHouse/opentelemetry-demo)找到。可以参考[官方演示说明](https://opentelemetry.io/docs/demo/docker-deployment/)使用 Docker 部署此演示应用程序。除了[现有组件](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)之外，还会部署一个 ClickHouse 实例，用于存储日志和追踪数据。