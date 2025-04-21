---
description: 'Этот движок предоставляет интеграцию с экосистемой Azure Blob Storage, позволяя импортировать данные в потоковом режиме.'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'Движок таблиц AzureQueue'
---


# Движок таблиц AzureQueue

Этот движок предоставляет интеграцию с [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs), позволяя импортировать данные в потоковом режиме.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE test (name String, value UInt32)
    ENGINE = AzureQueue(...)
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    ...
```

**Параметры движка**

Параметры `AzureQueue` такие же, как поддерживаемые движком таблиц `AzureBlobStorage`. См. раздел параметров [здесь](../../../engines/table-engines/integrations/azureBlobStorage.md).

Аналогично движку таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Дополнительные детали [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage).

**Пример**

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS mode = 'unordered'
```

## Настройки {#settings}

Набор поддерживаемых настроек такой же, как для движка таблиц `S3Queue`, но без префикса `s3queue_`. См. [полный список настроек](../../../engines/table-engines/integrations/s3queue.md#settings).
Чтобы получить список настроек, сконфигурированных для таблицы, используйте таблицу `system.azure_queue_settings`. Доступно с `24.10`.

## Описание {#description}

`SELECT` не особенно полезен для потокового импорта (за исключением отладки), так как каждый файл может быть импортирован только один раз. Практичнее создать потоки в реальном времени, используя [материализованные представления](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания таблицы для потребления из заданного пути в S3 и рассматривайте ее как поток данных.
2. Создайте таблицу с нужной структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` присоединяет движок, он начинает собирать данные в фоновом режиме.

Пример:

```sql
CREATE TABLE azure_queue_engine_table (key UInt64, data String)
  ENGINE=AzureQueue('<endpoint>', 'CSV', 'gzip')
  SETTINGS
      mode = 'unordered';

CREATE TABLE stats (key UInt64, data String)
  ENGINE = MergeTree() ORDER BY key;

CREATE MATERIALIZED VIEW consumer TO stats
  AS SELECT key, data FROM azure_queue_engine_table;

SELECT * FROM stats ORDER BY key;
```

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу.
- `_file` — Имя файла.

Дополнительную информацию о виртуальных колонках см. [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).

## Интроспекция {#introspection}

Включите логирование для таблицы через настройку таблицы `enable_logging_to_s3queue_log=1`.

Возможности интроспекции такие же, как у движка таблиц [S3Queue](/engines/table-engines/integrations/s3queue#introspection) с несколькими отличиями:

1. Используйте `system.azure_queue` для состояния очереди в памяти для серверных версий >= 25.1. Для более старых версий используйте `system.s3queue` (это также будет содержать информацию для таблиц `azure`).
2. Включите `system.azure_queue_log` через основную конфигурацию ClickHouse, например:

  ```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
  ```

Эта постоянная таблица имеет ту же информацию, что и `system.s3queue`, но для обработанных и неудавшихся файлов.

Таблица имеет следующую структуру:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Имя хоста',
    `event_date` Date COMMENT 'Дата события записи этой записи лога',
    `event_time` DateTime COMMENT 'Время события записи этой записи лога',
    `database` String COMMENT 'Имя базы данных, в которой находится текущая таблица S3Queue.',
    `table` String COMMENT 'Имя таблицы S3Queue.',
    `uuid` String COMMENT 'UUID таблицы S3Queue',
    `file_name` String COMMENT 'Имя обрабатываемого файла',
    `rows_processed` UInt64 COMMENT 'Количество обработанных строк',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'Статус обрабатываемого файла',
    `processing_start_time` Nullable(DateTime) COMMENT 'Время начала обработки файла',
    `processing_end_time` Nullable(DateTime) COMMENT 'Время окончания обработки файла',
    `exception` String COMMENT 'Сообщение об исключении, если произошло'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'Содержит записи логирования с информацией о файлах, обрабатываемых движком S3Queue.'

```

Пример:

```sql
SELECT *
FROM system.azure_queue_log
LIMIT 1
FORMAT Vertical

Row 1:
──────
hostname:              clickhouse
event_date:            2024-12-16
event_time:            2024-12-16 13:42:47
database:              default
table:                 azure_queue_engine_table
uuid:                  1bc52858-00c0-420d-8d03-ac3f189f27c8
file_name:             test_1.csv
rows_processed:        3
status:                Processed
processing_start_time: 2024-12-16 13:42:47
processing_end_time:   2024-12-16 13:42:47
exception:

1 row in set. Elapsed: 0.002 sec.

```
