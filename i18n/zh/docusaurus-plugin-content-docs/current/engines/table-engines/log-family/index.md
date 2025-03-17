---
slug: /engines/table-engines/log-family/
sidebar_position: 20
sidebar_label:  日志引擎家族
---


# 日志引擎家族

这些引擎是为需要快速写入多个小表（最多约 100 万行）并在以后整体读取它们的场景而开发的。

该家族的引擎：

| 日志引擎                                                       |
|---------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 家族的表引擎可以将数据存储到 [HDFS](/engines/table-engines/integrations/hdfs) 或 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 分布式文件系统中。

:::warning 该引擎不适合日志数据。
尽管名称包含“日志”，*日志表引擎并不用于存储日志数据。它们只能用于需要快速写入的小规模数据。
:::

## 常见属性 {#common-properties}

引擎：

- 将数据存储在磁盘上。

- 写入时将数据追加到文件末尾。

- 支持并发数据访问的锁。

    在 `INSERT` 查询期间，表被锁定，其他读写数据的查询都在等待表解锁。如果没有数据写入查询，任何数量的数据读取查询都可以同时进行。

- 不支持 [mutation](/sql-reference/statements/alter#mutations)。

- 不支持索引。

    这意味着对数据范围的 `SELECT` 查询效率较低。

- 不以原子方式写入数据。

    如果写入操作出现中断，例如服务器异常关闭，您可能会获得一个包含损坏数据的表。

## 区别 {#differences}

`TinyLog` 引擎是该家族中最简单的，提供的功能最少，效率最低。`TinyLog` 引擎不支持单个查询中多个线程的并行数据读取。它读取数据的速度比其他支持并行读取的家族引擎慢，并且它使用的文件描述符几乎与 `Log` 引擎一样多，因为它将每列存储在单独的文件中。仅在简单场景中使用它。

`Log` 和 `StripeLog` 引擎支持并行数据读取。在读取数据时，ClickHouse 使用多个线程。每个线程处理一个单独的数据块。`Log` 引擎为表的每一列使用一个单独的文件，而 `StripeLog` 将所有数据存储在一个文件中。因此，`StripeLog` 引擎使用的文件描述符较少，但 `Log` 引擎在读取数据时提供更高的效率。
