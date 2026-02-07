---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据摄取 - ClickHouse 可观测性栈'
title: '集成指南'
doc_type: 'landing-page'
keywords: ['ClickStack 数据摄取', '可观测性数据摄取', 'ClickStack 集成指南']
---

ClickStack 提供多种方式将可观测性数据摄取到 ClickHouse 实例中。本节包含针对各种日志、链路追踪和指标来源的快速入门指南。

:::note
其中若干集成指南使用 ClickStack Open Source 自带的 OpenTelemetry Collector，用于快速测试和评估。 

在生产环境部署中，我们建议将集成以 OpenTelemetry Collector 代理的形式运行在靠近工作负载的位置。这些代理应通过 OTLP 将遥测数据转发到 ClickStack OpenTelemetry Collector，再由其将数据发送到用于 ClickStack Open Source 发行版的自管理 ClickHouse 实例，或托管版 Managed ClickStack。生产环境配置请参阅 ["发送 OpenTelemetry 数据"](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
:::

| Section | Description |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | 收集主机系统日志 |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | 监控 EC2 实例日志 |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | 使用 Rotel 转发 Lambda 日志 |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | 转发 CloudWatch 日志组 |
| [JVM Metrics](/use-cases/observability/clickstack/integrations/jvm-metrics) | 监控 JVM 性能 |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | 监控 Kafka 性能 |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | 监控 K8s 集群 |
| [MySQL Logs](/use-cases/observability/clickstack/integrations/mysql-logs) | 收集 MySQL 慢查询/错误日志 |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | 收集 Nginx 访问/错误日志 |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | 对 Nginx HTTP 请求进行链路追踪 |
| [Node.js Traces](/use-cases/observability/clickstack/integrations/nodejs-traces) | 对 Node.js HTTP 请求进行链路追踪 |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | 收集 Postgres 日志 |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | 监控 Postgres 性能 |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | 收集 Redis 服务器日志 |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | 监控 Redis 性能 |
| [Systemd Logs](/use-cases/observability/clickstack/integrations/systemd-logs) | 收集 Systemd/Journald 日志 |
| [Temporal Metrics](/use-cases/observability/clickstack/integrations/temporal-metrics)| 监控 Temporal Cloud 指标 |