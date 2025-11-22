---
description: '表引擎相关文档'
slug: /engines/table-engines/
toc_folder_title: '表引擎'
toc_priority: 26
toc_title: '简介'
title: '表引擎'
doc_type: 'reference'
---



# 表引擎

表引擎（表的类型）决定了：

- 数据如何以及在何处存储、写入和读取。
- 支持哪些查询，以及如何支持。
- 并发访问数据的方式。
- 索引（如果存在）的使用方式。
- 是否支持多线程执行请求。
- 数据复制参数。



## 引擎系列 {#engine-families}

### MergeTree {#mergetree}

适用于高负载任务的最通用且功能最强大的表引擎。这些引擎的共同特点是支持快速数据插入和后续的后台数据处理。`MergeTree` 系列引擎支持数据复制(通过引擎的 [Replicated\*](/engines/table-engines/mergetree-family/replication) 版本)、分区、辅助数据跳过索引以及其他引擎不支持的功能。

该系列中的引擎:

| MergeTree 引擎                                                                                    |
| ---------------------------------------------------------------------------------------------------- |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                       |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                     |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                         |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                 |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)                   |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                       |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                   |

### Log {#log}

具有最小功能的轻量级[引擎](../../engines/table-engines/log-family/index.md)。当需要快速写入大量小表(最多约 100 万行)并随后整体读取时,这些引擎最为有效。

该系列中的引擎:

| Log 引擎                                              |
| -------------------------------------------------------- |
| [TinyLog](/engines/table-engines/log-family/tinylog)     |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)             |

### 集成引擎 {#integration-engines}

用于与其他数据存储和处理系统通信的引擎。

该系列中的引擎:

| 集成引擎                                                             |
| ------------------------------------------------------------------------------- |
| [ODBC](../../engines/table-engines/integrations/odbc.md)                        |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                        |
| [MySQL](../../engines/table-engines/integrations/mysql.md)                      |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)                  |
| [Redis](../../engines/table-engines/integrations/redis.md)                      |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                        |
| [S3](../../engines/table-engines/integrations/s3.md)                            |
| [Kafka](../../engines/table-engines/integrations/kafka.md)                      |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)                |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)            |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)                  |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)           |

### 特殊引擎 {#special-engines}

该系列中的引擎:


| 特殊引擎                                               |
|---------------------------------------------------------------|
| [Distributed](/engines/table-engines/special/distributed)     |
| [Dictionary](/engines/table-engines/special/dictionary)       |
| [Merge](/engines/table-engines/special/merge)                 |
| [Executable](/engines/table-engines/special/executable)       |
| [File](/engines/table-engines/special/file)                   |
| [Null](/engines/table-engines/special/null)                   |
| [Set](/engines/table-engines/special/set)                     |
| [Join](/engines/table-engines/special/join)                   |
| [URL](/engines/table-engines/special/url)                     |
| [View](/engines/table-engines/special/view)                   |
| [Memory](/engines/table-engines/special/memory)               |
| [Buffer](/engines/table-engines/special/buffer)               |
| [External Data](/engines/table-engines/special/external-data) |
| [GenerateRandom](/engines/table-engines/special/generate)     |
| [KeeperMap](/engines/table-engines/special/keeper-map)        |
| [FileLog](/engines/table-engines/special/filelog)             |



## 虚拟列 {#table_engines-virtual_columns}

虚拟列是表引擎的内置属性,在引擎源代码中定义。

您不应在 `CREATE TABLE` 查询中指定虚拟列,在 `SHOW CREATE TABLE` 和 `DESCRIBE TABLE` 查询结果中也无法看到它们。虚拟列是只读的,因此无法向虚拟列插入数据。

要从虚拟列中查询数据,必须在 `SELECT` 查询中指定其名称。`SELECT *` 不会返回虚拟列的值。

如果创建的表中包含与表虚拟列同名的列,则该虚拟列将变得不可访问。我们不建议这样做。为避免冲突,虚拟列名称通常以下划线作为前缀。

- `_table` — 包含读取数据的表名称。类型:[String](../../sql-reference/data-types/string.md)。

  无论使用何种表引擎,每个表都包含一个名为 `_table` 的通用虚拟列。

  当查询使用 Merge 表引擎的表时,可以在 `WHERE/PREWHERE` 子句中对 `_table` 设置常量条件(例如 `WHERE _table='xyz'`)。在这种情况下,读取操作仅对满足 `_table` 条件的表执行,因此 `_table` 列起到索引的作用。

  当使用格式为 `SELECT ... FROM (... UNION ALL ...)` 的查询时,可以通过指定 `_table` 列来确定返回的行来自哪个实际表。
