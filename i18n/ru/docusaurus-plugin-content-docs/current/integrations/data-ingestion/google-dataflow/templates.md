---
sidebar_label: 'Шаблоны'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'Пользователи могут загружать данные в ClickHouse с использованием шаблонов Google Dataflow'
title: 'Шаблоны Google Dataflow'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'конвейер данных', 'шаблоны', 'пакетная обработка']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Шаблоны Google Dataflow

<ClickHouseSupportedBadge/>

Шаблоны Google Dataflow предоставляют удобный способ запуска готовых к использованию конвейеров обработки данных без необходимости писать собственный код. Эти шаблоны разработаны для упрощения типовых задач обработки данных и построены с использованием [Apache Beam](https://beam.apache.org/) и коннекторов, таких как `ClickHouseIO`, обеспечивающих бесшовную интеграцию с базами данных ClickHouse. Запуская эти шаблоны на Google Dataflow, вы можете добиться высокомасштабируемой распределённой обработки данных при минимальных затратах усилий.



## Зачем использовать шаблоны Dataflow? {#why-use-dataflow-templates}

- **Простота использования**: Шаблоны избавляют от необходимости писать код, предоставляя предварительно настроенные конвейеры для конкретных сценариев использования.
- **Масштабируемость**: Dataflow обеспечивает эффективное масштабирование конвейера, обрабатывая большие объёмы данных с помощью распределённой обработки.
- **Экономическая эффективность**: Оплата только за потребляемые ресурсы с возможностью оптимизации затрат на выполнение конвейера.


## Как запустить шаблоны Dataflow {#how-to-run-dataflow-templates}

В настоящее время официальный шаблон ClickHouse доступен через Google Cloud Console, CLI или Dataflow REST API.
Подробные пошаговые инструкции см. в [руководстве Google Dataflow по запуску конвейера из шаблона](https://cloud.google.com/dataflow/docs/templates/provided-templates).


## Список шаблонов ClickHouse {#list-of-clickhouse-templates}

- [BigQuery в ClickHouse](./templates/bigquery-to-clickhouse)
- [GCS в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (скоро!)
- [Pub/Sub в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (скоро!)
