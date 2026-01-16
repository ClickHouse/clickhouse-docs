---
description: '表引擎文档'
slug: /engines/table-engines/
toc_folder_title: '表引擎'
toc_priority: 26
toc_title: '简介'
title: '表引擎'
doc_type: 'reference'
---

# 表引擎 \\{#table-engines\\}

表引擎（表的类型）决定：

- 数据存储在何处以及以何种方式存储、写入到哪里以及从哪里读取。
- 支持哪些查询，以及具体如何执行这些查询。
- 并发访问数据的方式。
- 是否以及如何使用索引（如果存在）。
- 是否可以进行多线程的请求执行。
- 数据复制的相关参数。

## 引擎家族 \\{#engine-families\\}

### MergeTree \\{#mergetree\\}

用于高负载任务的最通用且功能最全面的表引擎。这些引擎的共同特性是支持快速写入数据，并在后台对数据进行后续处理。`MergeTree` 系列引擎支持数据复制（通过引擎的 [Replicated\*](/engines/table-engines/mergetree-family/replication) 版本）、分区、二级数据跳过索引，以及其他在其他引擎中不支持的特性。

该家族中的引擎：

| MergeTree 引擎                                                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                     |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                         |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                  |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                                     |

### Log \\{#log\\}

轻量级的 [引擎](../../engines/table-engines/log-family/index.md)，仅提供最基础的功能。当需要快速写入许多小表（最多约 100 万行），并在之后整体读取它们时，这些引擎最为高效。

该家族中的引擎：

| Log 引擎                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 集成引擎 \\{#integration-engines\\}

用于与其他数据存储和处理系统进行交互的引擎。

该家族中的引擎：

| 集成引擎                                                             |
|---------------------------------------------------------------------------------|
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

### 特殊引擎 \\{#special-engines\\}

该家族中的引擎：

| 特殊表引擎                                               |
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

## 虚拟列 \\{#table_engines-virtual_columns\\}

虚拟列是表引擎的内置属性，在引擎的源代码中定义。

不应在 `CREATE TABLE` 查询中指定虚拟列，并且在 `SHOW CREATE TABLE` 和 `DESCRIBE TABLE` 的查询结果中也看不到它们。虚拟列是只读的，因此无法向虚拟列中插入数据。

要从虚拟列中读取数据，必须在 `SELECT` 查询中显式指定其名称。`SELECT *` 不会返回虚拟列中的值。

如果在创建表时定义了一个与该表某个虚拟列同名的列，则该虚拟列将变得不可访问。不推荐这样做。为避免冲突，虚拟列名称通常会以下划线作为前缀。

- `_table` — 包含读取数据所在表的名称。类型：[String](../../sql-reference/data-types/string.md)。

    无论使用哪种表引擎，每个表都包含一个名为 `_table` 的通用虚拟列。

    在使用 Merge 表引擎查询表时，可以在 `WHERE/PREWHERE` 子句中对 `_table` 设置常量条件（例如，`WHERE _table='xyz'`）。在这种情况下，只会对满足 `_table` 条件的这些表执行读取操作，因此 `_table` 列在此处充当索引。

    当使用类似 `SELECT ... FROM (... UNION ALL ...)` 格式的查询时，可以通过指定 `_table` 列来确定返回的行来自哪个实际表。
