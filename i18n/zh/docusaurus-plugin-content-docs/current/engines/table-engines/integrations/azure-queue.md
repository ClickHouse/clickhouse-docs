---
'description': 'This engine provides an integration with the Azure Blob Storage ecosystem,
  allowing streaming data import.'
'sidebar_label': 'AzureQueue'
'sidebar_position': 181
'slug': '/engines/table-engines/integrations/azure-queue'
'title': 'AzureQueue Table Engine'
---




# AzureQueue 表引擎

此引擎提供与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统的集成，允许进行流数据导入。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE test (name String, value UInt32)
    ENGINE = AzureQueue(...)
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    ...
```

**引擎参数**

`AzureQueue` 参数与 `AzureBlobStorage` 表引擎支持的参数相同。有关参数部分，请参见 [这里](../../../engines/table-engines/integrations/azureBlobStorage.md)。

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似，用户可以使用 Azurite 模拟器进行本地 Azure 存储开发。更多详细信息请参见 [这里](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。

**示例**

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS mode = 'unordered'
```

## 设置 {#settings}

支持的设置汇总与 `S3Queue` 表引擎相同，但不带 `s3queue_` 前缀。请参考 [完整的设置列表](../../../engines/table-engines/integrations/s3queue.md#settings)。
要获取为表配置的设置列表，请使用 `system.azure_queue_settings` 表。从 `24.10` 可用。

## 描述 {#description}

`SELECT` 对于流导入并没有特别的用途（除了调试），因为每个文件只能导入一次。创建实时线程使用 [物化视图](../../../sql-reference/statements/create/view.md) 更为实用。为此：

1. 使用引擎创建一个表以从 S3 中指定路径消费，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将引擎中的数据转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 连接引擎时，它开始在后台收集数据。

示例：

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

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。
- `_file` — 文件名。

有关虚拟列的更多信息，请参见 [这里](../../../engines/table-engines/index.md#table_engines-virtual_columns)。

## 内省 {#introspection}

通过表设置 `enable_logging_to_queue_log=1` 启用表的日志记录。

内省功能与 [S3Queue 表引擎](/engines/table-engines/integrations/s3queue#introspection) 相同，但有几个明显的区别：

1. 对于服务器版本 >= 25.1，使用 `system.azure_queue` 获取队列的内存状态。对于旧版本，使用 `system.s3queue`（它也将包含 `azure` 表的信息）。
2. 通过主 ClickHouse 配置启用 `system.azure_queue_log`，例如：

```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
```

此持久表具有与 `system.s3queue` 相同的信息，但针对已处理和失败的文件。

该表具有以下结构：

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Hostname',
    `event_date` Date COMMENT 'Event date of writing this log row',
    `event_time` DateTime COMMENT 'Event time of writing this log row',
    `database` String COMMENT 'The name of a database where current S3Queue table lives.',
    `table` String COMMENT 'The name of S3Queue table.',
    `uuid` String COMMENT 'The UUID of S3Queue table',
    `file_name` String COMMENT 'File name of the processing file',
    `rows_processed` UInt64 COMMENT 'Number of processed rows',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'Status of the processing file',
    `processing_start_time` Nullable(DateTime) COMMENT 'Time of the start of processing the file',
    `processing_end_time` Nullable(DateTime) COMMENT 'Time of the end of processing the file',
    `exception` String COMMENT 'Exception message if happened'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'Contains logging entries with the information files processes by S3Queue engine.'

```

示例：

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
