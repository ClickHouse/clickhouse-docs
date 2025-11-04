---
slug: '/integrations/google-dataflow/templates'
sidebar_label: Шаблоны
sidebar_position: 3
description: 'пользователи могут принимать данные в ClickHouse с помощью Шаблонов'
title: 'Шаблоны Google Dataflow'
doc_type: guide
---
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Шаблоны Google Dataflow

<ClickHouseSupportedBadge/>

Шаблоны Google Dataflow предоставляют удобный способ выполнения предустановленных, готовых к использованию конвейеров данных без необходимости написания пользовательского кода. Эти шаблоны разработаны для упрощения распространённых задач обработки данных и созданы с использованием [Apache Beam](https://beam.apache.org/), используя коннекторы, такие как `ClickHouseIO`, для бесшовной интеграции с базами данных ClickHouse. Запуская эти шаблоны на Google Dataflow, вы можете достичь высокомасштабируемой, распределённой обработки данных с минимальными усилиями.

## Зачем использовать шаблоны Dataflow? {#why-use-dataflow-templates}

- **Простота использования**: Шаблоны устраняют необходимость кодирования, предлагая преднастроенные конвейеры, адаптированные к конкретным случаям использования.
- **Масштабируемость**: Dataflow обеспечивает эффективное масштабирование вашего конвейера, обрабатывая большие объёмы данных с помощью распределённой обработки.
- **Экономия средств**: Платите только за ресурсы, которые вы используете, с возможностью оптимизации затрат на выполнение конвейера.

## Как запустить шаблоны Dataflow {#how-to-run-dataflow-templates}

На сегодняшний день официальный шаблон ClickHouse доступен через Google Cloud Console, CLI или Dataflow REST API. Для подробных пошаговых инструкций обратитесь к [Руководству по запуску конвейера Google Dataflow из шаблона](https://cloud.google.com/dataflow/docs/templates/provided-templates).

## Список шаблонов ClickHouse {#list-of-clickhouse-templates}
* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (скоро!)
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (скоро!)