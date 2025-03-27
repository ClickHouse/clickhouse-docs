---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes позволяет подключать ClickHouse к DynamoDB.'
keywords: ['clickhouse', 'DynamoDB', 'connect', 'integrate', 'table']
title: 'CDC из DynamoDB в ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# CDC из DynamoDB в ClickHouse

<ExperimentalBadge/>

На этой странице описывается, как настроить CDC из DynamoDB в ClickHouse с использованием ClickPipes. Для этой интеграции предусмотрены 2 компонента:
1. Начальный снимок через S3 ClickPipes
2. Обновления в реальном времени через Kinesis ClickPipes

Данные будут загружены в `ReplacingMergeTree`. Этот движок таблиц часто используется для сценариев CDC, чтобы разрешить применение операций обновления. Дополнительную информацию об этой модели можно найти в следующих статьях блога:

* [Съемка изменений данных (CDC) с PostgreSQL и ClickHouse - Часть 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Съемка изменений данных (CDC) с PostgreSQL и ClickHouse - Часть 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Настройка Kinesis Stream {#1-set-up-kinesis-stream}

Сначала вам нужно включить поток Kinesis на вашей таблице DynamoDB, чтобы захватывать изменения в реальном времени. Мы хотим сделать это перед созданием снимка, чтобы избежать пропуска данных.
Найдите руководство AWS, находящееся [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html).

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. Создание снимка {#2-create-the-snapshot}

Далее мы создадим снимок таблицы DynamoDB. Это можно сделать через экспорт AWS в S3. Найдите руководство AWS, находящееся [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html).
**Вы должны сделать "Полный экспорт" в формате JSON DynamoDB.**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

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

Обратите внимание, что данные находятся в вложенном формате. Нам нужно развернуть эти данные перед загрузкой в ClickHouse. Это можно сделать с помощью функции `JSONExtract` в ClickHouse в материализованном представлении.

Мы создадим три таблицы:
1. Таблица для хранения необработанных данных из DynamoDB
2. Таблица для хранения окончательных развернутых данных (конечная таблица)
3. Материализованное представление для развертывания данных


Для приведенных выше данных DynamoDB таблицы ClickHouse будут выглядеть следующим образом:

```sql
/* Таблица снимка */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Таблица для окончательных развернутых данных */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Таблица для окончательных развернутых данных */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

Существуют некоторые требования к целевой таблице:
- Эта таблица должна быть таблицей `ReplacingMergeTree`
- Таблица должна содержать столбец `version`
  - На следующих этапах мы будем сопоставлять поле `ApproximateCreationDateTime` из потока Kinesis со столбцом `version`.
- Таблица должна использовать ключ раздела в качестве ключа сортировки (указывается с помощью `ORDER BY`)
  - Строки с одинаковым ключом сортировки будут дедуплицироваться на основе столбца `version`.

### Создание ClickPipe для снимка {#create-the-snapshot-clickpipe}
Теперь вы можете создать ClickPipe для загрузки данных снимка из S3 в ClickHouse. Следуйте руководству по ClickPipe для S3 [здесь](/integrations/data-ingestion/clickpipes/object-storage.md), но используйте следующие настройки:

- **Путь загрузки**: Вам нужно будет найти путь к экспортированным json-файлам в S3. Путь будет выглядеть примерно так:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **Формат**: JSONEachRow
- **Таблица**: Ваша таблица снимка (например, `default.snapshot` в приведенном выше примере)

После создания данные начнут заполняться в таблицах снимка и назначения. Вам не нужно ждать завершения загрузки снимка, прежде чем переходить к следующему шагу.

## 4. Создание ClickPipe Kinesis {#4-create-the-kinesis-clickpipe}

Теперь мы можем настроить ClickPipe Kinesis для захвата изменений в реальном времени из потока Kinesis. Следуйте руководству по ClickPipe Kinesis [здесь](/integrations/data-ingestion/clickpipes/kinesis.md), но используйте следующие настройки:

- **Поток**: Поток Kinesis, использованный на шаге 1
- **Таблица**: Ваша целевая таблица (например, `default.destination` в приведенном выше примере)
- **Развернуть объект**: true
- **Сопоставления столбцов**:
  - `ApproximateCreationDateTime`: `version`
  - Сопоставьте другие поля с соответствующими столбцами назначения, как показано ниже

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB Map Columns" border/>

## 5. Очистка (необязательно) {#5-cleanup-optional}

После завершения ClickPipe снимка вы можете удалить таблицу снимка и материализованное представление.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
