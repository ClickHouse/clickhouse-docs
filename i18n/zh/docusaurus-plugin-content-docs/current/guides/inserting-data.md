---
title: 插入 ClickHouse 数据
description: 如何将数据插入到 ClickHouse
keywords: [插入, 插入数据, 插入到表]
sidebar_label: 插入 ClickHouse 数据
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';

## 基本示例 {#basic-example}

您可以使用熟悉的 `INSERT INTO TABLE` 命令来操作 ClickHouse。我们来将一些数据插入到我们在入门指南 ["在 ClickHouse 中创建表"]（./creating-tables）中创建的表中。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

为了验证这是否成功，我们将执行以下 `SELECT` 查询：

```sql
SELECT * FROM helloworld.my_first_table
```

返回结果为：

```response
user_id message                                             timestamp           metric
101	    Hello, ClickHouse!	                                2024-11-13 20:01:22	-1
101	    Granules are the smallest chunks of data read	    2024-11-13 20:01:27	3.14159
102	    Insert a lot of rows per batch	                    2024-11-12 00:00:00	1.41421
102	    Sort your data based on your commonly-used queries	2024-11-13 00:00:00	2.718
```

## 向 ClickHouse 插入数据与向 OLTP 数据库插入数据的对比 {#inserting-into-clickhouse-vs-oltp-databases}

作为一个 OLAP (在线分析处理) 数据库，ClickHouse 被优化用于高性能和可扩展性，允许每秒插入数百万行。这是通过高度并行的架构和高效的列式压缩结合实现的，但在即时一致性方面有所妥协。
更具体地说，ClickHouse 针对追加操作进行了优化，并仅提供最终一致性保证。

相反，OLTP 数据库如 Postgres 专门针对具有完整 ACID 合规性的事务插入进行了优化，确保强一致性和可靠性保证。PostgreSQL 使用 MVCC（多版本并发控制）来处理并发事务，这涉及维护多个数据版本。这些事务可能一次只涉及少量行，并由于可靠性保证造成 considerable 的开销，从而限制插入性能。

为了在保持强一致性保证的同时实现高插入性能，用户在向 ClickHouse 插入数据时应遵循下面描述的简单规则。遵循这些规则将有助于避免用户在第一次使用 ClickHouse 时常遇到的问题，并尝试复制适用于 OLTP 数据库的插入策略。

## 插入的最佳实践 {#best-practices-for-inserts}

### 以大批量插入 {#insert-in-large-batch-sizes}

