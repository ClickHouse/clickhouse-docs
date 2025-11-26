---
slug: /use-cases/observability
title: 'Наблюдаемость'
pagination_prev: null
pagination_next: null
description: 'Целевая страница руководства по сценарию использования наблюдаемости'
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse обеспечивает непревзойденные показатели скорости, масштабируемости и экономичности для задач наблюдаемости. В этом руководстве предлагаются два варианта в зависимости от ваших потребностей:



## ClickStack - стек наблюдаемости ClickHouse {#clickstack}

ClickHouse Observability Stack — наш **рекомендуемый подход** для большинства пользователей.

**ClickStack** — это платформа наблюдаемости промышленного уровня на базе ClickHouse и OpenTelemetry (OTel), объединяющая логи, трейсы, метрики и пользовательские сессии в одном высокопроизводительном и масштабируемом решении, которое подходит как для одноузловых развертываний, так и для **многопетабайтного** масштаба.

| Раздел | Описание |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | Введение в ClickStack и его ключевые возможности |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | Краткое руководство по началу работы и базовой настройке |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | Примеры наборов данных и сценариев их использования |
| [Architecture](/use-cases/observability/clickstack/architecture) | Обзор архитектуры системы и её компонентов |
| [Deployment](/use-cases/observability/clickstack/deployment) | Руководства и варианты развертывания |
| [Configuration](/use-cases/observability/clickstack/config) | Подробные параметры конфигурации и варианты настроек |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | Рекомендации по приёму данных в ClickStack |
| [Search](/use-cases/observability/clickstack/search) | Как выполнять поиск и строить запросы по данным наблюдаемости |
| [Production](/use-cases/observability/clickstack/production) | Рекомендации и лучшие практики промышленного развертывания |



## Собственная сборка стека {#build-your-own-stack}

Для пользователей с **особыми требованиями** — такими как высокоспециализированные конвейеры ингестии, схемы данных или жёсткие требования к масштабируемости — мы предоставляем рекомендации по созданию пользовательского стека наблюдаемости с ClickHouse в качестве основной базы данных.

| Страница                                                    | Описание                                                                                                                                                                      |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | Это руководство предназначено для пользователей, которые хотят построить собственное решение для наблюдаемости на базе ClickHouse с фокусом на логах и трейcах.              |
| [Schema design](/use-cases/observability/schema-design)          | Узнайте, почему пользователям рекомендуется создавать собственную схему для логов и трейcов, а также ознакомьтесь с лучшими практиками по её проектированию.                 |
| [Managing data](/observability/managing-data)          | Развертывания ClickHouse для наблюдаемости неизбежно включают большие объёмы данных, которыми необходимо управлять. ClickHouse предоставляет возможности для управления данными. |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | Сбор и экспорт логов и трейcов с использованием OpenTelemetry и ClickHouse.                                                            |
| [Using Visualization Tools](/observability/grafana)    | Узнайте, как использовать инструменты визуализации для наблюдаемости в ClickHouse, включая HyperDX и Grafana.                          |
| [Demo Application](/observability/demo-application)    | Ознакомьтесь с OpenTelemetry Demo Application — форком, адаптированным для работы с ClickHouse для логов и трейcов.                     |
