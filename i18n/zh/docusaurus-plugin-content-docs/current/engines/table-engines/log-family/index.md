---
'description': 'Log Engine Family 的文档'
'sidebar_label': '日志家族'
'sidebar_position': 20
'slug': '/engines/table-engines/log-family/'
'title': '日志引擎家族'
'doc_type': 'guide'
---


# Log engine family

这些引擎是为需要快速写入许多小表（大约 100 万行）并在稍后将其整体读取的场景而开发的。

该系列的引擎：

| Log Engines                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 系列表引擎可以将数据存储到 [HDFS](/engines/table-engines/integrations/hdfs) 或 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 分布式文件系统中。

:::warning 此引擎不适合用于日志数据。
尽管名称中带有 *Log，表引擎并不适合存储日志数据。它们只能用于需要快速写入的小容量数据。
:::

## Common properties {#common-properties}

引擎：

- 将数据存储在磁盘上。

- 在写入时将数据附加到文件末尾。

- 支持并发数据访问的锁。

    在 `INSERT` 查询期间，表会被锁定，其他读取和写入数据的查询都在等待表解锁。如果没有数据写入查询，则可以同时执行任意数量的数据读取查询。

- 不支持 [mutations](/sql-reference/statements/alter#mutations)。

- 不支持索引。

    这意味着对数据范围的 `SELECT` 查询效率不高。

- 不按原子方式写入数据。

    如果某些操作中断了写入操作，例如异常服务器关闭，您可能会得到一个具有损坏数据的表。

## Differences {#differences}

`TinyLog` 引擎是该系列中最简单的，功能最差，效率最低。`TinyLog` 引擎不支持单个查询中多个线程的并行数据读取。它的读取速度比支持单个查询并行读取的该系列其他引擎慢，而且由于将每列存储在单独的文件中，它几乎使用了与 `Log` 引擎相同数量的文件描述符。仅在简单场景中使用它。

`Log` 和 `StripeLog` 引擎支持并行数据读取。在读取数据时，ClickHouse 使用多个线程。每个线程处理一个单独的数据块。`Log` 引擎为表的每一列使用一个单独的文件，而 `StripeLog` 将所有数据存储在一个文件中。因此，`StripeLog` 引擎使用的文件描述符较少，但在读取数据时，`Log` 引擎提供了更高的效率。
