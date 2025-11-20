---
title: '向 ClickHouse 插入数据'
description: '如何向 ClickHouse 插入数据'
keywords: ['INSERT', 'Batch Insert']
sidebar_label: '向 ClickHouse 插入数据'
slug: /guides/inserting-data
show_related_blogs: true
doc_type: 'guide'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';


## ClickHouse 与 OLTP 数据库的数据插入对比 {#inserting-into-clickhouse-vs-oltp-databases}

作为一个 OLAP(在线分析处理)数据库,ClickHouse 针对高性能和可扩展性进行了优化,每秒可插入数百万行数据。
这是通过高度并行化的架构和高效的列式压缩相结合来实现的,但在即时一致性方面做出了权衡。
更具体地说,ClickHouse 针对仅追加操作进行了优化,仅提供最终一致性保证。

相比之下,OLTP 数据库(如 Postgres)专门针对事务性插入进行了优化,完全符合 ACID 特性,确保强一致性和可靠性保证。
PostgreSQL 使用 MVCC(多版本并发控制)来处理并发事务,这涉及维护数据的多个版本。
这些事务每次可能只涉及少量行,由于可靠性保证而产生的相当大的开销会限制插入性能。

为了在向 ClickHouse 插入数据时实现高插入性能,同时保持强一致性保证,用户应遵循下面描述的简单规则。
遵循这些规则将有助于避免用户首次使用 ClickHouse 时常见的问题,以及避免尝试复制适用于 OLTP 数据库的插入策略。


## 插入的最佳实践 {#best-practices-for-inserts}

### 使用大批量插入 {#insert-in-large-batch-sizes}

默认情况下，向 ClickHouse 发送的每个插入操作都会导致 ClickHouse 立即创建一个存储部分，其中包含该插入的数据以及其他需要存储的元数据。
因此，与发送较多数量但每个包含较少数据的插入操作相比，发送较少数量但每个包含更多数据的插入操作将减少所需的写入次数。
通常，我们建议使用相当大的批次插入数据，每次至少 1,000 行，理想情况下为 10,000 到 100,000 行。
（更多详情请见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果无法使用大批量，则可使用下面所述的异步插入。

