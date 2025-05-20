---
description: 'Этот движок предоставляет интеграцию с экосистемой Azure Blob Storage,
  позволяя импорт потоковых данных.'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'Движок таблиц AzureQueue'
---


# Движок таблиц AzureQueue

Этот движок предоставляет интеграцию с [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs), позволяя импорт потоковых данных.

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

Параметры `AzureQueue` такие же, как и для движка таблиц `AzureBlobStorage`. См. раздел параметров [здесь](../../../engines/table-engines/integrations/azureBlobStorage.md).

Аналогично движку таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Подробности [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage).

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
Чтобы получить список настроек, конфигурируемых для таблицы, используйте таблицу `system.azure_queue_settings`. Доступно с `24.10`.

## Описание {#description}

`SELECT` особенно полезен для потокового импорта (за исключением отладки), поскольку каждый файл может быть импортирован только один раз. Более практично создавать потоки в реальном времени, используя [материализованные представления](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания таблицы для потребления данных по указанному пути в S3 и рассматривайте это как поток данных.
2.  Создайте таблицу с желаемой структурой.
3.  Создайте материализованное представление, которое конвертирует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` соединяется с движком, он начинает собирать данные в фоновом режиме.

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

Дополнительную информацию о виртуальных колонках смотрите [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).

## Интроспекция {#introspection}

Включите логирование для таблицы через настройку таблицы `enable_logging_to_queue_log=1`.

Возможности интроспекции такие же, как и у [S3Queue table engine](/engines/table-engines/integrations/s3queue#introspection) с несколькими отличиями:

1. Используйте `system.azure_queue` для состояния очереди в памяти для серверных версий >= 25.1. Для более старых версий используйте `system.s3queue` (он будет содержать информацию и для таблиц `azure`).
2. Включите `system.azure_queue_log` через основную конфигурацию ClickHouse, например:

  ```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
  ```

Эта постоянная таблица содержит ту же информацию, что и `system.s3queue`, но для обработанных и неудачных файлов.

Таблица имеет следующую структуру:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Имя хоста',
    `event_date` Date COMMENT 'Дата события записи этой строки лога',
    `event_time` DateTime COMMENT 'Время события записи этой строки лога',
    `database` String COMMENT 'Имя базы данных, где находится текущая таблица S3Queue.',
    `table` String COMMENT 'Имя таблицы S3Queue.',
    `uuid` String COMMENT 'UUID таблицы S3Queue',
    `file_name` String COMMENT 'Имя файла обрабатываемого файла',
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
COMMENT 'Содержит записи логирования с информацией о файлах, обработанных движком S3Queue.'

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
