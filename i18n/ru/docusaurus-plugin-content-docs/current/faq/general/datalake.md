---
title: 'Поддерживает ли ClickHouse дата-лейки (data lakes)?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse поддерживает дата-лейки (data lakes), включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# Поддерживает ли ClickHouse дата-лейки?

ClickHouse поддерживает дата-лейки, включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive.

Он поддерживает **чтение** и **запись**, полностью совместим с отсечением по партициям (partition pruning), отсечением на основе статистики (statistics-based pruning), эволюцией схемы (schema evolution), позиционными удалениями (positional deletes), удалениями по равенству (equality deletes), time travel и возможностями интроспекции.

Дата-лейки в ClickHouse поддерживаются через каталоги **Unity**, **AWS Glue**, **Rest**, **Polaris** и **Hive Metastore**, а также через отдельные таблицы.

Производительность запросов к дата-лейкам находится на высочайшем уровне благодаря распределённой обработке, эффективному нативному считывателю Parquet и кэшированию файлов данных.