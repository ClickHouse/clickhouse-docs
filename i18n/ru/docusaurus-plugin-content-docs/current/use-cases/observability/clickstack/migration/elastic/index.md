---
slug: /use-cases/observability/clickstack/migration/elastic
title: 'Миграция на ClickStack с Elastic'
pagination_prev: null
pagination_next: null
description: 'Целевая страница о миграции на ClickHouse Observability Stack с Elastic'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

В этом руководстве представлен комплексный подход к миграции с Elastic Stack на ClickStack. Мы сосредотачиваемся на стратегии параллельной эксплуатации, которая минимизирует риски и при этом позволяет задействовать сильные стороны ClickHouse для задач наблюдаемости. 

| Section | Description |
|---------|-------------|
| [Introduction](/use-cases/observability/clickstack/migration/elastic/intro) | Обзор процесса миграции и ключевых аспектов |
| [Concepts](/use-cases/observability/clickstack/migration/elastic/concepts) | Эквивалентные концепции в Elastic и ClickStack |
| [Types](/use-cases/observability/clickstack/migration/elastic/types) | Сопоставление типов Elasticsearch с эквивалентами в ClickHouse |
| [Search](/use-cases/observability/clickstack/migration/elastic/search) | Сравнение возможностей поиска и синтаксиса запросов |
| [Migrating Data](/use-cases/observability/clickstack/migration/elastic/migrating-data) | Стратегии миграции данных и параллельной эксплуатации |
| [Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | Переход от агентов Elastic к OpenTelemetry |
| [Migrating SDKs](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | Замена агентов Elastic APM на OpenTelemetry SDK |