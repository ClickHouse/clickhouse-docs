---
description: 'Этот движок обеспечивает интеграцию с экосистемой Azure Blob Storage,
  позволяя выполнять потоковый импорт данных.'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'Табличный движок AzureQueue'
doc_type: 'reference'
---

# Табличный движок AzureQueue {#azurequeue-table-engine}

Этот движок обеспечивает интеграцию с экосистемой [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) и поддерживает потоковый импорт данных.

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

Параметры `AzureQueue` такие же, как у табличного движка `AzureBlobStorage`. См. раздел с параметрами [здесь](../../../engines/table-engines/integrations/azureBlobStorage.md).

Аналогично табличному движку [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки хранилища Azure. Дополнительные сведения см. [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage).

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

## Settings {#settings}

Набор поддерживаемых настроек в основном совпадает с настройками для движка таблиц `S3Queue`, но без префикса `s3queue_`. См. [полный список настроек](../../../engines/table-engines/integrations/s3queue.md#settings).
Чтобы получить список настроек, заданных для таблицы, используйте таблицу `system.azure_queue_settings`. Доступно начиная с версии 24.10.

Ниже приведены настройки, совместимые только с AzureQueue и не применимые к S3Queue.

### `after_processing_move_connection_string` {#after&#95;processing&#95;move&#95;connection&#95;string}

Строка подключения к Azure Blob Storage, в которую будут перемещаться успешно обработанные файлы, если в качестве назначения используется другой контейнер Azure.

Возможные значения:

* String.

Значение по умолчанию: пустая строка.

### `after_processing_move_container` {#after&#95;processing&#95;move&#95;container}

Имя контейнера, в который необходимо переместить успешно обработанные файлы, если целевым контейнером является другой контейнер Azure.

Возможные значения:

* Строка.

Значение по умолчанию: пустая строка.

Пример:

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_move_connection_string = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    after_processing_move_container = 'dst-container';
```

## Описание {#description}

`SELECT` не особенно полезен для потокового импорта (кроме отладки), потому что каждый файл можно импортировать только один раз. Гораздо практичнее создавать потоки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте табличный движок для создания таблицы, потребляющей данные из указанного пути в S3, и рассматривайте её как поток данных.
2. Создайте таблицу с требуемой структурой.
3. Создайте материализованное представление, которое преобразует данные из табличного движка и записывает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` связывается с табличным движком, оно начинает собирать данные в фоновом режиме.

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

## Виртуальные столбцы {#virtual-columns}

* `_path` — Путь к файлу.
* `_file` — Имя файла.

Дополнительные сведения о виртуальных столбцах см. [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).

## Интроспекция {#introspection}

Включите логирование для таблицы с помощью настройки таблицы `enable_logging_to_queue_log=1`.

Возможности интроспекции такие же, как у [движка таблиц S3Queue](/engines/table-engines/integrations/s3queue#introspection), с несколькими важными отличиями:

1. Используйте `system.azure_queue` для представления состояния очереди в памяти для версий сервера &gt;= 25.1. Для более старых версий используйте `system.s3queue` (он также будет содержать информацию для таблиц `azure`).
2. Включите `system.azure_queue_log` через основную конфигурацию ClickHouse, например:

```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
```

Эта постоянная таблица содержит ту же информацию, что и `system.s3queue`, но для обработанных и завершившихся ошибкой файлов.

Таблица имеет следующую структуру:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Имя хоста',
    `event_date` Date COMMENT 'Дата события записи данной строки журнала',
    `event_time` DateTime COMMENT 'Время события записи данной строки журнала',
    `database` String COMMENT 'Имя базы данных, в которой находится таблица S3Queue.',
    `table` String COMMENT 'Имя таблицы S3Queue.',
    `uuid` String COMMENT 'UUID таблицы S3Queue',
    `file_name` String COMMENT 'Имя обрабатываемого файла',
    `rows_processed` UInt64 COMMENT 'Количество обработанных строк',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'Статус обработки файла',
    `processing_start_time` Nullable(DateTime) COMMENT 'Время начала обработки файла',
    `processing_end_time` Nullable(DateTime) COMMENT 'Время завершения обработки файла',
    `exception` String COMMENT 'Сообщение об исключении при его возникновении'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'Содержит записи журнала с информацией о файлах, обработанных движком S3Queue.'

```

Пример:

```sql
SELECT *
FROM system.azure_queue_log
LIMIT 1
FORMAT Vertical

Строка 1:
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

Получена 1 строка. Затрачено: 0.002 сек.

```