默认情况下，发送到 ClickHouse 的每个插入都使 ClickHouse 立即创建一个包含插入数据以及需要存储的其他元数据的存储部分。因此，发送较少的插入，而每个插入包含更多数据，相比于发送较多的插入而每个插入包含较少的数据，将减少所需的写入次数。
一般而言，我们建议以至少 1,000 行一次的较大批量插入数据，理想情况下在 10,000 到 100,000 行之间。
（更多详细信息请参见 [此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果大批量插入不可行，则使用下面描述的异步插入。

### 确保一致的批量以便进行幂等重试 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 插入的数据是同步的，并且是幂等的（即多次执行相同的插入操作与执行一次的效果相同）。
对于 MergeTree 引擎系列的表，ClickHouse 默认为自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着在以下情况下插入仍然是有弹性的：

- 1. 如果接收数据的节点出现问题，插入查询将超时（或给出更具体的错误），并且不会得到确认。
- 2. 如果数据已由节点写入，但由于网络中断无法将确认返回给查询发送者，发送者将 either 收到超时或网络错误。

从客户端的角度来看，(i) 和 (ii) 很难区分。然而，在这两种情况下，未经确认的插入可以立即重试。只要重试的插入查询中包含相同的数据并且顺序相同，ClickHouse 将自动忽略重试的插入，如果原始（未确认）插入成功。

### 向 MergeTree 表或分布式表插入 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接插入到 MergeTree（或复制表）中，如果数据是分片的，可以在一组节点之间平衡请求，并设置 `internal_replication=true`。这样 ClickHouse 会将数据复制到任何可用的副本分片，并确保数据最终一致。

如果这种客户端负载均衡不方便，则用户可以通过 [分布式表](/engines/table-engines/special/distributed) 插入数据，该表将随后在节点之间分配写入。再次建议设置 `internal_replication=true`。但是需要注意，这种方法的性能稍逊，因为写入必须在具有分布式表的节点上本地进行，然后发送到分片。

### 使用异步插入以进行小批量插入 {#use-asynchronous-inserts-for-small-batches}

在某些场景中，客户端批量处理不可行，例如，使用 100s 或 1000s 个单一目的代理发送日志、指标、跟踪等的可观测性用例。
在这种情况下，实时传输该数据对快速检测问题和异常至关重要。此外，观察到的系统中可能会存在事件激增的风险，这可能导致在尝试在客户端缓冲可观测性数据时出现大量内存激增及相关问题。
如果无法插入大批量数据，用户可以使用 [异步插入](/cloud/bestpractices/asynchronous-inserts) 将批量处理委托给 ClickHouse。

使用异步插入时，数据首先插入到缓冲区，然后在 3 个步骤中写入数据库存储，如下图所示：

<br />

<img src={postgres_inserts}
     className="image"
     alt="NEEDS ALT"
     style={{width: '600px'}}
/>

<br />

启用异步插入后，ClickHouse 将：

(1) 异步接收插入查询。
(2) 首先将查询的数据写入内存中的缓冲区。
(3) 仅在下一个缓冲区刷新时，将数据排序并作为一个部分写入数据库存储。

在缓冲区刷新之前，来自同一或其他客户端的其他异步插入查询的数据可以在缓冲区中收集。由缓冲区刷新生成的部分可能包含来自几个异步插入查询的数据。一般而言，这些机制将数据的批量处理从客户端转移到服务器端（ClickHouse 实例）。

:::note
请注意，在刷新到数据库存储之前，数据无法通过查询进行搜索，并且缓冲区刷新是可配置的。

有关配置异步插入的完整详细信息，请参见 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，深入探讨请参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
:::

### 使用官方 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 的客户端使用了最流行的编程语言。这些客户端进行了优化，以确保插入正确执行，并原生支持异步插入，无论是直接如 [Go 客户端](/integrations/go#async-insert)，还是通过在查询、用户或连接级别设置中启用。

请参见 [客户端和驱动程序](/interfaces/cli) 获取完整的 ClickHouse 客户端和驱动程序列表。

### 优先使用原生格式 {#prefer-the-native-format}

ClickHouse 在插入（和查询）时支持多种 [输入格式](/interfaces/formats)。这与 OLTP 数据库有显著差异，并使从外部源加载数据变得更加容易——特别是结合使用 [表函数](/sql-reference/table-functions) 和从磁盘文件加载数据的能力。这些格式非常适合于临时数据加载和数据工程任务。

对于希望实现最佳插入性能的应用程序，用户应使用 [原生](/interfaces/formats/Native) 格式插入。这种格式受到大多数客户端（例如 Go 和 Python）的支持，并确保服务器的工作量最小，因为该格式已经是列式的。通过这样做，责任被放在客户端以将数据转换为列式格式。这对提高插入效率至关重要。

另外，用户可以使用 [RowBinary 格式](/interfaces/formats/RowBinary)（如 Java 客户端所用），如果更喜欢行格式——这通常比原生格式更容易编写。就压缩、网络开销和服务器处理而言，它比其他行格式（如 [JSON](/interfaces/formats/JSON)）更高效。对于希望快速集成且写入吞吐量较低的用户，可以考虑使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户应当注意，这种格式在 ClickHouse 中解析时会消耗 CPU 资源。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同，ClickHouse 支持 HTTP 接口。用户可以使用此接口进行数据的插入和查询，使用上述任一格式。这通常比 ClickHouse 的原生协议更可取，因为它允许流量轻松地与负载均衡器切换。我们预计，原生协议的插入性能会有小幅差异，其开销相对较低。现有客户端使用这两种协议（在某些情况下两者都使用，例如 Go 客户端）。原生协议确实允许轻松跟踪查询进展。

有关更多详细信息，请参见 [HTTP 接口](/interfaces/http)。

## 从 Postgres 加载数据 {#loading-data-from-postgres}

要从 Postgres 加载数据，用户可以使用：

- `PeerDB by ClickHouse`，这是一个专门为 PostgreSQL 数据库复制设计的 ETL 工具。这在以下两种情况下均可用：
  - ClickHouse Cloud - 通过我们的 [新连接器](/integrations/clickpipes/postgres)（私有预览）在 ClickPipes 中提供，这是我们的受管数据提取服务。感兴趣的用户 [在此注册](https://clickpipes.peerdb.io/)。
  - 自管理 - 通过 [开源项目](https://github.com/PeerDB-io/peerdb)。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine) 直接读取数据，如前面示例所示。通常适合基于已知水印（例如时间戳）的批量复制，如果是一次性迁移也适用。这种方法可以扩展到数千万行。希望迁移更大数据集的用户应考虑多个请求，每个请求处理一部分数据。在每个块的分区移动到最终表之前，可以使用暂存表。这允许重试失败的请求。有关这种批量加载策略的更多详细信息，请参见此处。
- 数据可以从 PostgreSQL 导出为 CSV 格式。然后可以从本地文件或通过对象存储将其插入 ClickHouse，使用表函数。

:::note 需要帮助插入大数据集？
如果您在向 ClickHouse Cloud 导入数据时需要帮助，或者在导入过程中遇到任何错误，请通过 support@clickhouse.com 联系我们，我们可以提供帮助。
:::
