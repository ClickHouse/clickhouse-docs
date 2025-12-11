---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Ингестия данных для ClickStack — ClickHouse Observability Stack'
title: 'Руководства по интеграции'
doc_type: 'landing-page'
keywords: ['ингестия данных ClickStack', 'ингестия данных обсервабилити', 'руководства по интеграции ClickStack']
---

ClickStack предоставляет несколько способов приёма данных обсервабилити в ваш экземпляр ClickHouse. В этом разделе приведены краткие руководства по быстрому запуску для различных источников логов, трейсинга и метрик.

:::note
Часть этих руководств по интеграции используют встроенный в ClickStack OpenTelemetry Collector для быстрого тестирования. Для продуктивных развертываний мы рекомендуем запускать собственный OTel Collector и отправлять данные в OTLP‑эндпоинт ClickStack. См. раздел [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации в продакшене.
:::

| Раздел | Описание |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | Сбор системных логов хоста |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | Мониторинг логов инстансов EC2 |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Проброс логов Lambda с помощью Rotel |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | Проброс групп логов CloudWatch |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Мониторинг производительности Kafka |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Мониторинг кластеров K8s |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Сбор логов доступа и ошибок Nginx |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Трейсинг HTTP‑запросов Nginx |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Сбор логов Postgres |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Мониторинг производительности Postgres |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Сбор логов сервера Redis |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Мониторинг производительности Redis |