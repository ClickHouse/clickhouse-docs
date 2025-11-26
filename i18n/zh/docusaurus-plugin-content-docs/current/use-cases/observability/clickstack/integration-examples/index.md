---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据摄取 - ClickHouse 可观测性栈'
title: '集成指南'
doc_type: 'landing-page'
keywords: ['ClickStack 数据摄取', '可观测性数据摄取', 'ClickStack 集成指南']
---

ClickStack 提供多种方式，将可观测性数据摄取到 ClickHouse 实例中。本节包含针对各类日志、追踪和指标来源的快速入门指南。

:::note
其中部分集成指南使用了 ClickStack 内置的 OpenTelemetry Collector 进行快速测试。对于生产环境部署，推荐运行自托管的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。生产环境配置请参阅[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
:::

| Section | Description |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka 指标快速入门指南 |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Kubernetes 快速入门指南 |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx 日志快速入门指南 |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx 追踪快速入门指南 |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL 日志快速入门指南 |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL 指标快速入门指南 |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis 日志快速入门指南 |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis 指标快速入门指南 |