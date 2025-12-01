---
title: 'Поддерживает ли ClickHouse озера данных?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse поддерживает озера данных, включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive'
doc_type: 'reference'
keywords: ['озеро данных', 'lakehouse']
---

# Поддерживает ли ClickHouse озёра данных? {#does-clickhouse-support-data-lakes}

ClickHouse поддерживает озёра данных (Data Lakes), включая Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive.

Он поддерживает операции **чтения** и **записи** и обеспечивает полную совместимость с отсечением по партициям (partition pruning), отсечением на основе статистики (statistics-based pruning), эволюцией схемы (schema evolution), позиционными удалениями (positional deletes), удалениями по равенству (equality deletes), time travel и интроспекцией.

Озёра данных в ClickHouse поддерживаются с каталогами **Unity**, **AWS Glue**, **Rest**, **Polaris** и **Hive Metastore**, а также с отдельными таблицами.

Производительность запросов по озёрам данных на высочайшем уровне благодаря распределённой обработке, эффективному встроенному считывателю Parquet и кэшированию файлов данных.