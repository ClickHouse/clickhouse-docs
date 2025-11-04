---
'title': '插入 ClickHouse 数据'
'description': '如何将数据插入 ClickHouse'
'keywords':
- 'INSERT'
- 'Batch Insert'
'sidebar_label': '插入 ClickHouse 数据'
'slug': '/guides/inserting-data'
'show_related_blogs': true
'doc_type': 'guide'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本示例 {#basic-example}

您可以使用熟悉的 `INSERT INTO TABLE` 命令与 ClickHouse。一起来插入一些数据到我们在入门指南中创建的表 ["在 ClickHouse 中创建表"](./creating-tables)。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

为了验证这个操作是否成功，我们将运行以下 `SELECT` 查询：

```sql
SELECT * FROM helloworld.my_first_table
```

返回结果如下：

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## 向 ClickHouse 插入数据与向 OLTP 数据库插入数据的比较 {#inserting-into-clickhouse-vs-oltp-databases}

作为一个 OLAP（在线分析处理）数据库，ClickHouse 针对高性能和可扩展性进行了优化，允许每秒插入数百万行数据。这是通过高度并行化的架构和高效的列式压缩相结合实现的，但在即时一致性上做出了妥协。更具体来说，ClickHouse 是针对仅追加操作进行优化的，并且只提供最终一致性保证。

相对而言，像 Postgres 这样的 OLTP 数据库专门针对事务插入进行了优化，具有完整的 ACID 兼容性，确保强一致性和可靠性保证。PostgreSQL 使用 MVCC（多版本并发控制）来处理并发事务，这涉及维护数据的多个版本。这些事务在某个时刻可能只涉及少量行，并且由于可靠性保证而会产生可观的开销，从而限制插入性能。

为了在保持强一致性保证的同时实现高插入性能，用户在向 ClickHouse 插入数据时应遵循下面描述的简单规则。遵循这些规则将有助于避免用户在第一次使用 ClickHouse 时常遇到的问题，并尝试复制适用于 OLTP 数据库的插入策略。

## 插入的最佳实践 {#best-practices-for-inserts}

### 大批量插入 {#insert-in-large-batch-sizes}

默认情况下，每个发送到 ClickHouse 的插入会导致 ClickHouse 立即创建一个存储部分，其中包含插入的数据以及需要存储的其他元数据。因此，发送较小数量但每个包含更多数据的插入比发送数量较多但每个包含较少数据的插入将减少所需的写入次数。一般来说，我们建议一次插入至少 1,000 行的数据，理想情况下在 10,000 到 100,000 行之间。
（更多详细信息 [请点击这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果无法进行大批量插入，请使用下面描述的异步插入。

### 确保一致的批次以实现幂等重试 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 的插入是同步的并且是幂等的（即，执行相同的插入操作多次的效果与执行一次相同）。对于 MergeTree 引擎家族的表，ClickHouse 默认会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着在以下情况下插入仍然具有弹性：

- 1. 如果接收数据的节点出现问题，插入查询将超时（或给出更具体的错误）并且不会获得确认。
- 2. 如果数据已被节点写入但由于网络中断无法将确认返回给查询的发送者，发送者将会收到超时或网络错误。

从客户端的角度来看，（i）和（ii）可能难以区分。然而，在这两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据和相同的顺序，ClickHouse 将自动忽略重试的插入，如果（未确认的）原始插入成功。

### 向 MergeTree 表或分布式表插入 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接向 MergeTree（或副本表）插入数据，如果数据是分片的，请在一组节点之间平衡请求，并设置 `internal_replication=true`。这将让 ClickHouse 将数据复制到任何可用的副本分片，并确保数据最终一致。

如果这种客户端负载均衡不方便，用户可以通过 [分布式表](/engines/table-engines/special/distributed) 插入，然后将写入分配到各个节点。再次建议设置 `internal_replication=true`。但需注意，这种方法的性能略低，因为写入必须在具有分布式表的节点本地进行，然后再发送到分片。

### 使用异步插入进行小批量插入 {#use-asynchronous-inserts-for-small-batches}

在某些情况下，客户端批处理不可行，例如，在有数百或数千个单用途代理发送日志、度量和跟踪的可观察性用例中。在这种情况下，实时传输该数据是及早检测问题和异常的关键。此外，观察系统中可能会出现事件高峰，这可能导致在尝试在客户端缓冲可观察性数据时出现大的内存峰值和相关问题。如果无法插入大批量数据，用户可以使用 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理委托给 ClickHouse。

通过异步插入，数据首先插入到缓冲区，然后在后续的三个步骤中写入数据库存储，如下图所示：

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

启用异步插入后，ClickHouse：

(1) 异步接收插入查询。
(2) 首先将查询的数据写入内存缓冲区。
(3) 仅在下次缓冲区刷新发生时，将数据排序并写入数据库存储。

在缓冲区刷新之前，来自同一客户端或其他客户端的其他异步插入查询的数据可以在缓冲区中收集。由缓冲区刷新创建的部分可能包含来自多个异步插入查询的数据。通常，这种机制将数据的批处理从客户端转移到服务器端（ClickHouse 实例）。

:::note
请注意，在数据刷新到数据库存储之前，该数据不能通过查询进行检索，并且缓冲区刷新是可配置的。

有关配置异步插入的完整细节，请参见 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，更深入的讨论请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
:::

### 使用官方的 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 在最流行的编程语言中都有客户端。这些客户端得到了优化，以确保插入操作的正确执行，并直接支持异步插入，例如在 [Go 客户端](/integrations/go#async-insert) 中，或者在查询、用户或连接级别设定中启用时间接支持。

请参见 [客户端和驱动](/interfaces/cli) 获取可用的 ClickHouse 客户端和驱动的完整列表。

### 优先选择原生格式 {#prefer-the-native-format}

ClickHouse 在插入（和查询）时支持多种 [输入格式](/interfaces/formats)。这与 OLTP 数据库有显著区别，并且使得从外部源加载数据变得更加容易——特别是与 [表函数](/sql-reference/table-functions) 和从磁盘文件加载数据的能力相结合。这些格式非常适合临时数据加载和数据工程任务。

对于希望实现最佳插入性能的应用程序，用户应使用 [原生](/interfaces/formats/Native) 格式进行插入。这得到了大多数客户端（如 Go 和 Python）的支持，并确保服务器需要做的工作最少，因为此格式已经是列式的。通过这样做，将数据转换为列式格式的责任放在了客户端。这对于有效扩展插入至关重要。

或者，如果更喜欢行格式，用户可以使用 [RowBinary 格式](/interfaces/formats/RowBinary)（如 Java 客户端所使用），这通常比原生格式更容易写入。这种格式在压缩、网络开销和服务器处理方面比其他行格式（如 [JSON](/interfaces/formats/JSON)）效率更高。对于希望快速集成且写入吞吐量较低的用户，可以考虑使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户应注意，这种格式会在 ClickHouse 中引入 CPU 解析开销。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同，ClickHouse 支持 HTTP 接口。用户可以使用此接口插入和查询数据，使用上述任一格式。这通常比 ClickHouse 的原生协议更受欢迎，因为它允许与负载均衡器轻松切换流量。我们预计使用原生协议时，插入性能会有小的差异，因为其开销稍低。现有客户端使用这两种协议（在某些情况下，两者都在使用，例如 Go 客户端）。原生协议确实允许轻松跟踪查询进度。

有关更多详细信息，请见 [HTTP 接口](/interfaces/http)。

## 从 Postgres 加载数据 {#loading-data-from-postgres}

要从 Postgres 加载数据，用户可以使用：

- `PeerDB by ClickHouse`，一个专门为 PostgreSQL 数据库复制设计的 ETL 工具。这在以下两个方面提供支持：
  - ClickHouse Cloud - 通过我们在 ClickPipes 中的新连接器 [获取](https://clickhouse.com/integrations/clickpipes/postgres)，这是我们的管理型导入服务。
  - 自管理 - 通过 [开源项目](https://github.com/PeerDB-io/peerdb)。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine) 直接读取数据，正如之前的示例所示。当基于已知水印（例如时间戳）的批量复制足够时，或者这是一次性的迁移。这种方法可以扩展到数千万行。用户希望迁移更大的数据集时，可以考虑多次请求，每次处理一块数据。可以为每块数据使用暂存表，在其分区迁移到最终表之前。这使得失败的请求能够重试。有关此批量加载策略的更多详细信息，请参见此处。
- 数据可以以 CSV 格式从 PostgreSQL 导出。这可以从本地文件或通过对象存储使用表函数插入到 ClickHouse 中。

:::note 需要帮助插入大型数据集？
如果您需要帮助插入大型数据集或在将数据导入 ClickHouse Cloud 时遇到任何错误，请通过 support@clickhouse.com 与我们联系，我们将提供帮助。
:::
