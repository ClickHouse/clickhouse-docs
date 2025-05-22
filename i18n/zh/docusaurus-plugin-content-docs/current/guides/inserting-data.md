---
'title': '插入 ClickHouse 数据'
'description': '如何将数据插入到 ClickHouse 中'
'keywords':
- 'insert'
- 'insert data'
- 'insert into table'
'sidebar_label': '插入 ClickHouse 数据'
'slug': '/guides/inserting-data'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本示例 {#basic-example}

您可以使用熟悉的 `INSERT INTO TABLE` 命令与 ClickHouse 进行交互。让我们把一些数据插入到我们在开始指南中创建的表中 ["在 ClickHouse 中创建表"](./creating-tables)。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

为验证是否成功，我们将执行以下 `SELECT` 查询：

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

## 向 ClickHouse 插入数据与 OLTP 数据库的对比 {#inserting-into-clickhouse-vs-oltp-databases}

作为一个 OLAP（联机分析处理）数据库，ClickHouse 经过优化以实现高性能和可扩展性，允许每秒插入数百万行数据。
这是通过高度并行化的架构和高效的列式压缩相结合实现的，但在即时一致性方面有所妥协。
更具体地说，ClickHouse 针对仅追加的操作进行了优化，并仅提供最终一致性保证。

相比之下，OLTP 数据库（例如 Postgres）专门优化交易性插入，并具有完整的 ACID 合规性，确保强一致性和可靠性保证。
PostgreSQL 使用 MVCC（多版本并发控制）来处理并发事务，这涉及维护数据的多个版本。
这些事务通常一次只涉及少量行，可能会由于可靠性保证而产生相当大的开销，从而限制插入性能。

为了在保持强一致性保证的同时实现高插入性能，用户在向 ClickHouse 插入数据时应遵循下面描述的简单规则。
遵循这些规则将帮助避免用户在第一次使用 ClickHouse 时常遇到的问题，并尝试复制在 OLTP 数据库中有效的插入策略。

## 插入的最佳实践 {#best-practices-for-inserts}

### 在大批量中插入 {#insert-in-large-batch-sizes}

默认情况下，发送到 ClickHouse 的每个插入都会导致 ClickHouse 立即创建一个包含插入数据及其他需要存储的元数据的存储部分。
因此，发送较少数量的插入且每个插入包含更多数据，能相比发送数量更多但每个包含较少数据的插入，减少所需的写入次数。
通常，我们建议以相对较大的批量（至少 1,000 行）插入数据，理想情况下在 10,000 到 100,000 行之间。
（进一步详情参见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果无法使用大批量插入，请使用下面描述的异步插入。

### 确保一致的批次以便幂等重试 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 插入数据是同步的和幂等的（即多次执行相同的插入操作与执行一次具有相同效果）。
对于 MergeTree 引擎系列的表，ClickHouse 默认会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着插入在以下情况下是具有弹性的：

- 1. 如果接收数据的节点出现问题，插入查询将超时（或给出更具体的错误）并不会收到确认。
- 2. 如果数据被节点写入，但由于网络中断未能将确认返回给查询的发送者，发送者将获得超时或网络错误。

从客户端的角度来看，（i）和（ii）可能很难区分。然而，在这两种情况下，未确认的插入可以立即重试。
只要重试的插入查询包含相同的数据且顺序相同，ClickHouse 将自动忽略重试的插入（如果未确认的）原始插入成功。

### 插入到 MergeTree 表或分布式表 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接插入到 MergeTree（或 Replicated 表），并在数据分片的情况下在一组节点之间平衡请求，同时设置 `internal_replication=true`。
这样 ClickHouse 将负责将数据复制到任何可用的副本分片，并确保数据最终一致。

如果这种客户端负载均衡不方便，用户可以通过 [分布式表](/engines/table-engines/special/distributed) 插入数据，该表将分配写操作到各个节点。同样，建议设置 `internal_replication=true`。
然而，需要注意的是，这种方法的性能略差，因为写入必须在具有分布式表的节点上本地完成，然后发送到分片。

### 对于小批量使用异步插入 {#use-asynchronous-inserts-for-small-batches}

在某些场景中，客户端批量处理不可行，例如数百或数千个单一目的代理发送日志、指标、追踪等的可观察性用例。
在这种情况下，实时传输这些数据对于尽快检测问题和异常至关重要。
此外，观察系统中可能会出现事件峰值，这可能在尝试缓冲客户端的可观察性数据时导致大量内存峰值和相关问题。
如果无法插入大批量，用户可以使用 ClickHouse 的 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理委托给 ClickHouse。

使用异步插入时，数据首先插入到缓冲区，然后在以下三步中写入到数据库存储，如下面的图表所示：

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

启用异步插入时，ClickHouse：

(1) 异步接收插入查询。
(2) 首先将查询的数据写入内存缓冲区。
(3) 仅在下一个缓冲区刷新时，将数据排序并写入数据库存储作为一个部分。

在缓冲区刷新之前，来自同一客户端或其他客户端的其他异步插入查询的数据可以收集在缓冲区中。
从缓冲区刷新的部分将可能包含来自多个异步插入查询的数据。
通常，这种机制将数据的批处理从客户端迁移到服务器端（ClickHouse 实例）。

:::note
请注意，在数据刷新到数据库存储之前，查询无法搜索该数据，并且缓冲区刷新可以配置。

关于配置异步插入的完整细节可以在 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) 找到，深入了解请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).
:::

