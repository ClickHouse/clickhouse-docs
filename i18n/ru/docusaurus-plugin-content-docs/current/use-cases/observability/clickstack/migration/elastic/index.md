---
slug: /use-cases/observability/clickstack/migration/elastic
title: 'Миграция на ClickStack с Elastic'
pagination_prev: null
pagination_next: null
description: 'Лендинг по миграции на ClickHouse Observability Stack с Elastic'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

В этом руководстве представлен комплексный подход к миграции с Elastic Stack на ClickStack. Мы сосредотачиваемся на стратегии параллельной эксплуатации, которая минимизирует риски и позволяет задействовать сильные стороны ClickHouse при обработке observability-нагрузок. 

| Раздел | Описание |
|---------|-------------|
| [Введение](/use-cases/observability/clickstack/migration/elastic/intro) | Обзор процесса миграции и ключевых аспектов |
| [Концепции](/use-cases/observability/clickstack/migration/elastic/concepts) | Понимание соответствующих понятий в Elastic и ClickStack |
| [Типы](/use-cases/observability/clickstack/migration/elastic/types) | Сопоставление типов Elasticsearch с эквивалентами в ClickHouse |
| [Поиск](/use-cases/observability/clickstack/migration/elastic/search) | Сравнение возможностей поиска и синтаксиса запросов |
| [Миграция данных](/use-cases/observability/clickstack/migration/elastic/migrating-data) | Стратегии миграции данных и организации параллельной эксплуатации |
| [Миграция агентов](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | Переход от агентов Elastic к OpenTelemetry |
| [Миграция SDK](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | Замена APM-агентов Elastic на SDK OpenTelemetry |