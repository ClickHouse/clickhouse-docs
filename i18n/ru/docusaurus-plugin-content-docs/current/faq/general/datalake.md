---
title: 'Поддерживает ли ClickHouse data lake?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse поддерживает data lake, включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# Поддерживает ли ClickHouse дата-лейки?

ClickHouse поддерживает дата-лейки, включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon и Hive.

Он поддерживает **чтение** и **запись**, полностью совместим с отсечением разделов (partition pruning), отсечением на основе статистики, эволюцией схемы, позиционными удалениями (positional deletes), удалениями по равенству (equality deletes), time travel и средствами интроспекции.

Дата-лейки в ClickHouse поддерживаются с каталогами **Unity**, **AWS Glue**, **Rest**, **Polaris** и **Hive Metastore**, а также для отдельных таблиц.

Производительность запросов к дата-лейкам находится на высочайшем уровне благодаря распределённой обработке, эффективному нативному считывателю Parquet и кешированию файлов данных.