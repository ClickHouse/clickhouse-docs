---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Загрузка данных для ClickStack — стек наблюдаемости ClickHouse'
title: 'Руководства по интеграции'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion', 'ClickStack integration guides']
---

ClickStack предоставляет несколько способов загрузки данных наблюдаемости в ваш экземпляр ClickHouse. В этом разделе представлены краткие руководства по запуску для различных источников логов, трейсов и метрик.

:::note
Некоторые из этих руководств по интеграции используют встроенный в ClickStack OpenTelemetry Collector для быстрого тестирования. Для продуктивных сред мы рекомендуем запускать собственный OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации продакшена.
:::

| Section | Description |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Краткое руководство по запуску для Kafka Metrics |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Краткое руководство по запуску для Kubernetes |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Краткое руководство по запуску для Nginx Logs |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Краткое руководство по запуску для Nginx Traces |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Краткое руководство по запуску для PostgreSQL Logs |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Краткое руководство по запуску для PostgreSQL Metrics |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Краткое руководство по запуску для Redis Logs |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Краткое руководство по запуску для Redis Metrics |