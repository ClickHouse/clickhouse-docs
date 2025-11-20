---
sidebar_label: 'Шаблоны'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'Пользователи могут загружать данные в ClickHouse с помощью шаблонов Google Dataflow'
title: 'Шаблоны Google Dataflow'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'data pipeline', 'templates', 'batch processing']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Шаблоны Google Dataflow

<ClickHouseSupportedBadge/>

Шаблоны Google Dataflow предоставляют удобный способ выполнять готовые конвейеры обработки данных без необходимости писать собственный код. Эти шаблоны разработаны для упрощения распространённых задач обработки данных и построены с использованием [Apache Beam](https://beam.apache.org/), применяя коннекторы, такие как `ClickHouseIO`, для бесшовной интеграции с базами данных ClickHouse. Запуская эти шаблоны в Google Dataflow, вы можете с минимальными усилиями обеспечить высокомасштабируемую, распределённую обработку данных.



## Зачем использовать шаблоны Dataflow? {#why-use-dataflow-templates}

- **Простота использования**: Шаблоны избавляют от необходимости писать код, предоставляя предварительно настроенные конвейеры для конкретных сценариев использования.
- **Масштабируемость**: Dataflow обеспечивает эффективное масштабирование конвейера, обрабатывая большие объёмы данных с помощью распределённой обработки.
- **Экономическая эффективность**: Оплата только за потребляемые ресурсы с возможностью оптимизации затрат на выполнение конвейера.


## Как запустить шаблоны Dataflow {#how-to-run-dataflow-templates}

В настоящее время официальный шаблон ClickHouse доступен через Google Cloud Console, CLI или Dataflow REST API.
Подробные пошаговые инструкции см. в [руководстве Google Dataflow по запуску конвейера из шаблона](https://cloud.google.com/dataflow/docs/templates/provided-templates).


## Список шаблонов ClickHouse {#list-of-clickhouse-templates}

- [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
- [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (скоро!)
- [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (скоро!)
