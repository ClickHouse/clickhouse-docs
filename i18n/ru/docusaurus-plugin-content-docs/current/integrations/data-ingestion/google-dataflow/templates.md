---
sidebar_label: Шаблоны
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: Пользователи могут загружать данные в ClickHouse с помощью шаблонов Google Dataflow
---


# Шаблоны Google Dataflow

Шаблоны Google Dataflow предоставляют удобный способ выполнения предустановленных, готовых к использованию конвейеров данных без необходимости написания пользовательского кода. Эти шаблоны предназначены для упрощения общих задач обработки данных и созданы с использованием [Apache Beam](https://beam.apache.org/), используя коннекторы, такие как `ClickHouseIO`, для бесшовной интеграции с базами данных ClickHouse. Запуская эти шаблоны на Google Dataflow, вы можете достичь высокой масштабируемости и распределенной обработки данных с минимальными усилиями.

## Зачем использовать шаблоны Dataflow? {#why-use-dataflow-templates}

- **Простота использования**: Шаблоны избавляют от необходимости кодирования, предлагая предназнначенные конвейеры, адаптированные к конкретным сценариям использования.
- **Масштабируемость**: Dataflow гарантирует, что ваш конвейер масштабируется эффективно, обрабатывая большие объемы данных с помощью распределенной обработки.
- **Экономическая эффективность**: Платите только за те ресурсы, которые вы используете, с возможностью оптимизировать затраты на выполнение конвейера.

## Как запустить шаблоны Dataflow {#how-to-run-dataflow-templates}

На сегодняшний день официальный шаблон ClickHouse доступен через Google Cloud CLI или Dataflow REST API. Для подробных пошаговых инструкций обратитесь к [Руководству по запуску конвейера Dataflow из шаблона](https://cloud.google.com/dataflow/docs/templates/provided-templates).

## Список шаблонов ClickHouse {#list-of-clickhouse-templates}
* [BigQuery в ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (скоро!)
* [Pub Sub в ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (скоро!)
