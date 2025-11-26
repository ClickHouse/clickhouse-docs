---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Ингестия данных для ClickStack — стек наблюдаемости ClickHouse'
title: 'Руководства по интеграции'
doc_type: 'landing-page'
keywords: ['ингестия данных ClickStack', 'ингестия данных наблюдаемости', 'руководства по интеграции ClickStack']
---

ClickStack предоставляет несколько способов организовать ингестию данных наблюдаемости в ваш экземпляр ClickHouse. В этом разделе приведены краткие руководства по быстрому запуску для различных источников логов, трейсов и метрик.

:::note
Часть этих руководств по интеграции использует встроенный в ClickStack OpenTelemetry Collector для быстрого тестирования. Для продуктивных сред мы рекомендуем запускать собственный OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) по настройке продуктивной среды.
:::

| Раздел | Описание |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Краткое руководство по метрикам Kafka |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Краткое руководство по интеграции с Kubernetes |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Краткое руководство по логам Nginx |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Краткое руководство по трейсам Nginx |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Краткое руководство по логам PostgreSQL |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Краткое руководство по метрикам PostgreSQL |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Краткое руководство по логам Redis |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Краткое руководство по метрикам Redis |