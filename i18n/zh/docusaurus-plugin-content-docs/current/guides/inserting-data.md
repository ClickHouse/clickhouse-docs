---
'title': '插入 ClickHouse 数据'
'description': '如何将数据插入 ClickHouse'
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

您可以使用熟悉的 `INSERT INTO TABLE` 命令来操作 ClickHouse。让我们向在开始指南 ["在 ClickHouse 中创建表"](./creating-tables) 中创建的表插入一些数据。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

为了验证这是否有效，我们将运行以下 `SELECT` 查询：

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

## 在 ClickHouse 中插入与在 OLTP 数据库中的插入 {#inserting-into-clickhouse-vs-oltp-databases}

作为 OLAP（在线分析处理）数据库，ClickHouse 针对高性能和可扩展性进行了优化，允许每秒插入数百万行。这是通过高度并行化的架构和高效的列式压缩相结合来实现的，但在即时一致性上进行了妥协。更具体地说，ClickHouse 针对只追加操作进行了优化，只提供最终一致性的保证。

相比之下，像 Postgres 这样的 OLTP 数据库特别针对具有完整 ACID 合规性的事务性插入进行了优化，确保强一致性和可靠性保证。PostgreSQL 使用 MVCC（多版本并发控制）来处理并发事务，这涉及维护数据的多个版本。这些事务一次可能涉及少量行，由于可靠性保证而造成的开销限制了插入性能。

为了在保持强一致性保证的同时实现高插入性能，用户在向 ClickHouse 插入数据时应遵循下面描述的简单规则。遵循这些规则将帮助避免用户首次使用 ClickHouse 时常遇到的问题，并尝试复制适用于 OLTP 数据库的插入策略。

## 插入的最佳实践 {#best-practices-for-inserts}

### 大批量插入 {#insert-in-large-batch-sizes}

默认情况下，发送到 ClickHouse 的每次插入都将导致 ClickHouse 立即创建一个存储部分，包含来自插入的数据和其他需要存储的元数据。因此，发送较小数量的插入，其中每个插入包含更多数据，相比于发送较大的插入数量（每个插入包含较少数据）将减少所需的写入次数。一般来说，我们建议以至少 1,000 行的相当大批量插入数据，理想情况下在 10,000 到 100,000 行之间。 
（更多详细信息请见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

如果无法进行大批量插入，请使用下面描述的异步插入。

### 确保一致的批量以便幂等重试 {#ensure-consistent-batches-for-idempotent-retries}

