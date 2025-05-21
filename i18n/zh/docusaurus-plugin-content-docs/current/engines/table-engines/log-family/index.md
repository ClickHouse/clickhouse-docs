---
'description': 'Log Engine Family 文档'
'sidebar_label': '日志系列'
'sidebar_position': 20
'slug': '/engines/table-engines/log-family/'
'title': '日志引擎系列'
---




# 日志引擎家族

这些引擎是为需要快速写入许多小表（最多约100万行）并之后整体读取的场景而开发的。

家族中的引擎：

| 日志引擎                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 家族的表引擎可以将数据存储到 [HDFS](/engines/table-engines/integrations/hdfs) 或 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 分布式文件系统中。

:::warning 此引擎不适用于日志数据。
尽管名称中带有“Log”，*Log 表引擎并不适合用于存储日志数据。它们仅适用于需要快速写入的小数据量。
:::

## 常见属性 {#common-properties}

引擎：

- 在磁盘上存储数据。

- 写入时将数据附加到文件末尾。

- 支持并发数据访问的锁。

    在 `INSERT` 查询期间，表被锁定，其他读取和写入数据的查询都在等待表解锁。如果没有数据写入查询，可以并发执行任意数量的数据读取查询。

- 不支持 [mutations](/sql-reference/statements/alter#mutations)。

- 不支持索引。

    这意味着 `SELECT` 查询在数据范围上的效率不高。

- 不以原子方式写入数据。

    如果写入操作被破坏，比如服务器异常关闭，可能会得到一个包含损坏数据的表。

## 区别 {#differences}

`TinyLog` 引擎是家族中最简单的，功能最差，效率最低。`TinyLog` 引擎不支持在单次查询中多个线程的并行数据读取。它的读取速度比其他支持从单次查询并行读取的家族引擎慢，并且因为每列存储在单独的文件中，它几乎使用了与 `Log` 引擎相同数量的文件描述符。仅在简单场景中使用它。

`Log` 和 `StripeLog` 引擎支持并行数据读取。在读取数据时，ClickHouse 使用多个线程。每个线程处理一个独立的数据块。`Log` 引擎为表的每列使用一个独立的文件。`StripeLog` 将所有数据存储在一个文件中。因此，`StripeLog` 引擎使用较少的文件描述符，但在读取数据时，`Log` 引擎提供了更高的效率。
