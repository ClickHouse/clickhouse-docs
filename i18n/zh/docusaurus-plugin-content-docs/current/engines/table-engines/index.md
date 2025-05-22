---
'description': '表引擎的文档'
'slug': '/engines/table-engines/'
'toc_folder_title': 'Table Engines'
'toc_priority': 26
'toc_title': 'Introduction'
'title': '表引擎'
---


# 表引擎

表引擎（表的类型）决定了：

- 数据的存储方式和存储位置，数据的写入和读取位置。
- 支持哪些查询，以及如何支持。
- 并发的数据访问。
- 索引的使用（如果存在的话）。
- 是否可以执行多线程请求。
- 数据复制的参数。

## 引擎系列 {#engine-families}

### MergeTree {#mergetree}

用于高负载任务的最通用和功能丰富的表引擎。这些引擎的共同点是快速的数据插入以及随后的后台数据处理。`MergeTree`系列引擎支持数据复制（具有 [Replicated\*](/engines/table-engines/mergetree-family/replication) 的版本）、分区、二级数据跳过索引和其他在其他引擎中不支持的功能。

该系列的引擎：

| MergeTree 引擎                                                                                                                     |
|------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                        |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                                 |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                   |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                       |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                    |

### Log {#log}

轻量级的 [引擎](../../engines/table-engines/log-family/index.md)，功能最少。在需要快速写入许多小表（最多大约 100 万行）并稍后作为整体读取时，它们是最有效的。

该系列的引擎：

| Log 引擎                                                                |
|--------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 集成引擎 {#integration-engines}

用于与其他数据存储和处理系统进行通信的引擎。

该系列的引擎：

| 集成引擎                                                               |
|-------------------------------------------------------------------------|
| [ODBC](../../engines/table-engines/integrations/odbc.md)                |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                |
| [MySQL](../../engines/table-engines/integrations/mysql.md)              |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)          |
| [Redis](../../engines/table-engines/integrations/redis.md)              |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                |
| [S3](../../engines/table-engines/integrations/s3.md)                    |
| [Kafka](../../engines/table-engines/integrations/kafka.md)              |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)        |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)    |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)          |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)    |

### 特殊引擎 {#special-engines}

该系列的引擎：

| 特殊引擎                                               |
|--------------------------------------------------------|
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

虚拟列是一个表引擎属性，在引擎源代码中定义。

您不应在 `CREATE TABLE` 查询中指定虚拟列，且在 `SHOW CREATE TABLE` 和 `DESCRIBE TABLE` 查询结果中看不到它们。虚拟列也是只读的，因此无法向虚拟列插入数据。

要从虚拟列中选择数据，必须在 `SELECT` 查询中指定其名称。`SELECT *` 不会返回虚拟列的值。

如果您创建一个包含与表虚拟列同名的列的表，则该虚拟列将无法访问。我们不建议这样做。为了帮助避免冲突，虚拟列名称通常以下划线开头。