默认情况下，向 ClickHouse 插入是同步的和幂等的（即多次执行同一插入操作的效果与执行一次相同）。对于 MergeTree 引擎系列的表，ClickHouse 默认情况下会自动 [去重插入](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。

这意味着在以下情况下插入保持弹性：

- 1. 如果接收数据的节点有问题，插入查询将超时（或给出更具体的错误）而没有得到确认。
- 2. 如果数据已由该节点写入，但由于网络中断无法将确认返回给查询的发送者，则发送者将获得超时或网络错误。

从客户端的角度来看，（i）和（ii）可能很难区分。但是，在这两种情况下，未确认的插入可以立即重试。只要重试的插入查询包含相同的数据和相同的顺序，ClickHouse 将自动忽略重试的插入，如果（未确认的）原始插入成功。

### 向 MergeTree 表或分布式表插入 {#insert-to-a-mergetree-table-or-a-distributed-table}

我们建议直接向 MergeTree（或 Replicated 表）插入数据，如果数据是分片的，在一组节点之间平衡请求，并设置 `internal_replication=true`。这样 ClickHouse 会将数据复制到任何可用的副本分片，以确保数据最终一致。

如果这种客户端负载平衡不方便，用户可以通过 [分布式表](/engines/table-engines/special/distributed) 进行插入，该表将跨节点分发写入。同样，建议设置 `internal_replication=true`。但是，值得注意的是，这种方法的性能略低，因为写入必须在具有分布式表的节点上本地完成，然后再发送到分片。

### 对小批量使用异步插入 {#use-asynchronous-inserts-for-small-batches}

在某些情况下，客户端批量处理不可行，例如使用数百或数千个发送日志、指标、追踪等的单一目的代理的可观察性用例。在这种情况下，实时传输这些数据对尽快检测问题和异常至关重要。此外，观察系统中可能会出现事件峰值，这可能导致在尝试在客户端缓冲可观察性数据时发生大内存峰值和相关问题。如果无法插入大批量用户，可以使用 [异步插入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批量处理委托给 ClickHouse。

通过异步插入，数据首先被插入到缓冲区，然后在三个步骤中写入数据库存储，如下图所示：

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

启用异步插入后，ClickHouse：

(1) 异步接收插入查询。
(2) 首先将查询的数据写入内存缓冲区。
(3) 仅在下一个缓冲区刷新时，按顺序对数据进行排序并作为部分写入数据库存储。

在缓冲区刷新之前，来自同一客户端或其他客户端的其他异步插入查询的数据可以在缓冲区中收集。从缓冲区刷新创建的部分可能包含来自多个异步插入查询的数据。一般而言，这些机制将数据的批量处理从客户端转移到服务器端（ClickHouse 实例）。

:::note
请注意，在数据刷新到数据库存储之前，它是不可被查询搜索的，并且缓冲刷新是可配置的。

有关配置异步插入的完整详细信息，请参见 [这里](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，深度分析见 [这里](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。
:::

### 使用官方 ClickHouse 客户端 {#use-official-clickhouse-clients}

ClickHouse 在最流行的编程语言中都有客户端。这些客户端经过优化，以确保正确执行插入，并以原生方式支持异步插入，或者在查询、用户或连接级设置中启用时间接支持。

有关可用 ClickHouse 客户端和驱动程序的完整列表，请参见 [客户端和驱动程序](/interfaces/cli)。

### 优先使用原生格式 {#prefer-the-native-format}

ClickHouse 在插入（和查询）时支持多种 [输入格式](/interfaces/formats)。这是与 OLTP 数据库的重要区别，并且在从外部源加载数据时更为简便，尤其是在结合 [表函数](/sql-reference/table-functions) 和从磁盘文件加载数据的能力时。这些格式非常适合临时数据加载和数据工程任务。

对于希望获得最佳插入性能的应用程序，用户应使用 [原生](/interfaces/formats/Native) 格式进行插入。这一格式被大多数客户端（如 Go 和 Python）支持，并确保服务器需要做最小的工作，因为该格式已经是列式的。通过这样做，将数据转换为列式格式的责任转移到客户端。这对于高效扩展插入是重要的。

另外，如果用户更喜欢行格式，可以使用 [RowBinary 格式](/interfaces/formats/RowBinary)（例如 Java 客户端使用），这通常比原生格式更易于编写。这在压缩、网络开销和服务器处理方面比其他行格式（如 [JSON](/interfaces/formats/JSON)）更为高效。对于希望迅速集成并且写入吞吐量较低的用户，可以考虑使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。用户需要注意，这种格式在 ClickHouse 中解析时会造成 CPU 开销。

### 使用 HTTP 接口 {#use-the-http-interface}

与许多传统数据库不同，ClickHouse 支持 HTTP 接口。用户可以使用此接口同时进行插入和查询，使用上述任一格式。这通常优于 ClickHouse 的原生协议，因为它允许与负载均衡器轻松切换流量。我们预期与原生协议相比，插入性能会有小幅差异，原生协议的开销略小。现有客户端使用这两种协议中的一种（在某些情况下，使用两者，例如 Go 客户端）。原生协议确实允许轻松跟踪查询进度。

有关详细信息，请参见 [HTTP 接口](/interfaces/http)。

## 从 Postgres 加载数据 {#loading-data-from-postgres}

要从 Postgres 加载数据，用户可以使用：

- `PeerDB by ClickHouse`，一款专门为 PostgreSQL 数据库复制设计的 ETL 工具。它在以下两个方面均可用：
  - ClickHouse Cloud - 通过我们在 ClickPipes 中的 [新连接器](/integrations/clickpipes/postgres)（私密预览，管理的摄取服务）获得。有兴趣的用户可以 [在这里注册](https://clickpipes.peerdb.io/)。
  - 自管理 - 通过 [开源项目](https://github.com/PeerDB-io/peerdb)。
- [PostgreSQL 表引擎](/integrations/postgresql#using-the-postgresql-table-engine) 直接读取数据，如之前示例所示。通常适用于基于已知水印（如时间戳）的批量复制，或作为一次性迁移。这种方法可以扩展到数千万行。希望迁移更大数据集的用户应考虑多次请求，每次处理一块数据。可以在每个块的分区移至最终表之前使用临时表。这可让失败的请求被重试。有关此批量加载策略的更多详细信息，请参见此处。
- 可以将数据从 PostgreSQL 以 CSV 格式导出，然后通过表函数从本地文件或对象存储中插入到 ClickHouse 中。

:::note 需要帮助插入大数据集？
如果您在向 ClickHouse Cloud 导入数据时需要帮助或遇到任何错误，请通过 support@clickhouse.com 与我们联系，我们可以提供协助。
:::
