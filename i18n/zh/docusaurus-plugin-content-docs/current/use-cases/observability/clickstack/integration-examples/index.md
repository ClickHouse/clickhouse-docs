---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据摄取 - ClickHouse 可观测性栈'
title: '集成指南'
doc_type: 'landing-page'
keywords: ['ClickStack 数据摄取', '可观测性数据摄取', 'ClickStack 集成指南']
---

ClickStack 提供多种方式，将可观测性数据摄取到 ClickHouse 实例中。本节包含针对各种日志、链路追踪和指标数据源的快速入门指南。

:::note
其中有多篇集成指南使用 ClickStack 内置的 OpenTelemetry Collector 进行快速测试。对于生产环境，我们建议运行您自己的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。生产环境配置请参阅 [发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
:::

| 部分 | 描述 |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | 收集主机系统日志 |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | 监控 EC2 实例日志 |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | 使用 Rotel 转发 Lambda 日志 |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | 转发 CloudWatch 日志组 |
| [JVM Metrics](/use-cases/observability/clickstack/integrations/jvm-metrics) | 监控 JVM 性能 |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | 监控 Kafka 性能 |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | 监控 K8s 集群 |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | 收集 Nginx 访问/错误日志 |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | 追踪 Nginx HTTP 请求 |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | 收集 Postgres 日志 |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | 监控 Postgres 性能 |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | 收集 Redis 服务器日志 |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | 监控 Redis 性能 |
| [Temporal Metrics](/use-cases/observability/clickstack/integrations/temporal-metrics)| 监控 Temporal Cloud 指标 |