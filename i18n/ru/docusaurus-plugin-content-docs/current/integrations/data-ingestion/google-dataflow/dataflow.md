---
sidebar_label: 'Интеграция Dataflow с ClickHouse'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'Пользователи могут загружать данные в ClickHouse с помощью Google Dataflow'
title: 'Интеграция Google Dataflow с ClickHouse'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'интеграция Dataflow с ClickHouse', 'Apache Beam ClickHouse', 'коннектор ClickHouseIO', 'интеграция ClickHouse с Google Cloud']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Google Dataflow с ClickHouse

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) — это полностью управляемый сервис для потоковой и пакетной обработки данных. Он поддерживает конвейеры, написанные на Java или Python, и основан на Apache Beam SDK.

Существует два основных способа использовать Google Dataflow с ClickHouse, и оба они используют [`коннектор ClickHouseIO для Apache Beam`](/integrations/apache-beam).
Это:
- [Java runner](#1-java-runner)
- [Готовые шаблоны](#2-predefined-templates)



## Java runner {#1-java-runner}

[Java runner](./java-runner) позволяет реализовывать пользовательские конвейеры Dataflow с использованием интеграции `ClickHouseIO` из Apache Beam SDK. Этот подход обеспечивает полную гибкость и контроль над логикой конвейера, позволяя настраивать процесс ETL под конкретные требования.
Однако для использования этого варианта необходимо знание программирования на Java и понимание фреймворка Apache Beam.

### Ключевые особенности {#key-features}

- Высокая степень кастомизации.
- Идеально подходит для сложных или нестандартных сценариев использования.
- Требует написания кода и понимания Beam API.


## Предопределённые шаблоны {#2-predefined-templates}

ClickHouse предлагает [предопределённые шаблоны](./templates), разработанные для конкретных сценариев использования, например для импорта данных из BigQuery в ClickHouse. Эти шаблоны готовы к использованию и упрощают процесс интеграции, что делает их отличным выбором для пользователей, которые предпочитают решения без написания кода.

### Ключевые особенности {#key-features-1}

- Не требуется написание кода на Beam.
- Быстрая и простая настройка для простых сценариев использования.
- Подходит также для пользователей с минимальным опытом программирования.

Оба подхода полностью совместимы с Google Cloud и экосистемой ClickHouse, обеспечивая гибкость в зависимости от вашего технического опыта и требований проекта.
