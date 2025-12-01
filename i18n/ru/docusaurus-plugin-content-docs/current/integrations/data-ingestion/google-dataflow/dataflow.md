---
sidebar_label: 'Интеграция Dataflow с ClickHouse'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'Пользователи могут осуществлять приём данных в ClickHouse с помощью Google Dataflow'
title: 'Интеграция Google Dataflow с ClickHouse'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'Dataflow ClickHouse integration', 'Apache Beam ClickHouse', 'ClickHouseIO connector', 'Google Cloud ClickHouse integration']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Google Dataflow с ClickHouse {#integrating-google-dataflow-with-clickhouse}

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) — это полностью управляемый сервис обработки потоковых и пакетных данных. Он поддерживает конвейеры, написанные на Java или Python, и основан на Apache Beam SDK.

Существует два основных способа использования Google Dataflow с ClickHouse; оба используют [`коннектор ClickHouseIO для Apache Beam`](/integrations/apache-beam).
Это:
- [Java runner](#1-java-runner)
- [Готовые шаблоны](#2-predefined-templates)



## Java runner {#1-java-runner}
[Java runner](./java-runner) позволяет реализовывать пользовательские конвейеры Dataflow с использованием интеграции Apache Beam SDK `ClickHouseIO`. Такой подход обеспечивает полную гибкость и контроль над логикой конвейера, позволяя адаптировать ETL‑процесс под конкретные требования.
Однако этот вариант требует знаний программирования на Java и знакомства с фреймворком Apache Beam.

### Ключевые особенности {#key-features}
- Высокая степень гибкости настройки.
- Оптимален для сложных или нетривиальных сценариев использования.
- Требует написания кода и понимания API Beam.



## Предопределённые шаблоны {#2-predefined-templates}
ClickHouse предлагает [предопределённые шаблоны](./templates), разработанные для конкретных сценариев использования, например импорта данных из BigQuery в ClickHouse. Эти шаблоны готовы к использованию и упрощают процесс интеграции, что делает их отличным выбором для пользователей, предпочитающих решение без написания кода.

### Ключевые особенности {#key-features-1}
- Не требуется писать код на Beam.
- Быстрая и простая настройка для простых сценариев использования.
- Также подходят пользователям с минимальным опытом программирования.

Оба подхода полностью совместимы с Google Cloud и экосистемой ClickHouse, обеспечивая гибкость в зависимости от вашего уровня технической подготовки и требований проекта.
