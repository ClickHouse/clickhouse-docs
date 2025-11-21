---
title: 'Поддерживает ли ClickHouse озёра данных?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse поддерживает озёра данных, включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# Поддерживает ли ClickHouse озёра данных (Data Lakes)?

ClickHouse поддерживает озёра данных, включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive.

Он обеспечивает поддержку **чтения** и **записи**, полную совместимость с отсечением по партициям (partition pruning), отсечением на основе статистики, эволюцией схемы, позиционными удалениями, удалениями по равенству (equality deletes), time travel и интроспекцией.

Озёра данных в ClickHouse поддерживаются с помощью каталогов **Unity**, **AWS Glue**, **REST**, **Polaris** и **Hive Metastore**, а также на уровне отдельных таблиц.

Производительность запросов к озёрам данных отличается высочайшим уровнем благодаря распределённой обработке, эффективному нативному Parquet-ридеру и кэшированию файлов с данными.