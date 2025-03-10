---
sidebar_label: DynamoDB
sidebar_position: 10
slug: /integrations/dynamodb
description: ClickPipes позволяет подключать ClickHouse к DynamoDB.
keywords: [clickhouse, DynamoDB, connect, integrate, table]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';


# CDC из DynamoDB в ClickHouse

<ExperimentalBadge/>

Эта страница охватывает настройку CDC из DynamoDB в ClickHouse с использованием ClickPipes. В этой интеграции есть 2 компонента:
1. Начальная снимок через S3 ClickPipes
2. Обновления в реальном времени через Kinesis ClickPipes

Данные будут загружены в `ReplacingMergeTree`. Этот движок таблиц обычно используется для сценариев CDC, чтобы операции обновления могли быть применены. Больше информации об этой модели можно найти в следующих блог-статьях:

* [Change Data Capture (CDC) с PostgreSQL и ClickHouse - Часть 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) с PostgreSQL и ClickHouse - Часть 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Настройка Kinesis Stream {#1-set-up-kinesis-stream}

Сначала вам нужно будет включить Kinesis stream на вашей таблице DynamoDB для захвата изменений в реальном времени. Мы хотим сделать это до создания снимка, чтобы не пропустить никаких данных.
Найдите руководство AWS, расположенное [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html).

<img src={dynamodb_kinesis_stream} alt="DynamoDB Kinesis Stream"/>

## 2. Создание снимка {#2-create-the-snapshot}

Далее мы создадим снимок таблицы DynamoDB. Это можно сделать через экспорт AWS в S3. Найдите руководство AWS, расположенное [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html).
**Вам нужно сделать "Полный экспорт" в формате JSON DynamoDB.**

<img src={dynamodb_s3_export} alt="DynamoDB S3 Export"/>

## 3. Загрузка снимка в ClickHouse {#3-load-the-snapshot-into-clickhouse}

### Создание необходимых таблиц {#create-necessary-tables}

Данные снимка из DynamoDB будут выглядеть примерно так:
```json
{
  "age": {
    "N": "26"
  },
  "first_name": {
    "S": "sally"
  },
  "id": {
    "S": "0A556908-F72B-4BE6-9048-9E60715358D4"
  }
}
```

Обратите внимание, что данные находятся в вложенном формате. Нам нужно будет разровнять эти данные перед загрузкой в ClickHouse. Это можно сделать с помощью функции `JSONExtract` в ClickHouse в Materialized View.

Мы хотим создать три таблицы:
1. Таблицу для хранения сырых данных из DynamoDB
2. Таблицу для хранения окончательных разровненных данных (целевой таблицы)
3. Materialized View для разравнивания данных

Для примера данных DynamoDB выше, таблицы ClickHouse будут выглядеть так:

```sql
/* Таблица снимка */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Таблица для окончательных разровненных данных */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Таблица для окончательных разровненных данных */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
) 
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

Есть несколько требований к целевой таблице:
- Эта таблица должна быть таблицей `ReplacingMergeTree`
- Таблица должна иметь колонку `version`
  - На следующих этапах мы будем сопоставлять поле `ApproximateCreationDateTime` из Kinesis stream с колонкой `version`.
- Таблица должна использовать ключ партиции в качестве ключа сортировки (указано с помощью `ORDER BY`)
  - Строки с одинаковым ключом сортировки будут дедуплицироваться на основе колонки `version`.

### Создание ClickPipe для снимка {#create-the-snapshot-clickpipe}

Теперь вы можете создать ClickPipe для загрузки данных снимка из S3 в ClickHouse. Следуйте руководству ClickPipe для S3 [здесь](/integrations/data-ingestion/clickpipes/object-storage.md), но используйте следующие настройки:

- **Ingest path**: Вам нужно будет найти путь к экспортированным json файлам в S3. Путь будет выглядеть примерно так:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **Format**: JSONEachRow
- **Table**: Ваша таблица снимка (например, `default.snapshot` в примере выше)

После создания данные начнут заполняться в таблицы снимка и назначения. Вам не нужно ждать завершения загрузки снимка, чтобы перейти к следующему шагу.

## 4. Создание Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

Теперь мы можем настроить Kinesis ClickPipe для захвата изменений в реальном времени из Kinesis stream. Следуйте руководству Kinesis ClickPipe [здесь](/integrations/data-ingestion/clickpipes/kinesis.md), но используйте следующие настройки:

- **Stream**: Kinesis stream, использованный на шаге 1
- **Table**: Ваша целевая таблица (например, `default.destination` в примере выше)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - Сопоставьте другие поля с соответствующими колонками назначения, как показано ниже

<img src={dynamodb_map_columns} alt="DynamoDB Map Columns"/>

## 5. Очистка (по желанию) {#5-cleanup-optional}

После завершения ClickPipe снимка вы можете удалить таблицу снимка и материализованный вид.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
