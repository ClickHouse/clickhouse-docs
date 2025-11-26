---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Ингестия данных в ClickStack — стек наблюдаемости ClickHouse'
title: 'Руководства по интеграции'
doc_type: 'landing-page'
keywords: ['ингестия данных ClickStack', 'ингестия данных наблюдаемости', 'руководства по интеграции ClickStack']
---

ClickStack предоставляет несколько способов организовать ингестию данных наблюдаемости в экземпляр ClickHouse. В этом разделе приведены краткие руководства по различным источникам логов, трейсов и метрик.

:::note
Некоторые из этих руководств по интеграции используют встроенный в ClickStack OpenTelemetry Collector для быстрого тестирования. Для продакшен-сред мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для продакшен-конфигурации.
:::

| Раздел | Описание |
|------|-------------|
| [Метрики Kafka](/use-cases/observability/clickstack/integrations/kafka-metrics) | Краткое руководство по работе с метриками Kafka |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Краткое руководство по работе с Kubernetes |
| [Логи Nginx](/use-cases/observability/clickstack/integrations/nginx) | Краткое руководство по работе с логами Nginx |
| [Трейсы Nginx](/use-cases/observability/clickstack/integrations/nginx-traces) | Краткое руководство по работе с трейсами Nginx |
| [Логи PostgreSQL](/use-cases/observability/clickstack/integrations/postgresql-logs) | Краткое руководство по работе с логами PostgreSQL |
| [Метрики PostgreSQL](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Краткое руководство по работе с метриками PostgreSQL |
| [Логи Redis](/use-cases/observability/clickstack/integrations/redis) | Краткое руководство по работе с логами Redis |
| [Метрики Redis](/use-cases/observability/clickstack/integrations/redis-metrics) | Краткое руководство по работе с метриками Redis |