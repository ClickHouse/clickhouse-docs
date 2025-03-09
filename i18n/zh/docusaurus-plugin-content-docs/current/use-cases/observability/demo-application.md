---
title: '演示应用程序'
description: '用于可观察性的演示应用程序'
slug: /observability/demo-application
keywords: ['可观察性', '日志', '追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
---

Open Telemetry 项目包含一个 [演示应用程序](https://opentelemetry.io/docs/demo/)。一个维护中的分支版本，该版本使用 ClickHouse 作为日志和追踪的数据源，可以在 [这里](https://github.com/ClickHouse/opentelemetry-demo) 找到。可以按照 [官方演示说明](https://opentelemetry.io/docs/demo/docker-deployment/) 使用 docker 部署此演示。除了 [现有组件](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) 之外，还将部署一个 ClickHouse 实例，并用于存储日志和追踪。
