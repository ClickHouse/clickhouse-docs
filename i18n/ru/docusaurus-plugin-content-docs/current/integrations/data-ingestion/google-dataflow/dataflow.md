---
sidebar_label: 'Интеграция Dataflow с ClickHouse'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'Пользователи могут загружать данные в ClickHouse с помощью сервиса Google Dataflow'
title: 'Интеграция Google Dataflow с ClickHouse'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'Dataflow ClickHouse integration', 'Apache Beam ClickHouse', 'ClickHouseIO connector', 'Google Cloud ClickHouse integration']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Google Dataflow с ClickHouse

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) — это полностью управляемый сервис потоковой и пакетной обработки данных. Он поддерживает конвейеры, написанные на Java или Python, и построен на основе Apache Beam SDK.

Существует два основных способа использовать Google Dataflow совместно с ClickHouse; оба используют [`коннектор ClickHouseIO для Apache Beam`](/integrations/apache-beam).
Они следующие:
- [Java runner](#1-java-runner)
- [Готовые шаблоны](#2-predefined-templates)



## Java runner {#1-java-runner}

[Java runner](./java-runner) позволяет пользователям реализовывать пользовательские конвейеры Dataflow с использованием интеграции `ClickHouseIO` из Apache Beam SDK. Этот подход обеспечивает полную гибкость и контроль над логикой конвейера, позволяя адаптировать процесс ETL под конкретные требования.
Однако этот вариант требует знания программирования на Java и владения фреймворком Apache Beam.

### Ключевые особенности {#key-features}

- Высокая степень кастомизации.
- Идеально подходит для сложных или нестандартных сценариев использования.
- Требует написания кода и понимания Beam API.


## Предопределённые шаблоны {#2-predefined-templates}

ClickHouse предлагает [предопределённые шаблоны](./templates), разработанные для конкретных сценариев использования, например для импорта данных из BigQuery в ClickHouse. Эти шаблоны готовы к использованию и упрощают процесс интеграции, что делает их отличным выбором для пользователей, предпочитающих решение без написания кода.

### Ключевые особенности {#key-features-1}

- Не требуется написание кода на Beam.
- Быстрая и простая настройка для простых сценариев использования.
- Подходит также для пользователей с минимальным опытом программирования.

Оба подхода полностью совместимы с Google Cloud и экосистемой ClickHouse, обеспечивая гибкость в зависимости от вашего технического опыта и требований проекта.
