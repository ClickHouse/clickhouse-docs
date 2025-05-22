---
'slug': '/migrations/postgresql/appendix'
'title': '附录'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': '关于从 PostgreSQL 迁移的附加信息'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres vs ClickHouse: 等效与不同概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

来自 OLTP 系统的用户，如果习惯于 ACID 事务，应意识到 ClickHouse 在性能方面做出了一些明确的妥协，因此并未完全提供这些功能。如果能够充分理解 ClickHouse 的语义，它可以提供高持久性保证和高写入吞吐量。我们在下面强调一些关键概念，用户在从 Postgres 切换到 ClickHouse 工作之前应该熟悉。

### Shards vs Replicas {#shards-vs-replicas}

分片和复制是当存储和/或计算成为性能瓶颈时，用于扩展超出单个 Postgres 实例的两种策略。在 Postgres 中，分片涉及将大型数据库划分为多个较小的、更易于管理的部分，并分布在多个节点上。然而，Postgres 并不原生支持分片。相反，可以使用扩展程序如 [Citus](https://www.citusdata.com/) 来实现分片，其中 Postgres 成为一个能够水平扩展的分布式数据库。这种方法允许 Postgres 通过将负载分散到多个机器上，处理更高的事务率和更大的数据集。分片可以是基于行或架构，以便为事务性或分析性等不同工作负载类型提供灵活性。分片会在数据管理和查询执行方面引入重大复杂性，因为这需要在多台机器之间进行协调和一致性保证。

与分片不同，副本是包含主节点所有或部分数据的额外 Postgres 实例。副本用于多种原因，包括提高读取性能和高可用性（HA）场景。物理复制是 Postgres 的一个原生特性，涉及将整个数据库或重要部分复制到另一个服务器，包括所有数据库、表和索引。这包含通过 TCP/IP 从主节点流式传输 WAL 段。相反，逻辑复制是一种更高抽象级别的操作，通过 `INSERT`、`UPDATE` 和 `DELETE` 操作流式传输更改。尽管物理复制也可以实现相同的结果，但为针对特定表和操作、数据转换以及支持不同 Postgres 版本提供了更大的灵活性。

**相对而言，ClickHouse 的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse 副本可以被视为与 Postgres 副本相 analogous，尽管复制是最终一致的，没有主节点的概念。与 Postgres 不同，分片是得到原生支持的。

分片是表数据的一部分。您始终至少有一个分片。将数据分片分布到多个服务器上可以在超出单一服务器的容量时分担负载，所有分片将用于并行运行查询。用户可以手动在不同服务器上为表创建分片，并直接向其插入数据。或者，可以使用分布式表，并通过分片键定义数据路由到哪个分片。分片键可以是随机的或哈希函数的输出。重要的是，一个分片可以由多个副本组成。

副本是数据的副本。ClickHouse 始终至少有一个数据副本，因此副本的最小数量为一个。添加第二个副本可提供容错性，并可能为处理更多查询提供额外计算能力（[Parallel Replicas](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) 还可以用于为单个查询分配计算，从而降低延迟）。通过 [ReplicatedMergeTree 表引擎](/engines/table-engines/mergetree-family/replication) 实现副本，这使得 ClickHouse 可以在不同服务器之间同步多个数据副本。复制是物理的：在节点间传输的是压缩的部分，而不是查询。

总之，副本是提供冗余和可靠性（以及潜在的分布式处理）的数据副本，而分片是允许分布式处理和负载均衡的数据子集。

> ClickHouse Cloud 使用在 S3 上备份的数据单一副本，以及多个计算副本。数据对每个副本节点可用，每个副本节点都有一个本地 SSD 缓存。这仅依赖于 ClickHouse Keeper 之间的元数据复制。

## 最终一致性 {#eventual-consistency}

ClickHouse 使用 ClickHouse Keeper（C++ ZooKeeper 实现，还可以使用 ZooKeeper）来管理其内部复制机制，主要关注元数据存储并确保最终一致性。Keeper 用于在分布式环境中为每个插入分配唯一的顺序号。这对维护操作之间的顺序和一致性至关重要。此框架还处理背景操作，如合并和变更，确保这些工作的分布，同时保证它们在所有副本中以相同的顺序执行。除了元数据，Keeper 还充当复制的综合控制中心，包括跟踪存储数据部分的校验和，并充当副本之间的分布式通知系统。

ClickHouse 中的复制过程（1）在数据插入到任何副本时开始。此数据在其原始插入形式中（2）与其校验和一起写入磁盘。写入后，副本（3）通过分配唯一的块号并记录新部分的详细信息，尝试在 Keeper 中注册此新数据部分。其他副本在（4）检测到复制日志中的新条目后，（5）通过内部 HTTP 协议下载相应的数据部分，并根据 ZooKeeper 中列出的校验和进行验证。这种方法确保所有副本最终持有一致且最新的数据，尽管处理速度可能不同或潜在延迟。此外，该系统能同时处理多个操作，优化数据管理过程，并允许系统在硬件差异面前扩展和保持强健。

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

请注意，ClickHouse Cloud 使用一种 [云优化的复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)，以适应其存储和计算架构的分离。通过将数据存储在共享对象存储中，数据自动对所有计算节点可用，而无需在节点之间物理复制数据。相反，Keeper 仅用于在计算节点之间共享元数据（哪些数据存在于对象存储中）。

PostgreSQL 与 ClickHouse 使用不同的复制策略，主要使用流式复制，涉及主副本模型，其中数据不断从主节点流式传输到一个或多个副本节点。这种类型的复制确保接近实时的一致性，并且是同步或异步的，给管理员控制可用性和一致性之间的平衡。与 ClickHouse 不同，PostgreSQL 依赖于通过逻辑复制和解码的 WAL（预写日志）在节点之间流式传输数据对象和更改。PostgreSQL 的这种方法更简单，但在高度分布的环境中可能无法提供 ClickHouse 通过其复杂使用 Keeper 进行分布式操作协调和最终一致性所实现的相同级别的可扩展性和容错性。

## 用户影响 {#user-implications}

在 ClickHouse 中，由于其通过 Keeper 管理的最终一致性复制模型，可能会出现肮脏读取的情况——用户可以向一个副本写入数据，然后从另一个副本读取潜在的未复制数据。此模型强调性能和分布式系统的可扩展性，允许副本独立操作并异步同步。因此，新增数据在所有副本上可能不会立即可见，这取决于复制延迟和更改传播所需的时间。

相反，PostgreSQL 的流式复制模型通常可以通过采用同步复制选项来防止肮脏读取，其中主节点等待至少一个副本确认收到数据，然后再提交事务。这确保了一旦事务被提交，就有保证在另一个副本中可用。当主节点失败时，副本将确保查询看到已提交的数据，从而维护更严格的一致性级别。

## 推荐 {#recommendations}

首次接触 ClickHouse 的用户应意识到这些差异，这些差异将在复制环境中显现。通常，在处理数十亿，甚至数万亿的数据点的分析时，最终一致性是足够的——在这些情况下，指标要么更稳定，要么估算是足够的，因为新数据以高速度持续插入。

如果需要提高读取的一致性，有几种选项可供选择。这两种示例都需要增加的复杂性或开销——降低查询性能，并使得扩展 ClickHouse 更具挑战性。**我们仅建议在绝对必要时采取这些方法。**

## 一致性路由 {#consistent-routing}

为克服最终一致性的一些限制，用户可以确保客户端路由到相同的副本。这在多个用户查询 ClickHouse 并且结果应该在请求之间确定性的情况下十分有用。虽然结果可能会有所不同，因为新数据被插入，但应该查询相同的副本以确保一致的视图。

这可以通过几种方法实现，具体取决于您的架构以及您是否使用 ClickHouse OSS 或 ClickHouse Cloud。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud 使用在 S3 上备份的数据单一副本，以及多个计算副本。数据对每个副本节点可用，每个副本节点都有一个本地 SSD 缓存。为了确保结果一致，因此用户只需要确保与同一节点的路由一致。

与 ClickHouse Cloud 服务节点的通信通过代理进行。HTTP 和原生协议连接将在保持打开的期间路由到相同的节点。在大多数客户端中，HTTP 1.1 连接的这个取决于 Keep-Alive 窗口。这可以在大多数客户端上进行配置，例如 Node Js。这还需要服务器端配置，该配置将比客户端更高，并在 ClickHouse Cloud 中设置为 10 秒。

为了确保在连接之间一致性路由，例如如果使用连接池或连接过期，用户可以确保使用相同的连接（原生连接更容易处理），或者请求暴露粘性端点。这为集群中的每个节点提供一组端点，从而允许客户端确保查询以确定的方式路由。

> 联系支持以获取粘性端点的访问。

## ClickHouse OSS {#clickhouse-oss}

在 OSS 中实现这种行为取决于您的分片和副本拓扑，以及您是否使用用于查询的 [Distributed table](/engines/table-engines/special/distributed)。

当您只有一个分片和副本时（由于 ClickHouse 支持垂直扩展而常见），用户在客户端层进行节点选择并直接查询副本，确保这是确定性选择的。

虽然没有分布式表的情况下，可以实现具有多个分片和副本的拓扑，但这些高级部署通常具有自己的路由基础设施。因此，我们假设具有多个分片的部署使用分布式表（分布式表可以与单个分片部署一起使用，但通常不必要）。

在这种情况下，用户应确保基于某一属性（例如 `session_id` 或 `user_id`）进行一致性节点路由。设置 [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)，[`load_balancing=in_order`](/operations/settings/settings#load_balancing) 应该在 [查询中设置](/operations/settings/query-level)。这将确保任何本地副本被优先选择，而其他副本则按照配置中列出的顺序被优先选择- 只要它们具有相同数量的错误 - 如果错误更高，则会随机选择进行故障转移。作为该确定性分片选择的替代， [`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) 也可以使用。

> 创建分布式表时，用户将指定一个集群。该集群定义在 config.xml 中，将列出分片（及其副本）的信息，从而允许用户控制它们从每个节点被使用的顺序。利用这一点，用户可以确保选择是确定的。

## 顺序一致性 {#sequential-consistency}

在特殊情况下，用户可能需要顺序一致性。

数据库中的顺序一致性是数据库上的操作似乎以某种顺序执行，并且该顺序在与数据库交互的所有进程中是一致的。这意味着每个操作似乎在其调用和完成之间即时生效，并且存在所有操作被任何进程观察到的单一、被一致同意的顺序。

从用户的角度看，这通常表现为需要写入数据到 ClickHouse，当读取数据时，确保返回最新插入的行。
这可以通过几种方式实现（按优先级顺序）：

1. **读/写到同一节点** - 如果您使用原生协议，或通过 HTTP [会话进行读/写](/interfaces/http#default-database)，那么您应该连接到同一副本：在这种情况下，您直接从写入的节点读取，那么您的读取将始终保持一致。
2. **手动同步副本** - 如果您向一个副本写入，并从另一个副本读取，则可以在读取之前使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。
3. **启用顺序一致性** - 通过查询设置 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在 OSS 中，还必须指定设置 `insert_quorum = 'auto'`。

<br />

有关启用这些设置的更多详细信息，请查看 [这里](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性将给 ClickHouse Keeper 带来更大的负担。其结果可能意味着插入和读取速度较慢。在 ClickHouse Cloud 中使用的 SharedMergeTree 作为主要表引擎，顺序一致性 [产生的开销更少且可扩展性更好](/cloud/reference/shared-merge-tree#consistency)。 OSS 用户应谨慎使用这种方法，并衡量 Keeper 负载。

## 事务性（ACID）支持 {#transactional-acid-support}

从 PostgreSQL 迁移的用户可能习惯于它对 ACID（原子性、一致性、隔离性、持久性）属性的强大支持，使其成为事务数据库的可靠选择。在 PostgreSQL 中，原子性确保每个事务被视为一个单一单元，完全成功或完全回滚，防止部分更新。一致性通过强制执行约束、触发器和规则得以维护，确保所有数据库事务导致有效状态。支持的隔离级别从已提交读到可串行化，允许对并发事务所做更改的可见性进行细致控制。最后，持久性通过预写日志 (WAL) 来实现，确保一旦事务被提交，即使在系统故障时也能保持不变。

这些属性在充当真实数据来源的 OLTP 数据库中是常见的。

虽然强大，但这带来了固有的限制，并使 PB 规模面临挑战。ClickHouse 在这些属性上做出了妥协，以提供快速的大规模分析查询，同时维持高吞吐率的写入。

ClickHouse 在 [有限配置](/guides/developer/transactional) 下提供 ACID 属性 - 最简单的情况下是使用具有一个分区的非复制实例的 MergeTree 表引擎。用户不应该期望这些属性外的情况，并确保这些不是需求。

## 压缩 {#compression}

ClickHouse 的列式存储意味着与 Postgres 相比，压缩效果通常会显著更好。以下是比较两种数据库中所有 Stack Overflow 表的存储需求的示例：

```sql title="Query (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="Query (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="Response"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB       │
│ users       │ 846.57 MiB      │
│ badges      │ 513.13 MiB      │
│ comments    │ 7.11 GiB        │
│ votes       │ 1.28 GiB        │
│ posthistory │ 40.44 GiB       │
│ postlinks   │ 79.22 MiB       │
└─────────────┴─────────────────┘
```

关于优化和测量压缩的更多详细信息可以在 [这里](/data-compression/compression-in-clickhouse) 找到。

## 数据类型映射 {#data-type-mappings}

下表显示了 Postgres 的等效 ClickHouse 数据类型。

| Postgres 数据类型 | ClickHouse 类型 |
| --- | --- |
| `DATE` | [Date](/sql-reference/data-types/date) |
| `TIMESTAMP` | [DateTime](/sql-reference/data-types/datetime) |
| `REAL` | [Float32](/sql-reference/data-types/float) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float) |
| `DECIMAL, NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `SMALLINT` | [Int16](/sql-reference/data-types/int-uint) |
| `INTEGER` | [Int32](/sql-reference/data-types/int-uint) |
| `BIGINT` | [Int64](/sql-reference/data-types/int-uint) |
| `SERIAL` | [UInt32](/sql-reference/data-types/int-uint) |
| `BIGSERIAL` | [UInt64](/sql-reference/data-types/int-uint) |
| `TEXT, CHAR, BPCHAR` | [String](/sql-reference/data-types/string) |
| `INTEGER` | Nullable([Int32](/sql-reference/data-types/int-uint)) |
| `ARRAY` | [Array](/sql-reference/data-types/array) |
| `FLOAT4` | [Float32](/sql-reference/data-types/float) |
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean) |
| `VARCHAR` | [String](/sql-reference/data-types/string) |
| `BIT` | [String](/sql-reference/data-types/string) |
| `BIT VARYING` | [String](/sql-reference/data-types/string) |
| `BYTEA` | [String](/sql-reference/data-types/string) |
| `NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `GEOGRAPHY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `GEOMETRY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `INET` | [IPv4](/sql-reference/data-types/ipv4), [IPv6](/sql-reference/data-types/ipv6) |
| `MACADDR` | [String](/sql-reference/data-types/string) |
| `CIDR` | [String](/sql-reference/data-types/string) |
| `HSTORE` | [Map(K, V)](/sql-reference/data-types/map), [Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant)) |
| `UUID` | [UUID](/sql-reference/data-types/uuid) |
| `ARRAY<T>` | [ARRAY(T)](/sql-reference/data-types/array) |
| `JSON*` | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB` | [String](/sql-reference/data-types/string) |

*\* ClickHouse 对 JSON 的生产支持正在开发中。目前用户可以将 JSON 映射为字符串，并使用 [JSON 函数](/sql-reference/functions/json-functions)，或者将 JSON 直接映射到 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested)，如果结构可预测。有关 JSON 的更多信息，请查看 [这里](/integrations/data-formats/json/overview).*
