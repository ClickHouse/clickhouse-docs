---
description: 'Log 引擎系列文档'
sidebar_label: 'Log 引擎系列'
sidebar_position: 20
slug: /engines/table-engines/log-family/
title: 'Log 引擎系列'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Log 表引擎系列 \\{#log-table-engine-family\\}

<CloudNotSupportedBadge/>

这些引擎适用于这样一种场景：需要快速写入大量小表（单表最多约 100 万行），并在之后整体读取它们。

该系列中的引擎：

| Log 引擎                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 系列表引擎可以将数据存储到 [HDFS](/engines/table-engines/integrations/hdfs) 或 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 分布式文件系统中。

:::warning 此引擎并非用于日志数据。
尽管名称如此，*Log 表引擎并非用于存储日志数据。它们应仅用于需要快速写入的小规模数据量。*
:::

## 通用属性 \\{#common-properties\\}

这些引擎：

- 将数据存储在磁盘上。

- 在写入时将数据追加到文件末尾。

- 支持用于并发数据访问的锁。

    在执行 `INSERT` 查询时，表会被锁定，其他读写数据的查询都会等待表解锁。如果没有数据写入查询在执行，则可以并发执行任意数量的数据读取查询。

- 不支持[变更](/sql-reference/statements/alter#mutations)。

- 不支持索引。

    这意味着针对数据范围的 `SELECT` 查询效率不高。

- 不以原子方式写入数据。

    如果写入操作被中断（例如服务器异常关闭），则可能会得到一个数据损坏的表。

## 差异 \\{#differences\\}

`TinyLog` 引擎是该系列中最简单的一个，提供的功能最少、效率也最低。`TinyLog` 引擎不支持在单个查询中由多个线程并行读取数据。与该系列中支持在单个查询中并行读取的其他引擎相比，它读取数据的速度更慢，并且由于将每一列存储在单独的文件中，它使用的文件描述符几乎与 `Log` 引擎一样多。应仅在简单场景中使用它。

`Log` 和 `StripeLog` 引擎支持数据的并行读取。在读取数据时，ClickHouse 会使用多个线程。每个线程处理单独的数据块。`Log` 引擎为表的每一列使用单独的文件，而 `StripeLog` 将所有数据存储在一个文件中。因此，`StripeLog` 引擎使用更少的文件描述符，但在读取数据时，`Log` 引擎的效率更高。
