---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Загрузка данных для ClickStack — стека наблюдаемости ClickHouse'
title: 'Руководства по интеграции'
doc_type: 'landing-page'
keywords: ['загрузка данных ClickStack', 'загрузка данных наблюдаемости', 'руководства по интеграции ClickStack']
---

ClickStack предоставляет несколько способов загрузки данных наблюдаемости в ваш экземпляр ClickHouse. В этом разделе приведены краткие руководства по началу работы для различных источников логов, трассировок и метрик.

:::note
Часть этих руководств по интеграции используют встроенный в ClickStack OpenTelemetry Collector для быстрого тестирования. Для продакшн-развертываний мы рекомендуем запускать собственный OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации продакшн-среды.
:::

| Раздел | Описание |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Краткое руководство по началу работы с метриками Kafka |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Краткое руководство по началу работы с Kubernetes |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Краткое руководство по началу работы с логами Nginx |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Краткое руководство по началу работы с трассировками Nginx |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Краткое руководство по началу работы с логами PostgreSQL |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Краткое руководство по началу работы с метриками PostgreSQL |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Краткое руководство по началу работы с логами Redis |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Краткое руководство по началу работы с метриками Redis |