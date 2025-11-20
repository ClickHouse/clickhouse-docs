---
title: '演示应用程序'
description: '用于可观测性的演示应用程序'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry 项目包含一个[演示应用程序](https://opentelemetry.io/docs/demo/)。该应用程序有一个持续维护的分支版本，将 ClickHouse 用作日志和追踪的数据源，可在[此处](https://github.com/ClickHouse/opentelemetry-demo)获取。可以按照[官方演示说明](https://opentelemetry.io/docs/demo/docker-deployment/)使用 Docker 部署此演示。除了[现有组件](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)之外，还会额外部署一个 ClickHouse 实例，用于存储日志和追踪数据。