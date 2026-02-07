---
slug: /use-cases/observability/clickstack/deployment/oss
title: 'Варианты развертывания с открытым исходным кодом'
pagination_prev: null
pagination_next: null
description: 'Развертывание ClickStack с открытым исходным кодом — стек обсервабилити на базе ClickHouse'
doc_type: 'reference'
keywords: ['ClickStack', 'observability', 'Open Source']
---

Open Source ClickStack предоставляет несколько вариантов развертывания для разных сценариев использования.

Каждый из вариантов развертывания кратко описан ниже. [Руководство по началу работы с Open Source](/use-cases/observability/clickstack/getting-started/oss) подробно рассматривает первый вариант, который включён здесь для полноты.

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | Один Docker-контейнер со всеми компонентами ClickStack в одном пакете.                                              | Непроизводственные развертывания, демо, прототипы (proof of concept)                                 | Не рекомендуется для продакшена                                                                             | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | Официальный Helm-чарт для развертываний в Kubernetes. Поддерживает ClickHouse Cloud и масштабирование в продакшене. | Продакшен-развертывания в Kubernetes                                                                  | Требуются знания Kubernetes, настройка через Helm                                                           | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | Развертывание каждого компонента ClickStack отдельно с помощью Docker Compose.                                      | Локальное тестирование, прототипы (proof of concept), продакшен на одном сервере, собственный (BYO) ClickHouse | Нет отказоустойчивости, требуется управление несколькими контейнерами                                       | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | Использование HyperDX отдельно с вашим собственным ClickHouse и схемой.                                             | Существующие пользователи ClickHouse, кастомные конвейеры событий                                     | ClickHouse не включён, пользователь должен сам управлять ингестией и схемой                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | Полностью работает в браузере с локальным хранилищем. Без бэкенда и постоянного хранилища (persistence).            | Демо, отладка, разработка с HyperDX                                                                   | Нет аутентификации, нет постоянного хранилища, нет оповещений (alerting), только один пользователь         | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |