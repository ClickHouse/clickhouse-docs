---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes позволяют подключить ClickHouse к DynamoDB.'
keywords: ['DynamoDB']
title: 'CDC из DynamoDB в ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';

# CDC из DynamoDB в ClickHouse \{#cdc-from-dynamodb-to-clickhouse\}

На этой странице описано, как настроить CDC из DynamoDB в ClickHouse с использованием ClickPipes. Эта интеграция состоит из двух компонентов:

1. Начальный снимок данных через S3 ClickPipes
2. Обновления в реальном времени через Kinesis ClickPipes

Данные будут приниматься в таблицу `ReplacingMergeTree`. Этот движок таблицы обычно используется в сценариях CDC, чтобы можно было применять операции обновления. Подробнее об этом подходе можно узнать в следующих статьях блога:

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Настройте поток Kinesis \{#1-set-up-kinesis-stream\}

Сначала необходимо включить поток Kinesis для таблицы DynamoDB, чтобы фиксировать изменения в режиме реального времени. Делайте это до создания снимка, чтобы не пропустить ни одних данных.
Подробности см. в руководстве AWS [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html).

<Image img={dynamodb_kinesis_stream} size="lg" alt="Поток DynamoDB Kinesis" border/>

## 2. Создайте снимок \{#2-create-the-snapshot\}

Далее мы создадим снимок таблицы DynamoDB. Это можно сделать, выполнив экспорт AWS в S3. Руководство AWS находится [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html).
**Необходимо выполнить полную выгрузку («Full export») в формате DynamoDB JSON.**

<Image img={dynamodb_s3_export} size="md" alt="Экспорт DynamoDB в S3" border/>

## 3. Загрузите снимок в ClickHouse \{#3-load-the-snapshot-into-clickhouse\}

### Создайте необходимые таблицы \{#create-necessary-tables\}

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

Обратите внимание, что данные имеют вложенный формат. Нам нужно будет развернуть (flatten) эти данные перед загрузкой в ClickHouse. Это можно сделать с помощью функции `JSONExtract` в ClickHouse в materialized view.

Нам нужно создать три таблицы:

1. Таблица для хранения исходных данных из DynamoDB
2. Таблица для хранения итоговых развернутых данных (таблица назначения)
3. materialized view для разворачивания данных

Для приведённого выше примера данных из DynamoDB таблицы в ClickHouse будут выглядеть следующим образом:

```sql
/* Snapshot table */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Table for final flattened data */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Table for final flattened data */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

Для целевой таблицы есть несколько требований:

* Эта таблица должна быть таблицей `ReplacingMergeTree`
* В таблице должен быть столбец `version`
  * На последующих шагах мы будем сопоставлять поле `ApproximateCreationDateTime` из потока Kinesis со столбцом `version`.
* Таблица должна использовать ключ партиционирования в качестве ключа сортировки (задается через `ORDER BY`)
  * Строки с одним и тем же ключом сортировки будут дедуплироваться на основе столбца `version`.

### Создайте ClickPipe для снимка \{#create-the-snapshot-clickpipe\}

Теперь вы можете создать ClickPipe для загрузки данных снимка из S3 в ClickHouse. Следуйте руководству по S3 ClickPipe [здесь](/integrations/clickpipes/object-storage/s3/overview), но используйте следующие настройки:

* **Ingest path**: вам нужно будет найти путь к экспортированным json‑файлам в S3. Путь будет выглядеть примерно так:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

* **Format**: JSONEachRow
* **Table**: Ваша таблица snapshot (например, `default.snapshot` в примере выше)

После создания данные начнут поступать в таблицу snapshot и целевую таблицу. Вам не нужно дожидаться завершения загрузки snapshot, чтобы переходить к следующему шагу.

## 4. Создание Kinesis ClickPipe \{#4-create-the-kinesis-clickpipe\}

Теперь мы можем настроить Kinesis ClickPipe для фиксации изменений в реальном времени из потока Kinesis. Следуйте руководству по Kinesis ClickPipe [здесь](/integrations/data-ingestion/clickpipes/kinesis.md), при этом используйте следующие настройки:

- **Stream**: поток Kinesis, использованный на шаге 1
- **Table**: ваша целевая таблица (например, `default.destination` в примере выше)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - Сопоставьте остальные поля с соответствующими целевыми столбцами, как показано ниже

<Image img={dynamodb_map_columns} size="md" alt="Сопоставление столбцов DynamoDB" border/>

## 5. Очистка (необязательно) \{#5-cleanup-optional\}

После завершения snapshot ClickPipe вы можете удалить snapshot-таблицу и materialized view.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