### 为幂等重试确保批次一致性 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 的插入操作是同步且幂等的（也就是说，多次执行相同的插入操作与执行一次的效果相同）。
对于 MergeTree 引擎家族的表，ClickHouse 默认会自动[对插入进行去重](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着插入操作在以下情况下仍具有可靠性：

- 1. 如果接收数据的节点出现问题，插入查询将超时（或返回更具体的错误），且不会收到确认。
- 2. 如果节点已将数据写入，但由于网络中断无法将确认返回给查询发送方，则发送方将收到超时或网络错误。

从客户端的角度来看，(1) 和 (2) 可能难以区分。不过，在两种情况下，未确认的插入操作都可以立即重试。
只要重试的插入查询包含相同顺序的相同数据，如果（未确认的）原始插入已成功，ClickHouse 将自动忽略该重试插入。

### 插入到 MergeTree 表或分布式表 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接插入到 MergeTree（或 Replicated 表）中，如果数据已分片，则在节点集合之间平衡请求，并设置 `internal_replication=true`。
这样，ClickHouse 将负责将数据复制到任何可用的副本分片，并确保数据最终一致。

如果客户端负载均衡操作不便，用户可以通过[分布式表](/engines/table-engines/special/distributed)进行插入，该表会将写入分发到各个节点。同样，建议设置 `internal_replication=true`。
不过，需要注意的是，这种方法性能略低，因为写入必须先在本地（即具有分布式表的节点）执行，然后再发送到分片。

### 为小批量使用异步插入 {#use-asynchronous-inserts-for-small-batches}

在某些场景中，客户端批处理不可行，例如在可观测性用例中，有数百或数千个专用代理发送日志、指标、跟踪等数据。
在这种场景下，数据的实时传输是尽可能快速检测问题和异常的关键。
此外，被观察系统可能出现事件峰值，这在客户端尝试缓冲可观测性数据时，可能导致内存大幅激增及相关问题。
如果无法插入大批量，用户可以使用[异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)将批处理委托给 ClickHouse。

使用异步插入时，数据首先插入到缓冲区，然后通过以下 3 个步骤稍后写入数据库存储，如下面的图所示：

<Image img={postgres_inserts} size='md' alt='插入操作' />

启用异步插入后，ClickHouse：

(1) 异步接收插入查询。
(2) 首先将查询的数据写入内存缓冲区。
(3) 仅在下一次缓冲区刷新时，才对数据进行排序并将其作为部分写入数据库存储。

在缓冲区刷新之前，可以在缓冲区中收集来自同一或其他客户端的其他异步插入查询的数据。
从缓冲区刷新创建的部分可能包含多个异步插入查询的数据。
通常，这些机制将数据的批处理从客户端侧转移到服务器侧（ClickHouse 实例）。

:::note
注意，在数据刷新到数据库存储之前，该数据无法通过查询进行搜索，并且缓冲区刷新是可配置的。


有关配置异步插入的完整详细信息,请参阅[此处](/optimize/asynchronous-inserts#enabling-asynchronous-inserts),深入探讨请参阅[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
:::

### 使用官方 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 为最流行的编程语言提供了客户端。
这些客户端经过优化以确保正确执行插入操作,并原生支持异步插入,既可以直接支持(例如 [Go 客户端](/integrations/go#async-insert)),也可以在查询、用户或连接级别设置中启用时间接支持。

有关可用 ClickHouse 客户端和驱动程序的完整列表,请参阅[客户端和驱动程序](/interfaces/cli)。

### 优先使用 Native 格式 {#prefer-the-native-format}

ClickHouse 在插入(和查询)时支持多种[输入格式](/interfaces/formats)。
这是与 OLTP 数据库的一个显著区别,使得从外部源加载数据变得更加容易——尤其是与[表函数](/sql-reference/table-functions)以及从磁盘文件加载数据的能力结合使用时。
这些格式非常适合临时数据加载和数据工程任务。

对于希望实现最佳插入性能的应用程序,用户应使用 [Native](/interfaces/formats/Native) 格式进行插入。
大多数客户端(如 Go 和 Python)都支持此格式,并且由于该格式本身就是列式的,因此可以确保服务器只需执行最少的工作量。
这样做将数据转换为列式格式的责任转移到了客户端。这对于高效扩展插入操作非常重要。

或者,如果首选行格式,用户可以使用 [RowBinary 格式](/interfaces/formats/RowBinary)(Java 客户端使用的格式)——这通常比 Native 格式更容易编写。
在压缩、网络开销和服务器处理方面,该格式比其他行格式(如 [JSON](/interfaces/formats/JSON))更高效。
对于写入吞吐量较低且希望快速集成的用户,可以考虑使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户应注意,该格式会在 ClickHouse 中产生解析的 CPU 开销。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同,ClickHouse 支持 HTTP 接口。
用户可以使用上述任何格式通过该接口插入和查询数据。
这通常优于 ClickHouse 的原生协议,因为它允许通过负载均衡器轻松切换流量。
我们预计与原生协议相比,插入性能差异很小,原生协议的开销略低一些。
现有客户端使用这两种协议中的任意一种(在某些情况下两者都使用,例如 Go 客户端)。
原生协议确实允许轻松跟踪查询进度。

有关更多详细信息,请参阅 [HTTP 接口](/interfaces/http)。


## 基本示例 {#basic-example}

您可以在 ClickHouse 中使用熟悉的 `INSERT INTO TABLE` 命令。让我们向入门指南["在 ClickHouse 中创建表"](./creating-tables)中创建的表插入一些数据。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

为了验证插入是否成功,我们将运行以下 `SELECT` 查询:

```sql
SELECT * FROM helloworld.my_first_table
```

返回结果:

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```


## 从 Postgres 加载数据 {#loading-data-from-postgres}

从 Postgres 加载数据时,用户可以使用:

- `ClickPipes`,一个专为 PostgreSQL 数据库复制设计的 ETL 工具。该工具在以下两种环境中均可使用:
  - ClickHouse Cloud - 通过 ClickPipes 中的[托管摄取服务](/integrations/clickpipes/postgres)提供。
  - 自托管 - 通过 [PeerDB 开源项目](https://github.com/PeerDB-io/peerdb)提供。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine),可以像前面示例中展示的那样直接读取数据。当基于已知水位线(例如时间戳)的批量复制足以满足需求,或者只是一次性迁移时,通常适合使用此方法。这种方法可以扩展到数千万行数据。对于需要迁移更大数据集的用户,应考虑使用多个请求,每个请求处理一部分数据。可以为每个数据块使用暂存表,然后再将其分区移动到最终表中。这样可以在请求失败时进行重试。有关此批量加载策略的更多详细信息,请参见此处。
- 可以将数据从 PostgreSQL 导出为 CSV 格式。然后可以使用表函数从本地文件或通过对象存储将其插入到 ClickHouse 中。

:::note 需要帮助插入大型数据集?
如果您在插入大型数据集时需要帮助,或在将数据导入 ClickHouse Cloud 时遇到任何错误,请通过 support@clickhouse.com 联系我们,我们将为您提供协助。
:::


## 从命令行插入数据 {#inserting-data-from-command-line}

**前提条件**

- 您已[安装](/install) ClickHouse
- `clickhouse-server` 正在运行
- 您可以访问具有 `wget`、`zcat` 和 `curl` 的终端

在本示例中,您将学习如何使用批处理模式的 clickhouse-client 从命令行将 CSV 文件插入 ClickHouse。有关使用批处理模式的 clickhouse-client 通过命令行插入数据的更多信息和示例,请参阅["批处理模式"](/interfaces/cli#batch-mode)。

本示例将使用 [Hacker News 数据集](/getting-started/example-datasets/hacker-news),其中包含 2800 万行 Hacker News 数据。

<VerticalStepper headerLevel="h3">
    
### 下载 CSV 文件 {#download-csv}

运行以下命令从我们的公共 S3 存储桶下载数据集的 CSV 版本:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

该压缩文件大小为 4.6GB,包含 2800 万行数据,下载时间约为 5-10 分钟。

### 创建表 {#create-table}

在 `clickhouse-server` 运行的情况下,您可以使用批处理模式的 `clickhouse-client` 直接从命令行创建具有以下模式的空表:

```bash
clickhouse-client <<'_EOF'
CREATE TABLE hackernews(
    `id` UInt32,
    `deleted` UInt8,
    `type` Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `text` String,
    `dead` UInt8,
    `parent` UInt32,
    `poll` UInt32,
    `kids` Array(UInt32),
    `url` String,
    `score` Int32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` Int32
)
ENGINE = MergeTree
ORDER BY id
_EOF
```

如果没有错误,则表已成功创建。在上述命令中,heredoc 分隔符(`_EOF`)周围使用单引号以防止任何插值。如果不使用单引号,则需要对列名周围的反引号进行转义。

### 从命令行插入数据 {#insert-data-via-cmd}

接下来运行以下命令,将您之前下载的文件中的数据插入到表中:

```bash
zcat < hacknernews.csv.gz | ./clickhouse client --query "INSERT INTO hackernews FORMAT CSV"
```

由于我们的数据是压缩的,因此需要首先使用 `gzip`、`zcat` 或类似工具解压缩文件,然后使用适当的 `INSERT` 语句和 `FORMAT` 将解压缩的数据通过管道传输到 `clickhouse-client`。

:::note
在交互模式下使用 clickhouse-client 插入数据时,可以使用 `COMPRESSION` 子句让 ClickHouse 在插入时为您处理解压缩。ClickHouse 可以从文件扩展名自动检测压缩类型,但您也可以显式指定。

插入查询如下所示:

```bash
clickhouse-client --query "INSERT INTO hackernews FROM INFILE 'hacknernews.csv.gz' COMPRESSION 'gzip' FORMAT CSV;"
```

:::

数据插入完成后,您可以运行以下命令查看 `hackernews` 表中的行数:

```bash
clickhouse-client --query "SELECT formatReadableQuantity(count(*)) FROM hackernews"
28.74 million
```

### 使用 curl 通过命令行插入数据 {#insert-using-curl}

在前面的步骤中,您首先使用 `wget` 将 csv 文件下载到本地计算机。也可以使用单个命令直接从远程 URL 插入数据。

运行以下命令清空 `hackernews` 表中的数据,以便您可以再次插入数据而无需下载到本地计算机的中间步骤:

```bash
clickhouse-client --query "TRUNCATE hackernews"
```

现在运行:

```bash
curl https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz | zcat | clickhouse-client --query "INSERT INTO hackernews FORMAT CSV"
```

您现在可以运行与之前相同的命令来验证数据是否再次插入:

```bash
clickhouse-client --query "SELECT formatReadableQuantity(count(*)) FROM hackernews"
28.74 million
```

</VerticalStepper>
