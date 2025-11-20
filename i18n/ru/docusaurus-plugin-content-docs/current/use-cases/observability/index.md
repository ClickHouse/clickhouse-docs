---
slug: /use-cases/observability
title: 'Наблюдаемость'
pagination_prev: null
pagination_next: null
description: 'Целевая страница руководства по сценарию использования для наблюдаемости'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse обеспечивает непревзойденную скорость, масштаб и экономичность для задач наблюдаемости. В этом руководстве предложены два подхода в зависимости от ваших потребностей:



## ClickStack — стек наблюдаемости ClickHouse {#clickstack}

Стек наблюдаемости ClickHouse — это наш **рекомендуемый подход** для большинства пользователей.

**ClickStack** — это платформа наблюдаемости промышленного уровня, построенная на ClickHouse и OpenTelemetry (OTel), объединяющая логи, трассировки, метрики и сессии в единое высокопроизводительное масштабируемое решение, которое работает от однонодовых развертываний до масштабов в **несколько петабайт**.

| Раздел                                                                  | Описание                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [Overview](/use-cases/observability/clickstack/overview)                | Введение в ClickStack и его ключевые возможности |
| [Getting Started](/use-cases/observability/clickstack/getting-started)  | Руководство по быстрому старту и базовой настройке |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | Примеры наборов данных и сценариев использования |
| [Architecture](/use-cases/observability/clickstack/architecture)        | Обзор архитектуры системы и компонентов         |
| [Deployment](/use-cases/observability/clickstack/deployment)            | Руководства и варианты развертывания            |
| [Configuration](/use-cases/observability/clickstack/config)             | Подробные параметры и настройки конфигурации    |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data)    | Рекомендации по загрузке данных в ClickStack    |
| [Search](/use-cases/observability/clickstack/search)                    | Как искать и запрашивать данные наблюдаемости   |
| [Production](/use-cases/observability/clickstack/production)            | Лучшие практики для промышленного развертывания |


## Создание собственного стека {#build-your-own-stack}

Для пользователей с **особыми требованиями** — такими как высокоспециализированные конвейеры приёма данных, проектирование схем или экстремальные потребности в масштабировании — мы предоставляем руководство по созданию собственного стека наблюдаемости с ClickHouse в качестве основной базы данных.

| Страница                                                              | Описание                                                                                                                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Introduction](/use-cases/observability/introduction)                 | Это руководство предназначено для пользователей, которые хотят создать собственное решение для наблюдаемости с использованием ClickHouse, с акцентом на логи и трассировки. |
| [Schema design](/use-cases/observability/schema-design)               | Узнайте, почему пользователям рекомендуется создавать собственную схему для логов и трассировок, а также ознакомьтесь с рекомендациями по её проектированию.                |
| [Managing data](/observability/managing-data)                         | Развёртывания ClickHouse для наблюдаемости неизбежно связаны с большими объёмами данных, которыми необходимо управлять. ClickHouse предлагает функции для управления данными. |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | Сбор и экспорт логов и трассировок с использованием OpenTelemetry и ClickHouse.                                                                                     |
| [Using Visualization Tools](/observability/grafana)                   | Узнайте, как использовать инструменты визуализации наблюдаемости для ClickHouse, включая HyperDX и Grafana.                                                         |
| [Demo Application](/observability/demo-application)                   | Изучите демонстрационное приложение OpenTelemetry, адаптированное для работы с ClickHouse для логов и трассировок.                                                  |
