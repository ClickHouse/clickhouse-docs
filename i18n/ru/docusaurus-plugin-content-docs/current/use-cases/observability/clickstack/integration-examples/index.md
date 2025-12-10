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
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | Краткое руководство по логам Generic Host |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | Краткое руководство по логам EC2 Host |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Краткое руководство по Kafka Metrics |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Краткое руководство по Kubernetes |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Краткое руководство по логам Nginx |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Краткое руководство по трейсингу Nginx |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Краткое руководство по логам PostgreSQL |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Краткое руководство по метрикам PostgreSQL |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Краткое руководство по логам Redis |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Краткое руководство по метрикам Redis |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Краткое руководство по логам AWS Lambda с использованием Rotel |