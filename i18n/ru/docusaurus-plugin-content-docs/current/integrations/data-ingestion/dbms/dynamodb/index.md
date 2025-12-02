---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes позволяет подключать ClickHouse к DynamoDB.'
keywords: ['DynamoDB']
title: 'CDC из DynamoDB в ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# CDC из DynamoDB в ClickHouse {#cdc-from-dynamodb-to-clickhouse}

<ExperimentalBadge/>

На этой странице описано, как настроить CDC из DynamoDB в ClickHouse с использованием ClickPipes. В эту интеграцию входят два компонента:
1. Начальный снимок через S3 ClickPipes
2. Обновления в режиме реального времени через Kinesis ClickPipes

Данные будут поступать в таблицу на движке `ReplacingMergeTree`. Этот движок таблицы обычно используется для сценариев CDC, чтобы обеспечить применение операций обновления. Подробнее об этом подходе можно прочитать в следующих статьях блога:

* [Change Data Capture (CDC) с PostgreSQL и ClickHouse — Часть 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) с PostgreSQL и ClickHouse — Часть 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)



## 1. Настройка потока Kinesis {#1-set-up-kinesis-stream}

Сначала включите поток Kinesis для таблицы DynamoDB, чтобы фиксировать изменения в режиме реального времени. Это нужно сделать до создания снимка, чтобы не пропустить какие-либо данные.
Руководство AWS доступно по ссылке [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html).

<Image img={dynamodb_kinesis_stream} size="lg" alt="Поток Kinesis для DynamoDB" border/>



## 2. Создание снимка {#2-create-the-snapshot}

Теперь создадим снимок таблицы DynamoDB. Это можно сделать с помощью экспорта AWS в S3. Руководство AWS доступно [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html).
**Вам нужен «Full export» в формате DynamoDB JSON.**

<Image img={dynamodb_s3_export} size="md" alt="Экспорт DynamoDB в S3" border/>



## 3. Загрузка снимка в ClickHouse {#3-load-the-snapshot-into-clickhouse}

### Создайте необходимые таблицы {#create-necessary-tables}

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

Обратите внимание, что данные имеют вложенную структуру. Нам нужно будет привести их к плоскому виду перед загрузкой в ClickHouse. Это можно сделать с помощью функции `JSONExtract` в ClickHouse в материализованном представлении.

Нам нужно создать три таблицы:

1. Таблица для хранения «сырых» данных из DynamoDB
2. Таблица для хранения окончательно развёрнутых данных (таблица назначения)
3. Материализованное представление для преобразования данных в плоский формат

Для приведённых выше примерных данных из DynamoDB таблицы в ClickHouse будут выглядеть следующим образом:

```sql
/* Таблица снимков */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Таблица для финальных денормализованных данных */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Таблица для финальных денормализованных данных */
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

* Эта таблица должна быть таблицей `ReplacingMergeTree`
* В таблице должен быть столбец `version`
  * На последующих шагах мы сопоставим поле `ApproximateCreationDateTime` из потока Kinesis со столбцом `version`.
* Таблица должна использовать ключ партиционирования в качестве ключа сортировки (задаваемого в `ORDER BY`)
  * Строки с одинаковым ключом сортировки будут очищаться от дубликатов на основе столбца `version`.

### Создание snapshot ClickPipe {#create-the-snapshot-clickpipe}

Теперь вы можете создать ClickPipe для загрузки snapshot-данных из S3 в ClickHouse. Следуйте руководству по S3 ClickPipe [здесь](/integrations/clickpipes/object-storage), но используйте следующие настройки:

* **Ingest path**: вам нужно определить путь к экспортированным JSON-файлам в S3. Путь будет выглядеть примерно так:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

* **Формат**: JSONEachRow
* **Таблица**: ваша таблица снимка (например, `default.snapshot` в приведённом выше примере)

После её создания данные начнут поступать в таблицу снимка и целевую таблицу. Вам не нужно дожидаться окончания загрузки снимка, чтобы перейти к следующему шагу.


## 4. Создайте Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

Теперь мы можем настроить Kinesis ClickPipe для захвата изменений в реальном времени из потока Kinesis. Следуйте руководству по Kinesis ClickPipe [здесь](/integrations/data-ingestion/clickpipes/kinesis.md), но используйте следующие настройки:

- **Stream**: Поток Kinesis, использованный на шаге 1
- **Table**: Ваша целевая таблица (например, `default.destination` в примере выше)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - Отобразите остальные поля в соответствующие целевые столбцы, как показано ниже

<Image img={dynamodb_map_columns} size="md" alt="Сопоставление столбцов DynamoDB" border/>



## 5. Очистка (необязательно) {#5-cleanup-optional}

После завершения снапшотного ClickPipe вы можете удалить таблицу снимка и материализованное представление.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
