---
sidebar_label: 'Интеграция Dataflow с ClickHouse'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'Пользователи могут загружать данные в ClickHouse, используя Google Dataflow'
title: 'Интеграция Google Dataflow с ClickHouse'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Google Dataflow с ClickHouse

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) — это полностью управляемый сервис обработки потоковых и пакетных данных. Он поддерживает конвейеры, написанные на Java или Python, и построен на основе Apache Beam SDK.

Существует два основных способа использования Google Dataflow с ClickHouse, оба из которых используют [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam):

## 1. Java Runner {#1-java-runner}
[Java Runner](./java-runner) позволяет пользователям реализовывать собственные конвейеры Dataflow, используя интеграцию `ClickHouseIO` из Apache Beam SDK. Этот подход обеспечивает полную гибкость и контроль над логикой конвейера, позволяя пользователям адаптировать процесс ETL к конкретным требованиям. Однако этот вариант требует знаний программирования на Java и знакомства с фреймворком Apache Beam.

### Ключевые особенности {#key-features}
- Высокая степень настройки.
- Идеально подходит для сложных или продвинутых случаев использования.
- Требует написания кода и понимания API Beam.

## 2. Предопределенные шаблоны {#2-predefined-templates}
ClickHouse предлагает [предопределенные шаблоны](./templates), разработанные для конкретных случаев использования, таких как импорт данных из BigQuery в ClickHouse. Эти шаблоны готовы к использованию и упрощают процесс интеграции, что делает их отличным выбором для пользователей, предпочитающих безкодовые решения.

### Ключевые особенности {#key-features-1}
- Написание кода Beam не требуется.
- Быстрая и простая настройка для простых случаев использования.
- Подходят также для пользователей с минимальным опытом программирования.

Оба подхода полностью совместимы с Google Cloud и экосистемой ClickHouse, предлагая гибкость в зависимости от вашего технического опыта и требований проекта.
