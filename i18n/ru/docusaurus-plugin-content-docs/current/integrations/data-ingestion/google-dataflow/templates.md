---
sidebar_label: 'Шаблоны'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'Пользователи могут загружать данные в ClickHouse с помощью шаблонов Google Dataflow'
title: 'Шаблоны Google Dataflow'
---
```

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Шаблоны Google Dataflow

<ClickHouseSupportedBadge/>

Шаблоны Google Dataflow предоставляют удобный способ выполнения заранее подготовленных, готовых к использованию конвейеров данных без необходимости писать пользовательский код. Эти шаблоны предназначены для упрощения общих задач обработки данных и созданы с использованием [Apache Beam](https://beam.apache.org/), использующего коннекторы, такие как `ClickHouseIO`, для бесшовной интеграции с базами данных ClickHouse. Запуская эти шаблоны в Google Dataflow, вы можете достичь высокомасштабируемой, распределенной обработки данных с минимальными усилиями.

## Зачем использовать шаблоны Dataflow? {#why-use-dataflow-templates}

- **Простота использования**: Шаблоны устраняют необходимость в кодировании, предлагая предварительно сконфигурированные конвейеры, адаптированные под конкретные случаи использования.
- **Масштабируемость**: Dataflow гарантирует, что ваш конвейер масштабируется эффективно, обрабатывая большие объемы данных с распределенной обработкой.
- **Экономия средств**: Платите только за ресурсы, которые вы потребляете, с возможностью оптимизации затрат на выполнение конвейера.

## Как запустить шаблоны Dataflow {#how-to-run-dataflow-templates}

На данный момент официальный шаблон ClickHouse доступен через Google Cloud CLI или Dataflow REST API. Для подробных пошаговых инструкций обратитесь к [Руководству по запуску конвейера Dataflow из шаблона](https://cloud.google.com/dataflow/docs/templates/provided-templates).

## Список шаблонов ClickHouse {#list-of-clickhouse-templates}
* [BigQuery в ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (скоро!)
* [Pub Sub в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (скоро!)

