---
slug: /use-cases/observability/clickstack/example-datasets/instrument-app
title: 'Инструментируйте приложение с помощью Управляемого ClickStack'
sidebar_label: 'Демо HackerNews Analyzer'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'Руководство по инструментированию приложения на Node.js с помощью OpenTelemetry и отправке журналов, метрик и трейсов в Управляемый ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'инструментирование', 'opentelemetry', 'управляемый clickstack', 'обсервабилити']
---

import InstrumentApplication from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

В этом руководстве показано, как инструментировать простое приложение Node.js с помощью OpenTelemetry и отправлять его логи, метрики и трейсы в [Управляемый ClickStack](/use-cases/observability/clickstack/getting-started/managed). Инструментирование серверной части не требует изменений исходного кода приложения.

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) — это небольшое приложение на Node.js, которое выполняет запросы к набору данных HackerNews, размещённому в общедоступном демо-инстансе ClickHouse. Каждый график, таблица и поисковая строка работают на основе реального запроса к ClickHouse, поэтому каждое действие создаёт трейс, где основной спан — HTTPS-вызов от серверной части к ClickHouse.

## Предварительные требования \{#prerequisites\}

* Доступный OTel collector, к которому можно подключиться и который выполняет приём данных в ваш сервис Управляемый ClickStack. Вам потребуются его конечная точка OTLP и токен ингестии.
* Node 18+ и npm.

<InstrumentApplication />

## Подробнее \{#learn-more\}

* [воспроизведение сеанса](/use-cases/observability/clickstack/session-replay): обзор возможности, варианты SDK и средства контроля конфиденциальности.
* [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo): автономная демоверсия с локальным экземпляром ClickStack.
* [Начало работы с ClickStack](/use-cases/observability/clickstack/getting-started): разверните ClickStack и настройте приём первых данных.
* [Все примеры наборов данных](/use-cases/observability/clickstack/sample-datasets): другие примеры наборов данных и руководства.