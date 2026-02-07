---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Ингестия данных для ClickStack — ClickHouse Observability Stack'
title: 'Руководства по интеграции'
doc_type: 'landing-page'
keywords: ['ингестия данных ClickStack', 'ингестия данных обсервабилити', 'руководства по интеграции ClickStack']
---

ClickStack предоставляет несколько способов организовать ингестию данных обсервабилити в ваш экземпляр ClickHouse. В этом разделе приведены краткие руководства по началу работы для различных источников логов, трейсов и метрик.

:::note
В нескольких из этих руководств по интеграции для быстрого тестирования и оценки используется встроенный OpenTelemetry Collector в ClickStack Open Source. 

Для продакшн-развертываний мы рекомендуем запускать интеграции в виде агентов OpenTelemetry Collector, размещённых как можно ближе к вашим рабочим нагрузкам. Эти агенты должны пересылать телеметрию по OTLP в ClickStack OpenTelemetry Collector, который затем доставляет данные либо в самоуправляемый экземпляр ClickHouse для дистрибутива ClickStack Open Source, либо в Managed ClickStack. См. раздел ["Отправка данных OpenTelemetry"](/use-cases/observability/clickstack/ingesting-data/opentelemetry) о продакшн-конфигурации.
:::

| Section | Description |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | Сбор системных логов хоста |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | Мониторинг логов экземпляров EC2 |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Пересылка логов Lambda с помощью Rotel |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | Пересылка групп логов CloudWatch |
| [JVM Metrics](/use-cases/observability/clickstack/integrations/jvm-metrics) | Мониторинг производительности JVM |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Мониторинг производительности Kafka |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Мониторинг кластеров K8s |
| [MySQL Logs](/use-cases/observability/clickstack/integrations/mysql-logs) | Сбор логов медленных запросов и ошибок MySQL |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Сбор access-/error-логов Nginx |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Трассировка HTTP-запросов Nginx |
| [Node.js Traces](/use-cases/observability/clickstack/integrations/nodejs-traces) | Трассировка HTTP-запросов Node.js |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Сбор логов Postgres |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Мониторинг производительности Postgres |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Сбор логов сервера Redis |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Мониторинг производительности Redis |
| [Systemd Logs](/use-cases/observability/clickstack/integrations/systemd-logs) | Сбор логов Systemd/Journald |
| [Temporal Metrics](/use-cases/observability/clickstack/integrations/temporal-metrics)| Мониторинг метрик Temporal Cloud |