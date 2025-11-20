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


# CDC из DynamoDB в ClickHouse

<ExperimentalBadge/>

На этой странице описано, как настроить CDC из DynamoDB в ClickHouse с помощью ClickPipes. В этой интеграции есть два компонента:
1. Начальный снапшот через S3 ClickPipes
2. Обновления в реальном времени через Kinesis ClickPipes

Данные будут загружаться в таблицу на движке `ReplacingMergeTree`. Этот движок обычно используется для сценариев CDC, чтобы можно было применять операции обновления. Подробнее об этом паттерне можно прочитать в следующих статьях блога:

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)



## 1. Настройка потока Kinesis {#1-set-up-kinesis-stream}

Сначала необходимо включить поток Kinesis для таблицы DynamoDB, чтобы фиксировать изменения в режиме реального времени. Это следует сделать до создания снимка, чтобы не потерять данные.
Руководство AWS находится [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html).

<Image
  img={dynamodb_kinesis_stream}
  size='lg'
  alt='Поток Kinesis для DynamoDB'
  border
/>


## 2. Создание снимка {#2-create-the-snapshot}

Далее необходимо создать снимок таблицы DynamoDB. Это можно сделать с помощью экспорта AWS в S3. Руководство AWS доступно [здесь](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html).
**Необходимо выполнить полный экспорт (Full export) в формате DynamoDB JSON.**

<Image img={dynamodb_s3_export} size='md' alt='Экспорт DynamoDB в S3' border />


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

Обратите внимание, что данные имеют вложенную структуру. Перед загрузкой в ClickHouse их необходимо преобразовать в плоский формат. Это можно сделать с помощью функции `JSONExtract` в ClickHouse в материализованном представлении.

Необходимо создать три таблицы:

1. Таблицу для хранения исходных данных из DynamoDB
2. Таблицу для хранения итоговых преобразованных данных (целевая таблица)
3. Материализованное представление для преобразования данных в плоский формат

Для приведенного выше примера данных DynamoDB таблицы ClickHouse будут выглядеть следующим образом:

```sql
/* Таблица снимка */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Материализованное представление для преобразования данных */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Таблица для итоговых преобразованных данных */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

К целевой таблице предъявляются следующие требования:

- Таблица должна использовать движок `ReplacingMergeTree`
- Таблица должна содержать столбец `version`
  - На последующих этапах поле `ApproximateCreationDateTime` из потока Kinesis будет сопоставлено со столбцом `version`.
- Таблица должна использовать ключ партиционирования в качестве ключа сортировки (указывается через `ORDER BY`)
  - Строки с одинаковым ключом сортировки будут дедуплицированы на основе столбца `version`.

### Создание ClickPipe для снимка {#create-the-snapshot-clickpipe}

Теперь можно создать ClickPipe для загрузки данных снимка из S3 в ClickHouse. Следуйте руководству по S3 ClickPipe [здесь](/integrations/clickpipes/object-storage), используя следующие настройки:

- **Путь загрузки**: Необходимо указать путь к экспортированным json-файлам в S3. Путь будет выглядеть примерно так:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **Формат**: JSONEachRow
- **Таблица**: Ваша таблица снимка (например, `default.snapshot` в примере выше)

После создания данные начнут заполняться в таблице снимка и целевой таблице. Не обязательно ждать завершения загрузки снимка перед переходом к следующему шагу.


## 4. Создание Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

Теперь можно настроить Kinesis ClickPipe для захвата изменений в реальном времени из потока Kinesis. Следуйте руководству по Kinesis ClickPipe [здесь](/integrations/data-ingestion/clickpipes/kinesis.md), используя следующие настройки:

- **Stream**: Поток Kinesis, использованный на шаге 1
- **Table**: Целевая таблица (например, `default.destination` в примере выше)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - Сопоставьте остальные поля с соответствующими столбцами целевой таблицы, как показано ниже

<Image img={dynamodb_map_columns} size='md' alt='Сопоставление столбцов DynamoDB' border />


## 5. Очистка (необязательно) {#5-cleanup-optional}

После завершения работы ClickPipe со снимком можно удалить таблицу снимка и материализованное представление.

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
