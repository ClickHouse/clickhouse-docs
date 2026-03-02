---
slug: /use-cases/observability/clickstack
title: 'ClickStack — стек наблюдаемости ClickHouse'
pagination_prev: null
pagination_next: null
description: 'Целевая страница для стека наблюдаемости ClickHouse'
keywords: ['ClickStack', 'observability stack', 'HyperDX', 'OpenTelemetry', 'logs', 'traces', 'metrics']
doc_type: 'landing-page'
---

**ClickStack** — открытая платформа обсервабилити продакшн-класса, построенная на ClickHouse и OpenTelemetry (OTel), которая объединяет журналы, трассировки, метрики и сессии в одном высокопроизводительном решении. Она позволяет разработчикам и SRE выполнять сквозной мониторинг и отладку сложных систем без переключения между инструментами и ручного связывания данных.

ClickStack можно развернуть двумя способами. В варианте **ClickStack Open Source** вы самостоятельно запускаете и управляете всеми компонентами, включая ClickHouse, ClickStack UI (HyperDX) и OpenTelemetry Collector. В варианте **Managed ClickStack** ClickHouse и ClickStack UI (HyperDX) полностью управляются в ClickHouse Cloud, включая аутентификацию и операционные аспекты, а вам остаётся запускать только OpenTelemetry Collector, который получает телеметрию от ваших ворклоадов и по OTLP пересылает её в ClickHouse Cloud.

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | Введение в ClickStack и его ключевые возможности |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | Руководство по быстрому старту и базовой настройке |
| [Sample Datasets](/use-cases/observability/clickstack/sample-datasets) | Примеры наборов данных и сценарии использования |
| [Architecture](/use-cases/observability/clickstack/architecture) | Обзор архитектуры системы и её компонентов |
| [Deployment](/use-cases/observability/clickstack/deployment) | Руководства и варианты развертывания |
| [Configuration](/use-cases/observability/clickstack/config) | Подробные параметры конфигурации и настройки |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | Рекомендации по приёму данных в ClickStack |
| [Search](/use-cases/observability/clickstack/search) | Как выполнять поиск и запросы по данным наблюдаемости |
| [Production](/use-cases/observability/clickstack/production) | Рекомендации и лучшие практики продакшн-развертывания |