---
slug: /use-cases/observability/clickstack/instrument-application
title: 'Инструментирование приложения'
description: 'Настройте инструментацию приложения Node.js с помощью OpenTelemetry и отправляйте его журналы, метрики и трейсы в Управляемый ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'инструментирование', 'opentelemetry', 'управляемый', 'обсервабилити', 'sdk', 'nodejs']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import InstrumentApplication from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

Это руководство показывает, как инструментировать небольшое приложение Node.js с помощью OpenTelemetry и отправлять его журналы, метрики и трейсы в Управляемый ClickStack. Бэкенд инструментируется без каких-либо изменений в исходном коде приложения.

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) — это приложение Node.js, которое выполняет запросы к набору данных HackerNews, размещённому в публичном демо ClickHouse. В основе каждого графика, таблицы и поля поиска лежит реальный запрос к ClickHouse, поэтому каждое взаимодействие создаёт трейс, основной span которого — HTTPS-вызов из бэкенда в ClickHouse.

В этом руководстве предполагается, что вы уже выполнили шаги из [Настройка OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) и что у вас запущен коллектор ClickStack, доступный с машины, на которой вы запускаете это приложение. **Убедитесь, что вы сохранили его конечную точку OTLP** и `OTLP_AUTH_TOKEN`, который задали при развёртывании.

## Предварительные требования \{#prerequisites\}

* Коллектор ClickStack, доступный с этой машины. Если вы ещё не развернули его, сначала выполните инструкции из раздела [Настройка OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector).
* Конечная точка OTLP этого коллектора и заданный для него `OTLP_AUTH_TOKEN`.
* Node 18+ и npm.

<InstrumentApplication />

## Дополнительные материалы \{#further-reading\}

* [Мониторинг Kubernetes](/use-cases/observability/clickstack/monitoring-kubernetes): собирайте журналы, инфраструктурные метрики и события Kubernetes из кластера.
* [Мониторинг журналов AWS CloudWatch](/use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs): пересылайте журналы CloudWatch через приёмник CloudWatch в OpenTelemetry.
* [Воспроизведение сеанса](/use-cases/observability/clickstack/session-replay): обзор функции, параметры SDK и настройки конфиденциальности.
* [Выход в продакшен](/use-cases/observability/clickstack/production) с рекомендациями для выхода в продакшен.