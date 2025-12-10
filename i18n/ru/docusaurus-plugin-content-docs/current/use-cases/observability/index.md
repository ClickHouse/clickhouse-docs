---
slug: /use-cases/observability
title: 'Наблюдаемость'
pagination_prev: null
pagination_next: null
description: 'Стартовая страница руководства по сценарию использования «Наблюдаемость»'
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse обеспечивает непревзойдённые скорость, масштаб и экономичность для задач наблюдаемости. В этом руководстве описаны два подхода в зависимости от ваших потребностей:

## ClickStack — стек наблюдаемости ClickHouse {#clickstack}

Стек наблюдаемости ClickHouse — наш **рекомендуемый подход** для большинства пользователей.

**ClickStack** — это продакшен-готовая платформа наблюдаемости, построенная на ClickHouse и OpenTelemetry (OTel), объединяющая логи, трейсы, метрики и сессии в одном высокопроизводительном масштабируемом решении, работающем от одноузловых развертываний до **многопетабайтного** масштаба.

| Раздел | Описание |
|--------|----------|
| [Overview](/use-cases/observability/clickstack/overview) | Введение в ClickStack и его ключевые возможности |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | Краткое руководство и базовые инструкции по настройке |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | Образцы наборов данных и варианты использования |
| [Architecture](/use-cases/observability/clickstack/architecture) | Обзор архитектуры системы и компонентов |
| [Deployment](/use-cases/observability/clickstack/deployment) | Руководства и варианты развертывания |
| [Configuration](/use-cases/observability/clickstack/config) | Подробное описание параметров конфигурации и настроек |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | Рекомендации по приёму данных в ClickStack |
| [Search](/use-cases/observability/clickstack/search) | Как выполнять поиск и запросы по данным наблюдаемости |
| [Production](/use-cases/observability/clickstack/production) | Рекомендации по развертыванию в промышленной эксплуатации |

## Соберите собственный стек {#build-your-own-stack}

Для пользователей с **нестандартными требованиями** — такими как высокоспециализированные конвейеры ингестии, собственные схемы или экстремальные требования к масштабируемости — мы предоставляем рекомендации по построению пользовательского стека наблюдаемости с ClickHouse в качестве основной базы данных.

| Страница                                                    | Описание                                                                                                                                                                      |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | Это руководство предназначено для пользователей, которые хотят построить собственное решение наблюдаемости на базе ClickHouse, с акцентом на логи и трейсы.                 |
| [Schema design](/use-cases/observability/schema-design)          | Узнайте, почему пользователям рекомендуется разрабатывать собственную схему для логов и трейсов, а также ознакомьтесь с некоторыми передовыми практиками.                    |
| [Managing data](/observability/managing-data)          | Развертывания ClickHouse для задач наблюдаемости неизбежно работают с большими наборами данных, которыми необходимо эффективно управлять. ClickHouse предлагает функции, помогающие в управлении данными. |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | Сбор и экспорт логов и трейсов с использованием OpenTelemetry и ClickHouse.                                                             |
| [Using Visualization Tools](/observability/grafana)    | Узнайте, как использовать инструменты визуализации наблюдаемости для ClickHouse, включая HyperDX и Grafana.                            |
| [Demo Application](/observability/demo-application)    | Изучите OpenTelemetry Demo Application — форк, адаптированный для работы с ClickHouse для логов и трейсов.                             |