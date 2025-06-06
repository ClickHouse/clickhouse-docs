---
'title': '演示应用程序'
'description': '用于可观测性的演示应用程序'
'slug': '/observability/demo-application'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

OpenTelemetry 项目包含一个 [演示应用程序](https://opentelemetry.io/docs/demo/)。一个维护的该应用程序的分支，使用 ClickHouse 作为日志和跟踪的数据源，可以在 [这里](https://github.com/ClickHouse/opentelemetry-demo) 找到。可以按照 [官方演示说明](https://opentelemetry.io/docs/demo/docker-deployment/) 使用 docker 部署此演示。除了 [现有组件](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)之外，将部署一个 ClickHouse 实例，用于日志和跟踪的存储。
