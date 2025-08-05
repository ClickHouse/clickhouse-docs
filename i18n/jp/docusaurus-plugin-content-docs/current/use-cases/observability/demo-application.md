---
title: 'デモアプリケーション'
description: '可観測性のためのデモアプリケーション'
slug: '/observability/demo-application'
keywords:
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---



The Open Telemetry project includes a [デモアプリケーション](https://opentelemetry.io/docs/demo/). A maintained fork of this application with ClickHouse as a data source for logs and traces can be found [こちら](https://github.com/ClickHouse/opentelemetry-demo). The [公式デモ手順](https://opentelemetry.io/docs/demo/docker-deployment/) can be followed to deploy this demo with docker. In addition to the [既存のコンポーネント](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/), an instance of ClickHouse will be deployed and used for the storage of logs and traces.
