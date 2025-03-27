---
title: 'Объектное хранилище в ClickHouse Cloud'
description: 'Перемещение данных из объектного хранилища в ClickHouse Cloud'
keywords: ['объектное хранилище', 's3', 'azure blob', 'gcs', 'миграция']
slug: /integrations/migration/object-storage-to-clickhouse
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# Перемещение данных из облачного объектного хранилища в ClickHouse Cloud

<Image img={object_storage_01} size='md' alt='Миграция самоуправляемого ClickHouse' background='white' />

Если вы используете облачное объектное хранилище в качестве озера данных и хотите импортировать эти данные в ClickHouse Cloud, или если ваша текущая система баз данных может напрямую выгружать данные в облачное объектное хранилище, вы можете использовать одну из 
табличных функций для миграции данных, хранящихся в облачном объектном хранилище, в таблицу ClickHouse Cloud:

- [s3](/sql-reference/table-functions/s3.md) или [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

Если ваша текущая система баз данных не может напрямую выгружать данные в облачное объектное хранилище, вы можете использовать [инструмент ETL/ELT стороннего производителя](./etl-tool-to-clickhouse.md) или [clickhouse-local](./clickhouse-local-etl.md) для перемещения данных из вашей текущей системы баз данных в облачное объектное хранилище, чтобы мигрировать эти данные во втором этапе в таблицу ClickHouse Cloud.

Хотя это двухступенчатый процесс (выгрузка данных в облачное объектное хранилище, затем загрузка в ClickHouse), преимущество в том, что это
масштабируется до петабайтов благодаря [надежной поддержке ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) высокопараллельных чтений из облачного объектного хранилища.
Кроме того, вы можете использовать сложные и сжатые форматы, такие как [Parquet](/interfaces/formats/#data-format-parquet).

Есть [статья в блоге](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) с конкретными примерами кода, показывающая, как вы можете получить данные в ClickHouse Cloud с использованием S3.
