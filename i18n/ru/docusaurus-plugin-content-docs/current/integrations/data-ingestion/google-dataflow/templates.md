---
sidebar_label: 'Шаблоны'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'Пользователи могут осуществлять приём данных в ClickHouse с помощью шаблонов Google Dataflow'
title: 'Шаблоны Google Dataflow'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'конвейер данных', 'шаблоны', 'пакетная обработка']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Шаблоны Google Dataflow {#google-dataflow-templates}

<ClickHouseSupportedBadge/>

Шаблоны Google Dataflow предоставляют удобный способ запускать готовые к использованию конвейеры обработки данных без необходимости писать собственный код. Эти шаблоны предназначены для упрощения распространённых задач обработки данных и построены на основе [Apache Beam](https://beam.apache.org/), используя коннекторы, такие как `ClickHouseIO`, для бесшовной интеграции с базами данных ClickHouse. Запуская эти шаблоны на Google Dataflow, вы можете обеспечить высокомасштабируемую распределённую обработку данных при минимальных затратах усилий.

## Зачем использовать шаблоны Dataflow? {#why-use-dataflow-templates}

- **Простота использования**: Шаблоны устраняют необходимость писать код, предоставляя предварительно настроенные конвейеры обработки данных, адаптированные под конкретные сценарии.
- **Масштабируемость**: Dataflow обеспечивает эффективное масштабирование вашего конвейера, обрабатывая большие объёмы данных за счёт распределённой обработки.
- **Экономичность**: Вы платите только за фактически потреблённые ресурсы и можете оптимизировать затраты на выполнение конвейера.

## Как запускать шаблоны Dataflow {#how-to-run-dataflow-templates}

На данный момент официальный шаблон ClickHouse доступен через консоль Google Cloud, CLI или REST API Dataflow.
Подробные пошаговые инструкции см. в руководстве [Google Dataflow Run Pipeline From a Template Guide](https://cloud.google.com/dataflow/docs/templates/provided-templates).

## Список шаблонов ClickHouse {#list-of-clickhouse-templates}
* [BigQuery в ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (скоро)
* [Pub/Sub в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (скоро)
