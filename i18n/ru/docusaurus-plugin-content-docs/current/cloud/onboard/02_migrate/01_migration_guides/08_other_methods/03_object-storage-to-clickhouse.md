---
title: 'Использование объектного хранилища'
description: 'Перенос данных из объектного хранилища в ClickHouse Cloud'
keywords: ['object storage', 's3', 'azure blob', 'gcs', 'migration']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# Перемещение данных из облачного объектного хранилища в ClickHouse Cloud

<Image img={object_storage_01} size='md' alt='Миграция самостоятельно управляемого ClickHouse' background='white' />

Если вы используете облачное объектное хранилище в качестве озера данных и хотите импортировать эти данные в ClickHouse Cloud
или если ваша текущая система управления базами данных может напрямую выгружать данные в облачное объектное хранилище, вы можете использовать одну из
табличных функций для миграции данных, хранящихся в облачном объектном хранилище, в таблицу ClickHouse Cloud:

- [s3](/sql-reference/table-functions/s3.md) или [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

Если ваша текущая система управления базами данных не может напрямую выгружать данные в облачное объектное хранилище, вы можете использовать [сторонний ETL/ELT-инструмент](/cloud/migration/etl-tool-to-clickhouse) или [clickhouse-local](/cloud/migration/clickhouse-local), чтобы перенести данные
из вашей текущей системы в облачное объектное хранилище, а затем на втором шаге перенести эти данные в таблицу ClickHouse Cloud.

Хотя это двухэтапный процесс (сначала выгрузка данных в облачное объектное хранилище, затем загрузка в ClickHouse), его преимущество в том, что он
масштабируется до петабайт благодаря [надежной поддержке ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) высокопараллельного чтения из облачного объектного хранилища.
Кроме того, вы можете использовать продвинутые и сжатые форматы, такие как [Parquet](/interfaces/formats/Parquet).

Есть [статья в блоге](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) с конкретными примерами кода, показывающими, как можно загрузить данные в ClickHouse Cloud с помощью S3.