---
slug: '/integrations/google-dataflow/dataflow'
sidebar_label: 'Интеграция Dataflow с ClickHouse'
sidebar_position: 1
description: 'пользователи могут принимать данные в ClickHouse с помощью Google'
title: 'Интеграция Google Dataflow с ClickHouse'
doc_type: guide
---
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Google Dataflow с ClickHouse

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) — это полностью управляемый сервис обработки потоковых и пакетных данных. Он поддерживает конвейеры, написанные на Java или Python, и построен на SDK Apache Beam.

Существует два основных способа использования Google Dataflow с ClickHouse, оба из которых используют [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam):

## 1. Java runner {#1-java-runner}
[Java Runner](./java-runner) позволяет пользователям реализовывать пользовательские конвейеры Dataflow, используя интеграцию `ClickHouseIO` от Apache Beam SDK. Этот подход предоставляет полную гибкость и контроль над логикой конвейера, позволяя пользователям адаптировать процесс ETL под конкретные требования. 
Однако этот вариант требует знаний программирования на Java и знакомства с фреймворком Apache Beam.

### Ключевые особенности {#key-features}
- Высокая степень настройки.
- Идеально подходит для сложных или продвинутых случаев использования.
- Требует кодирования и понимания API Beam.

## 2. Предопределенные шаблоны {#2-predefined-templates}
ClickHouse предлагает [предопределенные шаблоны](./templates), разработанные для конкретных случаев использования, таких как импорт данных из BigQuery в ClickHouse. Эти шаблоны готовы к использованию и упрощают процесс интеграции, что делает их отличным выбором для пользователей, предпочитающих безкодовое решение.

### Ключевые особенности {#key-features-1}
- Не требуется кодирование на Beam.
- Быстрая и простая настройка для простых случаев использования.
- Также подходит для пользователей с минимальными знаниями программирования.

Оба подхода полностью совместимы с Google Cloud и экосистемой ClickHouse, предлагая гибкость в зависимости от ваших технических знаний и требований проекта.