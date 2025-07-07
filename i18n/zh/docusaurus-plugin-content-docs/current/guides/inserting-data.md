---
'title': '插入 ClickHouse 数据'
'description': '如何将数据插入到 ClickHouse 中'
'keywords':
- 'INSERT'
- 'Batch Insert'
'sidebar_label': '插入 ClickHouse 数据'
'slug': '/guides/inserting-data'
'show_related_blogs': true
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本示例 {#basic-example}

您可以使用熟悉的 `INSERT INTO TABLE` 命令与 ClickHouse。让我们向在开始指南中创建的表中插入一些数据 ["在 ClickHouse 中创建表"](./creating-tables)。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

为了验证是否成功，我们将运行以下 `SELECT` 查询：

```sql
SELECT * FROM helloworld.my_first_table
```

返回结果为：

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## 向 ClickHouse 插入与 OLTP 数据库的对比 {#inserting-into-clickhouse-vs-oltp-databases}

作为一个 OLAP（在线分析处理）数据库，ClickHouse 针对高性能和可扩展性进行了优化，允许每秒插入数百万行。这是通过高度并行化的架构和高效的列式压缩相结合实现的，但在即时一致性上有所妥协。更具体来说，ClickHouse 针对仅追加操作进行了优化，并且仅提供最终一致性保证。

相比之下，Postgres 等 OLTP 数据库专门针对具有完整 ACID 合规性的事务插入进行了优化，确保强一致性和可靠性保证。PostgreSQL 使用 MVCC（多版本并发控制）来处理并发事务，这涉及维护多个版本的数据。这些事务可能一次只涉及少量行，由于可靠性保证而导致的额外开销会限制插入性能。

为了在保持强一致性保证的同时实现高插入性能，用户在向 ClickHouse 插入数据时应遵循以下简单规则。遵循这些规则将有助于避免用户在首次使用 ClickHouse 时常遇到的问题，并尝试复制适用于 OLTP 数据库的插入策略。

## 插入的最佳实践 {#best-practices-for-inserts}

### 大批量插入 {#insert-in-large-batch-sizes}

默认情况下，发送到 ClickHouse 的每个插入都会使 ClickHouse 立即创建一个存储部分，包含来自插入的数据以及需要存储的其他元数据。因此，发送较少的插入但每个插入包含更多数据，与发送较多插入但每个插入包含较少数据相比，将减少所需的写入数量。通常，我们建议每次插入至少 1,000 行，理想情况下在 10,000 到 100,000 行之间。
（更多详细信息请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果大批量插入不可行，请使用下面描述的异步插入。

### 确保一致的批处理以便幂等重试 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 的插入是同步的并且是幂等的（即多次执行相同的插入操作与执行一次具有相同的效果）。对于 MergeTree 引擎系列的表，ClickHouse 默认情况下会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着在以下情况下，插入仍然具有弹性：

- 1. 如果接收数据的节点出现问题，插入查询将超时（或给出更具体的错误），并且不会获得确认。
- 2. 如果数据被节点写入但由于网络中断无法将确认返回给查询的发送方，则发送方会收到超时或网络错误。

从客户端的角度来看，(i) 和 (ii) 可能很难区分。然而，在这两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据且顺序相同，ClickHouse 将自动忽略如果（未确认）原始插入成功的重试插入。

### 向 MergeTree 表或分布式表插入 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接插入到 MergeTree（或 Replicated 表）中，如果数据是分片的，则在一组节点之间平衡请求，并设置 `internal_replication=true`。这将让 ClickHouse 将数据复制到任何可用的副本分片中，并确保数据最终一致。

如果这种客户端负载均衡不方便，则用户可以通过 [分布式表](/engines/table-engines/special/distributed) 插入数据，从而在节点之间分配写入。再次建议设置 `internal_replication=true`。但是需要注意的是，这种方法的性能略差，因为写入需要先在具有分布式表的节点上进行，然后再发送到分片。

### 对小批量数据使用异步插入 {#use-asynchronous-inserts-for-small-batches}

在某些场景下，客户端批处理不可行，例如具有数百或数千个单用途代理发送日志、指标、跟踪等的可观察性用例。在这种情况下，数据的实时传输对于尽快检测问题和异常至关重要。此外，观察到的系统中事件激增的风险可能会导致在尝试客户端缓冲可观察性数据时出现大内存激增及相关问题。如果无法插入大批量数据，用户可以使用 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理委托给 ClickHouse。

使用异步插入时，数据首先被插入到缓冲区，然后在 3 步后写入数据库存储，如下图所示：

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

启用异步插入后，ClickHouse：

(1) 异步接收插入查询。 
(2) 首先将查询的数据写入内存缓冲区。 
(3) 仅在下一次缓冲区刷新时将数据排序并写入数据库存储，成为一部分。

在缓冲区刷新之前，来自同一客户端或其他客户端的其他异步插入查询的数据可以在缓冲区中收集。通过缓冲区刷新创建的部分可能包含来自多个异步插入查询的数据。通常，这些机制将数据的批处理从客户端转移到服务器端（ClickHouse 实例）。

:::note
请注意，在数据刷新到数据库存储之前，查询无法搜索到数据，并且缓冲区刷新的配置是可调的。

有关配置异步插入的完整详细信息，请参见 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，更深入的讨论可见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
:::

### 使用官方 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 在最流行的编程语言中都有客户端。这些客户端经过优化，以确保正确执行插入，并原生支持异步插入，无论是直接如 [Go 客户端](/integrations/go#async-insert)，还是在查询、用户或连接级别设置中启用的间接方式。

请参阅 [客户端和驱动程序](/interfaces/cli) 以获取可用 ClickHouse 客户端和驱动程序的完整列表。

### 优先使用原生格式 {#prefer-the-native-format}

ClickHouse 在插入（和查询）时支持多种 [输入格式](/interfaces/formats)。这是与 OLTP 数据库的一个显著区别，并使从外部源加载数据变得更加容易 - 特别是与 [表函数](/sql-reference/table-functions) 和从磁盘文件加载数据的能力结合使用时。这些格式非常适合临时数据加载和数据工程任务。

对于希望实现最佳插入性能的应用程序，用户应使用 [原生](/interfaces/formats/Native) 格式插入。这被大多数客户端（例如 Go 和 Python）支持，并确保服务器的工作量最小，因为此格式已经是列式的。通过这样做，负责将数据转换为列式格式的责任转移到客户端。这对于高效扩展插入非常重要。

另外，用户可以使用 [RowBinary 格式](/interfaces/formats/RowBinary)（如 Java 客户端使用的格式），如果更喜欢行格式 - 这通常比原生格式更易于编写。在压缩、网络开销和服务器处理方面，这比其他行格式（如 [JSON](/interfaces/formats/JSON)）更有效。对于希望快速集成且写入吞吐量较低的用户，可以考虑 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户应注意，ClickHouse 解析该格式会产生 CPU 开销。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同，ClickHouse 支持 HTTP 接口。用户可以使用此接口进行数据的插入和查询，使用上述任何格式。这通常比 ClickHouse 的原生协议更可取，因为它允许流量轻松与负载均衡器切换。我们预计使用原生协议插入性能会有小差异，这会导致稍微少一些开销。现有客户端使用这两种协议（在某些情况下，两者均使用，例如 Go 客户端）。原生协议确实允许轻松跟踪查询进度。

有关进一步细节，请参见 [HTTP 接口](/interfaces/http)。

## 从 Postgres 加载数据 {#loading-data-from-postgres}

要从 Postgres 加载数据，用户可以使用：

- `PeerDB by ClickHouse`，一种专门为 PostgreSQL 数据库复制设计的 ETL 工具。这在以下两种情况下可用：
  - ClickHouse Cloud - 通过我们的 [新连接器](/integrations/clickpipes/postgres) 在 ClickPipes 中可用，这是我们的托管输入服务。
  - 自管理 - 通过 [开源项目](https://github.com/PeerDB-io/peerdb)。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine) 直接读取数据，如前面示例所示。通常适用于基于已知水印（例如时间戳）进行的批量复制，或者是一次性迁移。这种方法可以扩展到数千万行。希望迁移较大数据集的用户应考虑多次请求，每次处理一部分数据。可以为每个分块使用暂存表，然后将其分区移动到最终表。这允许重试失败的请求。有关此批量加载策略的更多详细信息，请参见这里。
- 数据可以以 CSV 格式从 PostgreSQL 导出。然后，可以通过本地文件或使用表函数通过对象存储插入到 ClickHouse 中。

:::note 需要帮助插入大型数据集？
如果您在插入大型数据集时需要帮助，或在将数据导入 ClickHouse Cloud 时遇到任何错误，请通过 support@clickhouse.com 联系我们，我们将提供帮助。
:::