### 使用官方 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 在最流行的编程语言中都有客户端。
这些客户端经过优化，确保插入操作正确，并本地支持异步插入，无论是直接的例如 [Go 客户端](/integrations/go#async-insert)，还是在查询、用户或连接级设置中启用时间接的。

请参见 [客户端和驱动程序](/interfaces/cli) 获取可用的 ClickHouse 客户端和驱动程序的完整列表。

### 偏好使用原生格式 {#prefer-the-native-format}

ClickHouse 在插入（和查询）时支持多种 [输入格式](/interfaces/formats)。
这是与 OLTP 数据库的显著不同，且使从外部源加载数据变得更加容易——尤其是在配合 [表函数](/sql-reference/table-functions) 和从磁盘文件加载数据的能力时。
这些格式非常适合临时数据加载和数据工程任务。

对于希望实现最佳插入性能的应用程序，用户应使用 [原生](/interfaces/formats/Native) 格式插入。
大多数客户端（如 Go 和 Python）都支持此格式，并且确保服务器只需要执行最少量的工作，因为这种格式已经是列式的。
通过这样的方式，将数据转换为列式格式的责任交给了客户端。这对于高效扩展插入至关重要。

另外，如果更偏好行格式，用户可以使用 [RowBinary format](/interfaces/formats/RowBinary)（Java 客户端使用的格式）——这通常比原生格式更易于编写。
就压缩、网络开销和服务器处理而言，这比 [JSON](/interfaces/formats/JSON) 等替代行格式更高效。
对于写入吞吐量较低且希望快速集成的用户，可以考虑 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户应注意，这种格式会在 ClickHouse 中引起解析的 CPU 开销。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同，ClickHouse 支持 HTTP 接口。
用户可以使用此接口进行数据插入和查询，使用以上任一格式。
与 ClickHouse 的本机协议相比，这通常更受欢迎，因为它允许流量与负载均衡器轻松切换。
我们预计使用本机协议时插入性能会有小幅差异，后者收取的开销略低。
现有客户端使用这两种协议（在某些情况下同时使用，例如 Go 客户端）。
本机协议确实允许轻松跟踪查询进度。

有关更多详细信息，请参见 [HTTP 接口](/interfaces/http)。

## 从 Postgres 加载数据 {#loading-data-from-postgres}

要从 Postgres 加载数据，用户可以使用：

- `PeerDB by ClickHouse`，一个专门为 PostgreSQL 数据库复制设计的 ETL 工具。此工具在以下两个方面均可用：
  - ClickHouse Cloud - 通过我们的 [新连接器](/integrations/clickpipes/postgres)（私有预览）在 ClickPipes 阶段可用，这是我们的自管理输入服务。有兴趣的用户 [在此注册](https://clickpipes.peerdb.io/)。
  - 自管理 - 通过 [开源项目](https://github.com/PeerDB-io/peerdb)。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine) 直接读取数据，如前面示例所示。通常适合基于已知水印（例如时间戳）的批量复制，或者如果这是一次性迁移。此方法可以扩展到数千万行。希望迁移较大数据集的用户应考虑多个请求，每个请求处理一块数据。在数据分区移动到最终表之前，可以为每块数据使用暂存表。这使得失败的请求可以重试。有关此批量加载策略的更多详细信息，请见此处。
- 数据可以以 CSV 格式从 PostgreSQL 导出。然后可以通过本地文件或使用表函数通过对象存储将其插入到 ClickHouse 中。

:::note 需要帮助插入大数据集？
如果您在将大数据集导入 ClickHouse Cloud 时需要帮助或遇到任何错误，请通过 support@clickhouse.com 联系我们，我们可以提供协助。
:::
