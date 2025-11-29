---
title: 'Использование объектного хранилища'
description: 'Перемещение данных из объектного хранилища в ClickHouse Cloud'
keywords: ['объектное хранилище', 's3', 'azure blob', 'gcs', 'миграция']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';

# Перенос данных из облачного объектного хранилища в ClickHouse Cloud {#move-data-from-cloud-object-storage-to-clickhouse-cloud}

<Image img={object_storage_01} size="md" alt="Миграция самостоятельно развернутого ClickHouse" background="white" />

Если вы используете облачное объектное хранилище как озеро данных и хотите импортировать эти данные в ClickHouse Cloud,
или если ваша текущая система управления базами данных может напрямую выгружать данные в облачное объектное хранилище, то вы можете использовать одну из
табличных функций для миграции данных, хранящихся в облачном объектном хранилище, в таблицу ClickHouse Cloud:

* [s3](/sql-reference/table-functions/s3.md) или [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
* [gcs](/sql-reference/table-functions/gcs)
* [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

Если ваша текущая система управления базами данных не может напрямую выгружать данные в облачное объектное хранилище, вы можете использовать [сторонний ETL/ELT-инструмент](/cloud/migration/etl-tool-to-clickhouse) или [clickhouse-local](/cloud/migration/clickhouse-local) для переноса данных
из вашей текущей системы управления базами данных в облачное объектное хранилище, чтобы на втором этапе мигрировать эти данные в таблицу ClickHouse Cloud.

Хотя это двухэтапный процесс (сначала выгрузка данных в облачное объектное хранилище, затем загрузка в ClickHouse), его преимущество в том, что он
масштабируется до петабайт благодаря [полноценной поддержке ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) высокопараллельного чтения из облачного объектного хранилища.
Также вы можете использовать продвинутые и сжатые форматы, такие как [Parquet](/interfaces/formats/Parquet).

В блоге опубликована [статья](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) с конкретными примерами кода, демонстрирующими, как загружать данные в ClickHouse Cloud с использованием S3.