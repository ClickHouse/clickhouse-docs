---
title: Объектное Хранилище в ClickHouse Cloud
description: Перемещение данных из объектного хранилища в ClickHouse Cloud
keywords: ['объектное хранилище', 's3', 'azure blob', 'gcs', 'миграция']
---

import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# Перемещение данных из Объектного Хранилища в ClickHouse Cloud

<img src={object_storage_01} class="image" alt="Перемещение Self-managed ClickHouse" style={{width: '90%', padding: '30px'}} />

Если вы используете Объектное Хранилище как хранилище данных и хотите импортировать эти данные в ClickHouse Cloud, 
или если ваша текущая система баз данных может напрямую выгружать данные в Объектное Хранилище, тогда вы можете использовать одну из
функций таблиц для миграции данных, хранящихся в Объектном Хранилище, в таблицу ClickHouse Cloud:

- [s3](/sql-reference/table-functions/s3.md) или [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

Если ваша текущая система баз данных не может напрямую выгружать данные в Объектное Хранилище, вы можете использовать [инструмент ETL/ELT третьей стороны](./etl-tool-to-clickhouse.md) или [clickhouse-local](./clickhouse-local-etl.md) для перемещения данных 
из вашей текущей системы баз данных в Объектное Хранилище, с тем, чтобы в дальнейшем мигрировать эти данные во второй шаг в таблицу ClickHouse Cloud.

Хотя это двухступенчатый процесс (выгрузка данных в Объектное Хранилище, затем загрузка в ClickHouse), преимущества заключаются в том, что это масштабируется до петабайтов благодаря [надежной поддержке ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) высокопараллельных чтений из Объектного Хранилища. 
Также вы можете использовать сложные и сжатые форматы, такие как [Parquet](/interfaces/formats/#data-format-parquet).

Существует [статья в блоге](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) с конкретными примерами кода, показывающая, как вы можете получить данные в ClickHouse Cloud с помощью S3.
