import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本示例 {#basic-example}

您可以使用熟悉的 `INSERT INTO TABLE` 命令与 ClickHouse。让我们向我们在入门指南 ["在 ClickHouse 中创建表"](/creating-tables) 中创建的表插入一些数据。

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

返回结果：

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## 向 ClickHouse 插入数据与 OLTP 数据库的比较 {#inserting-into-clickhouse-vs-oltp-databases}

作为一个 OLAP（在线分析处理）数据库，ClickHouse 被优化以实现高性能和可扩展性，允许每秒插入数百万行数据。
这一点通过高度并行化的架构和高效的列式压缩相结合实现，但在即时一致性方面做出了妥协。
更具体地说，ClickHouse 针对仅追加操作进行了优化，并仅提供最终一致性保证。

相比之下，像 Postgres 这样的 OLTP 数据库专门针对具有完整 ACID 合规性的事务插入进行了优化，以确保强一致性和可靠性的保证。
PostgreSQL 使用 MVCC（多版本并发控制）来处理并发事务，这涉及维护数据的多个版本。
这些事务每次可能涉及少量行，但由于可靠性保证会导致插入性能的大幅开销。

为了在保持强一致性保证的同时实现高插入性能，用户应在向 ClickHouse 插入数据时遵循以下简单规则。
遵循这些规则将有助于避免用户在第一次使用 ClickHouse 时常遇到的问题，并试图复制适用于 OLTP 数据库的插入策略。

## 插入的最佳实践 {#best-practices-for-inserts}

### 大批量插入 {#insert-in-large-batch-sizes}

默认情况下，发送到 ClickHouse 的每次插入都会导致 ClickHouse 立即创建一个存储部分，包含插入的数据和需要存储的其他元数据。
因此，与发送包含较少数据的大量插入相比，发送包含更多数据的较少插入将减少所需的写入次数。
一般来说，我们建议以每次至少 1,000 行的数据进行相当大的批量插入，理想情况下在 10,000 到 100,000 行之间。
（更多细节请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果无法进行大批量插入，请使用下面描述的异步插入。

### 确保可重入的批次一致性 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 插入的数据是同步和幂等的（即，多次执行相同的插入操作与执行一次效果相同）。
对于 MergeTree 引擎家族的表，ClickHouse 默认会自动[去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着在以下情况下，插入保持弹性：

- 1. 如果接收数据的节点出现问题，插入查询将超时（或给出更具体的错误）而未获得确认。
- 2. 如果数据已被节点写入，但由于网络中断无法返回给查询发送者确认，则发送者将获得超时或网络错误。

从客户端的角度，(i) 和 (ii) 可能很难区分。然而，在这两种情况下，未确认的插入可以立即重试。
只要重试的插入查询包含相同的数据和顺序，ClickHouse 会自动忽略重试的插入（如果原始未确认的插入成功）。

### 向 MergeTree 表或分布式表插入 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接向 MergeTree（或 Replicated 表）插入数据，如果数据是分片的，则在一组节点之间平衡请求，并设置 `internal_replication=true`。
这样 ClickHouse 将负责将数据复制到任何可用的副本分片，并确保数据最终一致。

如果这种客户端负载均衡不方便，则用户可以通过 [分布式表](/engines/table-engines/special/distributed) 进行插入，分布式表将分发写入到各个节点。再次建议设置 `internal_replication=true`。
然而，需要注意的是，这种方法的性能略逊，因为必须在本地节点的分布式表上进行写入，然后再发送到分片。

### 对于小批量使用异步插入 {#use-asynchronous-inserts-for-small-batches}

有些场景下，客户端批处理不可行，例如有成百上千个单用途代理发送日志、指标、追踪等的可观察性用例。
在这种情况下，实时传输数据是关键，以尽快检测问题和异常。
此外，被观察系统中可能发生事件峰值，这可能会在尝试在客户端缓冲可观察性数据时导致较大的内存峰值及相关问题。
如果无法插入大批量数据，用户可以借助 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理委托给 ClickHouse。

使用异步插入时，数据首先插入到缓冲区中，然后在三个步骤中写入数据库存储，如下图所示：

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

启用异步插入后，ClickHouse：

(1) 异步接收插入查询。
(2) 首先将查询的数据写入内存缓冲区。
(3) 只有在下次缓冲区刷新时，才会对数据进行排序并作为部分写入数据库存储。

在缓冲区刷新之前，来自同一客户端或其他客户端的其他异步插入查询的数据可以被收集在缓冲区中。
缓冲区刷新后创建的部分可能包含来自多个异步插入查询的数据。
一般来说，这些机制将数据的批处理从客户端侧转移到服务器侧（ClickHouse 实例）。

:::note
请注意，在刷新到数据库存储之前，数据无法通过查询进行搜索，并且缓冲区刷新是可配置的。

有关配置异步插入的完整细节，请查看 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，并深入了解 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
:::

### 使用官方 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 提供了最流行的编程语言的客户端。
这些客户端经过优化，以确保插入正确执行，并原生支持异步插入，无论是直接支持（如 [Go 客户端](/integrations/go#async-insert)），还是在查询、用户或连接级别设置时间接启用。

请参阅 [客户端和驱动程序](/interfaces/cli) 以获取可用 ClickHouse 客户端和驱动程序的完整列表。

### 优先使用原生格式 {#prefer-the-native-format}

ClickHouse 在插入（和查询）时支持多种 [输入格式](/interfaces/formats)。
这是与 OLTP 数据库之间的一个显著区别，并使从外部源加载数据变得更加容易 - 特别是与 [表函数](/sql-reference/table-functions) 结合使用以及能够从磁盘文件加载数据时。
这些格式适用于临时数据加载和数据工程任务。

对于希望实现最佳插入性能的应用程序，用户应使用 [原生](/interfaces/formats/Native) 格式进行插入。
这被大多数客户端（如 Go 和 Python）支持，并确保服务器的工作量最小，因为该格式已经是列式的。
这样，责任就转移到了客户端，以将数据转换为列式格式。这对于高效扩展插入非常重要。

或者，用户可以使用 [RowBinary 格式](/interfaces/formats/RowBinary)（如 Java 客户端所使用），如果更喜欢行格式 - 这通常比原生格式更容易编写。
在压缩、网络开销和服务器处理方面，这比其他行格式（如 [JSON](/interfaces/formats/JSON)）更高效。
对于希望快速集成而写入吞吐量较低的用户，可以考虑使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户应注意，这种格式在 ClickHouse 中解析时会产生 CPU 开销。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同，ClickHouse 支持 HTTP 接口。
用户可以使用此接口进行插入和查询数据，使用上述任何格式。
这通常比 ClickHouse 的本机协议更受欢迎，因为它允许流量通过负载均衡器轻松切换。
我们预计使用本机协议的插入性能会有小幅差异，因为它的开销较小。
现有客户端使用这两种协议（在某些情况下两者都使用，例如 Go 客户端）。
本机协议确实使查询进度跟踪变得容易。

有关更多详细信息，请参阅 [HTTP 接口](/interfaces/http)。

## 从 Postgres 加载数据 {#loading-data-from-postgres}

从 Postgres 加载数据时，用户可以使用：

- `PeerDB by ClickHouse`，这是一个专为 PostgreSQL 数据库复制设计的 ETL 工具。它在以下两种情况下可用：
  - ClickHouse Cloud - 通过我们的 [新连接器](/integrations/clickpipes/postgres)（私有预览）在 ClickPipes 中提供，这是我们的托管数据摄取服务。有兴趣的用户可以 [在这里注册](https://clickpipes.peerdb.io/)。
  - 自管理 - 通过 [开源项目](https://github.com/PeerDB-io/peerdb)。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine) 以直接读取数据，如前面的示例所示。如果基于已知水印（例如，时间戳）的批量复制足够，或者是一次性迁移，则通常适用。该方法可扩展到数千万行。希望迁移较大数据集的用户应考虑多个请求，每个请求处理一部分数据。可以在每个部分移动到最终表之前使用暂存表。这允许对失败的请求进行重试。有关此批量加载策略的更多详细信息，请参见此处。
- 数据可以以 CSV 格式从 PostgreSQL 导出。然后可以通过本地文件或使用表函数从对象存储插入到 ClickHouse。

:::note 需要帮助插入大数据集？
如果您在将大量数据集导入 ClickHouse Cloud 时需要帮助或遇到任何错误，请通过 support@clickhouse.com 联系我们，我们将提供帮助。
:::
