---
'title': 'Использование объектного хранилища'
'description': 'Перемещение данных из объектного хранилища в ClickHouse Cloud'
'keywords':
- 'object storage'
- 's3'
- 'azure blob'
- 'gcs'
- 'migration'
'slug': '/integrations/migration/object-storage-to-clickhouse'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# Перемещение данных из облачного объектного хранилища в ClickHouse Cloud

<Image img={object_storage_01} size='md' alt='Миграция самоуправляемого ClickHouse' background='white' />

Если вы используете облачное объектное хранилище в качестве ДатаЛэйка и хотите импортировать эти данные в ClickHouse Cloud, или если ваша текущая система баз данных может непосредственно выгружать данные в облачное объектное хранилище, вы можете использовать одну из табличных функций для миграции данных, хранящихся в облачном объектном хранилище, в таблицу ClickHouse Cloud:

- [s3](/sql-reference/table-functions/s3.md) или [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

Если ваша текущая система баз данных не может непосредственно выгружать данные в облачное объектное хранилище, вы можете использовать [инструмент ETL/ELT третьих сторон](/cloud/migration/etl-tool-to-clickhouse) или [clickhouse-local](/cloud/migration/clickhouse-local) для перемещения данных из вашей текущей системы баз данных в облачное объектное хранилище, чтобы затем вторая стадия миграции данных в таблицу ClickHouse Cloud.

Хотя это процесс в два этапа (выгрузка данных в облачное объектное хранилище, затем загрузка в ClickHouse), преимущество заключается в том, что он масштабируется до петабайтов благодаря [надежной поддержке ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) высокопараллельного чтения из облачного объектного хранилища. Также вы можете использовать сложные и сжатые форматы, такие как [Parquet](/interfaces/formats/#data-format-parquet).

Существует [статья в блоге](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) с конкретными примерами кода, демонстрирующая, как можно загрузить данные в ClickHouse Cloud с использованием S3.