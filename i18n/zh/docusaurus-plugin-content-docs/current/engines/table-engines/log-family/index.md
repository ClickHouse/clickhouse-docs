---
description: 'Log 引擎系列的文档'
sidebar_label: 'Log 引擎系列'
sidebar_position: 20
slug: /engines/table-engines/log-family/
title: 'Log 引擎系列'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Log 表引擎族

<CloudNotSupportedBadge/>

这些引擎适用于需要非常快速地写入许多小表（最多约 100 万行），并在之后整体读取的场景。

该引擎族包括：

| Log 引擎                                                            |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 引擎族的表可以将数据存储到 [HDFS](/engines/table-engines/integrations/hdfs) 或 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 分布式文件系统中。

:::warning 该引擎不适用于日志数据。
尽管名称如此，*Log 表引擎并不是为了存储日志数据而设计的。它们只应用于需要快速写入的小规模数据量。*
:::



## 通用属性 {#common-properties}

引擎特性:

- 将数据存储在磁盘上。

- 写入时将数据追加到文件末尾。

- 支持并发数据访问的锁机制。

  在执行 `INSERT` 查询期间,表会被锁定,其他读取和写入数据的查询都需要等待表解锁。如果没有数据写入查询,可以并发执行任意数量的数据读取查询。

- 不支持 [mutations](/sql-reference/statements/alter#mutations)。

- 不支持索引。

  这意味着对数据范围执行 `SELECT` 查询的效率不高。

- 不支持原子性数据写入。

  如果写入操作中断(例如服务器异常关闭),可能会导致表数据损坏。


## 差异 {#differences}

`TinyLog` 引擎是该系列中最简单的引擎,功能最弱,效率最低。`TinyLog` 引擎不支持在单个查询中使用多个线程并行读取数据。它读取数据的速度比该系列中支持单查询并行读取的其他引擎慢,并且由于它将每列存储在单独的文件中,因此使用的文件描述符数量几乎与 `Log` 引擎一样多。仅在简单场景中使用。

`Log` 和 `StripeLog` 引擎支持并行数据读取。读取数据时,ClickHouse 使用多个线程。每个线程处理一个独立的数据块。`Log` 引擎为表的每列使用单独的文件。`StripeLog` 将所有数据存储在一个文件中。因此,`StripeLog` 引擎使用的文件描述符更少,但 `Log` 引擎在读取数据时效率更高。
