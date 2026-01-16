---
description: 'Документация по озерам данных'
sidebar_label: 'Озера данных'
sidebar_position: 2
slug: /sql-reference/datalakes
title: 'Озера данных'
doc_type: 'reference'
---

В этом разделе мы рассмотрим поддержку озер данных в ClickHouse.
ClickHouse поддерживает многие из самых популярных форматов таблиц и каталогов данных, включая Iceberg, Delta Lake, Hudi, AWS Glue, REST Catalog, Unity Catalog и Microsoft OneLake.

# Открытые форматы таблиц \\{#open-table-formats\\}

## Iceberg \\{#iceberg\\}

См. функцию [iceberg](https://clickhouse.com/docs/sql-reference/table-functions/iceberg), которая поддерживает чтение из Amazon S3 и S3-совместимых сервисов, HDFS, Azure и локальных файловых систем. [icebergCluster](https://clickhouse.com/docs/sql-reference/table-functions/icebergCluster) — это распределённый вариант функции `iceberg`.

## Delta Lake \\{#delta-lake\\}

См. описание функции [deltaLake](https://clickhouse.com/docs/sql-reference/table-functions/deltalake), поддерживающей чтение из Amazon S3 и S3‑совместимых сервисов, Azure и локальных файловых систем. [deltaLakeCluster](https://clickhouse.com/docs/sql-reference/table-functions/deltalakeCluster) — это распределённый вариант функции `deltaLake`.

## Hudi \\{#hudi\\}

См. [hudi](https://clickhouse.com/docs/sql-reference/table-functions/hudi), которая поддерживает чтение из Amazon S3 и S3-совместимых сервисов. [hudiCluster](https://clickhouse.com/docs/sql-reference/table-functions/hudiCluster) — это распределённый вариант функции `hudi`.

# Каталоги данных \\{#data-catalogs\\}

## AWS Glue \\{#aws-glue\\}

AWS Glue Data Catalog можно использовать с таблицами Iceberg. Вы можете использовать его с движком таблицы `iceberg` или с движком базы данных [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog).

## Iceberg REST Catalog \\{#iceberg-rest-catalog\\}

REST-каталог Iceberg можно использовать с таблицами Iceberg. Вы можете использовать его с табличным движком `iceberg` или с движком базы данных [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog).

## Unity Catalog \\{#unity-catalog\\}

Unity Catalog можно использовать как с таблицами Delta Lake, так и с таблицами Iceberg. Вы можете использовать его с движками таблиц `iceberg` или `deltaLake`, а также с движком базы данных [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog).

## Microsoft OneLake \\{#microsoft-onelake\\}

Microsoft OneLake совместим как с таблицами Delta Lake, так и с таблицами Iceberg. Его можно использовать с движком базы данных [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog).