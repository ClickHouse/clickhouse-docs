---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'Загрузка данных в ClickStack — стек наблюдаемости ClickHouse'
title: 'Загрузка данных'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion
', 'ClickStack OpenTelemetry', 'ClickHouse observability ingestion', 'telemetry data collection']
---

ClickStack предоставляет несколько способов загрузки данных наблюдаемости в ваш экземпляр ClickHouse. Независимо от того, собираете ли вы логи, метрики, трейсы или данные сессий, вы можете использовать коллектор OpenTelemetry (OTel) как единый входной пункт или задействовать интеграции с конкретными платформами для специализированных сценариев.

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | Введение в методы и архитектуру загрузки данных |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | Для пользователей OpenTelemetry, которые хотят быстро интегрироваться с ClickStack |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | Подробная информация о коллекторе OpenTelemetry для ClickStack |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | Обзор таблиц ClickHouse и их схем, используемых ClickStack |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | SDK ClickStack для инструментации языков программирования и сбора телеметрических данных |