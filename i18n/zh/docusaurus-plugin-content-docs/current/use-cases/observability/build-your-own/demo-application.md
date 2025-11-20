---
title: '演示应用'
description: '用于可观测性的演示应用'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry 项目包含一个[演示应用](https://opentelemetry.io/docs/demo/)。该应用有一个由 ClickHouse 维护的分支，将 ClickHouse 作为日志和追踪的数据源，可以在[这里](https://github.com/ClickHouse/opentelemetry-demo)找到。你可以按照[官方演示指南](https://opentelemetry.io/docs/demo/docker-deployment/)使用 Docker 部署此演示。除了[现有组件](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)之外，还会部署一个 ClickHouse 实例，用于存储日志和追踪数据。