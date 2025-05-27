---
'description': 'Log Engine Family 的文档'
'sidebar_label': '日志系列'
'sidebar_position': 20
'slug': '/engines/table-engines/log-family/'
'title': '日志引擎系列'
---


# 日志引擎家族

这些引擎是针对需要快速写入许多小表（最多约100万行）并能够稍后整体读取它们的场景开发的。

家族引擎：

| 日志引擎                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 家族表引擎可以将数据存储到 [HDFS](/engines/table-engines/integrations/hdfs) 或 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 分布式文件系统中。

:::warning 此引擎不适用于日志数据。
尽管名称中包含 *Log，* 日志表引擎并不意味着用于存储日志数据。它们仅应在小规模数据需要快速写入的情况下使用。
:::

## 公共属性 {#common-properties}

引擎：

- 在磁盘上存储数据。

- 写入时将数据追加到文件末尾。

- 支持并发数据访问的锁。

    在 `INSERT` 查询期间，表被锁定，其他读取和写入数据的查询都等待表解锁。如果没有数据写入查询，则可以并发执行任意数量的数据读取查询。

- 不支持 [变更](/sql-reference/statements/alter#mutations)。

- 不支持索引。

    这意味着对数据范围的 `SELECT` 查询效率不高。

- 不以原子方式写入数据。

    如果写入操作被打断，例如服务器异常关闭，则可能会得到一个包含损坏数据的表。

## 区别 {#differences}

`TinyLog` 引擎是家族中最简单的，提供的功能最少，效率最低。`TinyLog` 引擎不支持多个线程在单个查询中并行读取数据。它的读取速度比其他支持单个查询并行读取的家族引擎慢，并且使用的文件描述符几乎与 `Log` 引擎一样多，因为它在单独的文件中存储每一列。仅在简单的场景中使用它。

`Log` 和 `StripeLog` 引擎支持并行数据读取。在读取数据时，ClickHouse 使用多个线程。每个线程处理一个独立的数据块。`Log` 引擎为表的每一列使用一个单独的文件。`StripeLog` 将所有数据存储在一个文件中。结果是，`StripeLog` 引擎使用的文件描述符更少，但在读取数据时，`Log` 引擎提供更高的效率。
