---
description: '此引擎提供与 Azure Blob Storage 生态系统的集成，支持流式数据导入。'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'AzureQueue 表引擎'
doc_type: 'reference'
---

# AzureQueue 表引擎

该引擎实现了与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统的集成，支持以流式方式导入数据。

## 创建表

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

`AzureQueue` 的参数与 `AzureBlobStorage` 表引擎支持的参数相同。请参阅[此处](../../../engines/table-engines/integrations/azureBlobStorage.md)中的参数部分。

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似，用户可以使用 Azurite 模拟器在本地进行 Azure Storage 开发。更多详细信息请参见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。

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


## Settings \{#settings\}

支持的设置大多与 `S3Queue` 表引擎相同，只是没有 `s3queue_` 前缀。参见[完整的设置列表](../../../engines/table-engines/integrations/s3queue.md#settings)。
要获取为该表配置的设置列表，请使用 `system.azure_queue_settings` 表。从 `24.10` 版本起可用。

下面是仅与 AzureQueue 兼容且不适用于 S3Queue 的设置。

### `after_processing_move_connection_string` \{#after_processing_move_connection_string\}

当目标是另一个 Azure 容器时，用于将已成功处理的文件移动到该容器的 Azure Blob Storage 连接字符串。

可能的取值：

- 字符串。

默认值：空字符串。

### `after_processing_move_container`

当目标是另一个 Azure 容器时，用于指定成功处理后文件要移动到的容器名称。

可能的取值：

* 字符串。

默认值：空字符串。

示例：

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


## 描述

`SELECT` 对于流式导入并不是特别有用（除非用于调试），因为每个文件只能被导入一次。更实际的做法是使用[物化视图](../../../sql-reference/statements/create/view.md)来创建实时管道。为此：

1. 使用该引擎创建一个从 S3 中指定路径消费数据的表，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将数据从该引擎转换后写入先前创建的表中。

当 `MATERIALIZED VIEW` 与该引擎关联后，它会开始在后台收集数据。

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


## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。
- `_file` — 文件名。

有关虚拟列的更多信息，请参阅[此处](../../../engines/table-engines/index.md#table_engines-virtual_columns)。

## 自省

通过表设置 `enable_logging_to_queue_log=1` 为该表启用日志记录。

自省功能与 [S3Queue 表引擎](/engines/table-engines/integrations/s3queue#introspection) 相同，但有以下几个明显差异：

1. 对于服务器版本 &gt;= 25.1，使用 `system.azure_queue` 表示队列的内存状态。对于更早的版本，使用 `system.s3queue`（其中也会包含 `azure` 表的信息）。
2. 在主 ClickHouse 配置中启用 `system.azure_queue_log`，例如：

```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
```

这个持久化表与 `system.s3queue` 表包含相同的信息，但记录的是已处理和失败的文件。

该表具有以下结构：

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
    `exception` String COMMENT '异常消息(如有发生)'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT '包含 S3Queue 引擎处理文件信息的日志条目。'

```

示例：

```sql
SELECT *
FROM system.azure_queue_log
LIMIT 1
FORMAT Vertical

第 1 行:
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

返回 1 行。用时:0.002 秒。

```
