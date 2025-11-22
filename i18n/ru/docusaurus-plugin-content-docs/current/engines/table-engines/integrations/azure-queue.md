---
description: 'Этот движок обеспечивает интеграцию с экосистемой Azure Blob Storage,
  позволяя выполнять потоковый импорт данных.'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'Табличный движок AzureQueue'
doc_type: 'reference'
---



# Движок таблицы AzureQueue

Этот движок обеспечивает интеграцию с экосистемой [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs), позволяя выполнять потоковую загрузку данных.



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

Параметры `AzureQueue` совпадают с параметрами движка таблиц `AzureBlobStorage`. См. описание параметров [здесь](../../../engines/table-engines/integrations/azureBlobStorage.md).

Аналогично движку таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), можно использовать эмулятор Azurite для локальной разработки с Azure Storage. Подробнее [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage).

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

Набор поддерживаемых настроек совпадает с настройками движка таблиц `S3Queue`, но без префикса `s3queue_`. См. [полный список настроек](../../../engines/table-engines/integrations/s3queue.md#settings).
Чтобы получить список настроек, настроенных для таблицы, используйте таблицу `system.azure_queue_settings`. Доступно начиная с версии `24.10`.


## Description {#description}

`SELECT` не особенно полезен для потоковой загрузки данных (за исключением отладки), поскольку каждый файл может быть импортирован только один раз. Более практичным является создание потоков обработки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания таблицы, которая будет получать данные из указанного пути в S3, и рассматривайте её как поток данных.
2.  Создайте таблицу с требуемой структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, оно начинает собирать данные в фоновом режиме.

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

- `_path` — Путь к файлу.
- `_file` — Имя файла.

Подробнее о виртуальных столбцах см. [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).


## Интроспекция {#introspection}

Включите логирование для таблицы с помощью настройки таблицы `enable_logging_to_queue_log=1`.

Возможности интроспекции аналогичны [движку таблиц S3Queue](/engines/table-engines/integrations/s3queue#introspection) с несколькими существенными отличиями:

1. Используйте `system.azure_queue` для хранения состояния очереди в памяти для версий сервера >= 25.1. Для более старых версий используйте `system.s3queue` (она также будет содержать информацию для таблиц `azure`).
2. Включите `system.azure_queue_log` через основной конфигурационный файл ClickHouse, например:

```xml
<azure_queue_log>
  <database>system</database>
  <table>azure_queue_log</table>
</azure_queue_log>
```

Эта персистентная таблица содержит ту же информацию, что и `system.s3queue`, но для обработанных и неудачно обработанных файлов.

Таблица имеет следующую структуру:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Имя хоста',
    `event_date` Date COMMENT 'Дата события записи этой строки лога',
    `event_time` DateTime COMMENT 'Время события записи этой строки лога',
    `database` String COMMENT 'Имя базы данных, в которой находится текущая таблица S3Queue.',
    `table` String COMMENT 'Имя таблицы S3Queue.',
    `uuid` String COMMENT 'UUID таблицы S3Queue',
    `file_name` String COMMENT 'Имя обрабатываемого файла',
    `rows_processed` UInt64 COMMENT 'Количество обработанных строк',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'Статус обработки файла',
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
