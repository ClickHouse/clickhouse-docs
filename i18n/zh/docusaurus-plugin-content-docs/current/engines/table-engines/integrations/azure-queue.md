---
description: '该引擎提供与 Azure Blob Storage 生态系统的集成，支持流式数据导入。'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'AzureQueue 表引擎'
doc_type: 'reference'
---



# AzureQueue 表引擎

此引擎提供与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统的集成，支持流式数据导入。



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

`AzureQueue` 的参数与 `AzureBlobStorage` 表引擎支持的参数相同。参数说明请参见[此处](../../../engines/table-engines/integrations/azureBlobStorage.md)。

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似,用户可以使用 Azurite 模拟器进行本地 Azure Storage 开发。更多详细信息请参见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。

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

支持的设置集与 `S3Queue` 表引擎相同,但不带 `s3queue_` 前缀。请参阅[完整设置列表](../../../engines/table-engines/integrations/s3queue.md#settings)。
要获取表的配置设置列表,请使用 `system.azure_queue_settings` 表。此功能从 `24.10` 版本开始提供。


## Description {#description}

`SELECT` 对于流式导入并不特别有用(除了调试场景),因为每个文件只能导入一次。更实用的做法是使用[物化视图](../../../sql-reference/statements/create/view.md)创建实时处理流程。操作步骤如下:

1.  使用该引擎创建一个表,用于从 S3 指定路径消费数据,并将其视为数据流。
2.  创建一个具有所需结构的目标表。
3.  创建一个物化视图,将引擎中的数据进行转换并写入之前创建的表中。

当 `MATERIALIZED VIEW` 关联到引擎后,它会在后台开始收集数据。

示例:

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

- `_path` — 文件的路径。
- `_file` — 文件的名称。

有关虚拟列的更多信息，请参阅[此处](../../../engines/table-engines/index.md#table_engines-virtual_columns)。


## 内省 {#introspection}

通过表设置 `enable_logging_to_queue_log=1` 为表启用日志记录。

内省功能与 [S3Queue 表引擎](/engines/table-engines/integrations/s3queue#introspection) 相同,但存在以下几个明显差异:

1. 对于服务器版本 >= 25.1,使用 `system.azure_queue` 查看队列的内存状态。对于旧版本,使用 `system.s3queue`(它也包含 `azure` 表的信息)。
2. 通过 ClickHouse 主配置文件启用 `system.azure_queue_log`,例如:

```xml
<azure_queue_log>
  <database>system</database>
  <table>azure_queue_log</table>
</azure_queue_log>
```

此持久化表包含与 `system.s3queue` 相同的信息,但针对已处理和失败的文件。

该表具有以下结构:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT '主机名',
    `event_date` Date COMMENT '写入此日志行的事件日期',
    `event_time` DateTime COMMENT '写入此日志行的事件时间',
    `database` String COMMENT '当前 S3Queue 表所在的数据库名称。',
    `table` String COMMENT 'S3Queue 表的名称。',
    `uuid` String COMMENT 'S3Queue 表的 UUID',
    `file_name` String COMMENT '正在处理的文件名',
    `rows_processed` UInt64 COMMENT '已处理的行数',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT '文件处理状态',
    `processing_start_time` Nullable(DateTime) COMMENT '文件处理开始时间',
    `processing_end_time` Nullable(DateTime) COMMENT '文件处理结束时间',
    `exception` String COMMENT '发生异常时的异常消息'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT '包含 S3Queue 引擎处理文件信息的日志条目。'

```

示例:

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
