---
'slug': '/migrations/postgresql/appendix'
'title': '附录'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': '与从 PostgreSQL 迁移相关的附加信息'
'doc_type': 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres 与 ClickHouse：等价与不同概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

来自 OLTP 系统的用户，如果习惯于 ACID 事务，则应注意 ClickHouse 刻意妥协，以在提供性能的同时不完全实现这些功能。如果理解得当，ClickHouse 语义可以提供较高的耐久性保证和高写入吞吐量。我们在下面突出了一些关键概念，用户在从 Postgres 转向 ClickHouse 之前应熟悉。

### 分片与副本 {#shards-vs-replicas}

分片和复制是用于在存储和/或计算成为性能瓶颈时，通过多个 Postgres 实例进行扩展的两种策略。在 Postgres 中，分片涉及将一个大型数据库拆分为更小的可管理部分，分布在多个节点上。然而，Postgres 本身不支持分片。相反，分片可以通过如 [Citus](https://www.citusdata.com/) 的扩展来实现，其中 Postgres 成为一种能够水平扩展的分布式数据库。这种方法使 Postgres 能够通过将负载分配到几台机器上来处理更高的事务率和更大的数据集。分片可以基于行或模式，以提供灵活性，支持诸如事务或分析等工作负载类型。分片在数据管理和查询执行方面可能会引入显著复杂性，因为它需要在多个机器之间进行协调和一致性保证。

与分片不同，副本是额外的 Postgres 实例，包含来自主节点的所有或部分数据。副本用于各种原因，包括增强读取性能和高可用性（HA）场景。物理复制是 Postgres 的一项原生特性，涉及将整个数据库或显著部分复制到另一服务器，包括所有数据库、表和索引。这涉及通过 TCP/IP 从主节点流式传输 WAL 段。相比之下，逻辑复制是一种更高层次的抽象，它基于 `INSERT`、`UPDATE` 和 `DELETE` 操作流式传递更改。尽管物理复制可能产生相同的结果，但它为特定表和操作的目标以及数据转换和支持不同版本的 Postgres 等提供了更大的灵活性。

**相对而言，ClickHouse 的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse 的副本可以被视为类似于 Postgres 的副本，尽管复制是最终一致的，而没有主节点的概念。与 Postgres 不同，分片在 ClickHouse 中是本地支持的。

分片是表数据的一部分。您始终至少拥有一个分片。将数据分片到多个服务器可以在您超出单个服务器的容量时分担负载，所有分片均用于并行运行查询。用户可以手动在不同服务器上为表创建分片，并直接向它们插入数据。或者，可以使用分布式表，并通过分片键定义数据的路由到哪个分片。分片键可以是随机的，也可以是哈希函数的输出。重要的是，一个分片可以由多个副本组成。

副本是数据的副本。ClickHouse 总是至少具有一份数据的副本，因此副本的最小数量为一个。添加数据的第二个副本可提供容错能力，并可能为处理更多查询提供额外的计算（[并行副本](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) 还可以用于为单个查询分配计算，从而降低延迟）。副本是通过 [ReplicatedMergeTree 表引擎](/engines/table-engines/mergetree-family/replication) 实现的，该引擎使 ClickHouse 能够在不同服务器之间保持数据的多个副本同步。复制是物理的：只有压缩的部分在节点之间传输，而不是查询。

总之，副本是提供冗余和可靠性（以及潜在的分布式处理）的数据副本，而分片是允许分布式处理和负载均衡的数据子集。

> ClickHouse Cloud 使用 S3 后备的单一数据副本，并具有多个计算副本。每个副本节点都可以访问数据，并具有本地 SSD 缓存。这仅依赖于通过 ClickHouse Keeper 进行元数据复制。

## 最终一致性 {#eventual-consistency}

ClickHouse 使用 ClickHouse Keeper（C++ ZooKeeper 实现，ZooKeeper 也可以使用）来管理其内部复制机制，主要关注元数据存储和确保最终一致性。Keeper 用于为分布式环境中的每次插入分配唯一的顺序编号。这对维护操作之间的顺序和一致性至关重要。该框架还处理后续操作，如合并和变更，确保这些操作的工作在保证它们在所有副本中执行的相同顺序的同时进行分配。除了元数据之外，Keeper 作为复制的综合控制中心，跟踪存储数据部分的校验和，并充当副本之间的分布式通知系统。

ClickHouse 中的复制过程 (1) 当数据插入到任何副本时开始。此数据以原始插入的形式 (2) 与其校验和一起写入磁盘。一旦写入，副本 (3) 尝试通过分配唯一的块编号并记录新部分的细节，在 Keeper 中注册此新数据部分。其他副本在 (4) 检测到复制日志中的新条目时，将 (5) 通过内部 HTTP 协议下载相应的数据部分，并根据 ZooKeeper 中列出的校验和进行验证。该方法确保所有副本最终持有一致且最新的数据，尽管处理速度不同或可能存在延迟。此外，系统能够并发处理多个操作，从而优化数据管理流程，并允许系统扩展和对硬件差异保持稳健性。

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

请注意，ClickHouse Cloud 使用 [针对云优化的复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)，以适应其存储和计算架构的分离。通过将数据存储在共享对象存储中，数据会自动对所有计算节点可用，而无需在节点之间物理复制数据。相反，Keeper 仅用于在计算节点之间共享元数据（数据在对象存储中的位置）。

PostgreSQL 采用了一种与 ClickHouse 不同的复制策略，主要使用流式复制，这涉及到一个主副本模型，其中数据不断从主节点流式传输到一个或多个副本节点。这种类型的复制确保了近乎实时的一致性，并且是同步或异步的，允许管理员控制可用性和一致性之间的平衡。与 ClickHouse 不同，PostgreSQL 依赖于 WAL（Write-Ahead Logging）与逻辑复制和解码，以在节点之间流式传递数据对象和更改。这种 PostgreSQL 方法更为直接，但在高度分布的环境中，可能无法提供与 ClickHouse 通过其复杂的 Keeper 用于分布式操作协调和最终一致性所实现的相同级别的扩展性和容错性。

## 用户影响 {#user-implications}

在 ClickHouse 中，存在“脏读”的可能性——用户可以向一个副本写入数据，然后从另一个副本读取可能未复制的数据，这源于其通过 Keeper 管理的最终一致性复制模型。该模型强调在分布式系统中的性能和可扩展性，允许副本独立操作并异步同步。因此，新的插入数据可能不会立即在所有副本中可见，这取决于复制延迟以及更改在系统中传播所需的时间。

相反，PostgreSQL 的流式复制模型通常可以通过采用同步复制选项来防止脏读，在这种情况下，主节点等待至少一个副本确认收到数据后再提交事务。这确保一旦事务被提交，就有保证数据在另一个副本中可用。在主节点故障的情况下，副本将确保查询看到已提交的数据，从而维持更严格的一致性级别。

## 建议 {#recommendations}

新用户在使用 ClickHouse 时应意识到这些差异，这些差异会在复制环境中表现出来。通常，在分析数十亿甚至数万亿个数据点时，最终一致性是足够的——在这种情况下，指标通常更稳定，或者由于新数据以高速度持续插入，估算足够。

如果需要，可以通过多种选项增加读取的一致性。两个示例都需要增加复杂性或开销——从而降低查询性能，并使 ClickHouse 扩展变得更加困难。 **我们建议这些方法仅在绝对必要时使用。**

## 一致路由 {#consistent-routing}

为克服最终一致性的某些限制，用户可以确保客户端路由到相同的副本。这在多个用户查询 ClickHouse 时特别有用，并且结果应该在请求之间是确定性的。在结果可能有所不同的情况下，确保查询相同的副本可以确保视图的一致性。

这可以通过几种方法实现，具体取决于您的架构以及是否使用 ClickHouse OSS 或 ClickHouse Cloud。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud 使用 S3 后备的单一数据副本，并具有多个计算副本。数据对每个副本节点可用，且每个副本都有本地 SSD 缓存。为了确保一致的结果，用户只需确保一致路由到相同的节点。

ClickHouse Cloud 服务的节点通信通过代理进行。HTTP 和原生协议连接将在保持打开的期间内路由到同一节点。在大多数客户端的 HTTP 1.1 连接中，这取决于 Keep-Alive 窗口。大多数客户端（例如 Node Js）可以对此进行配置。这还要求在服务器端进行配置，该配置通常高于客户端，并在 ClickHouse Cloud 中设置为 10 秒。

为了确保在连接之间的一致路由，例如，如果使用连接池或连接过期，用户可以确保使用相同的连接（原生更容易）或请求暴露粘性端点。这为集群中的每个节点提供了一组端点，从而允许客户端确保查询的确定性路由。

> 联系支持以访问粘性端点。

## ClickHouse OSS {#clickhouse-oss}

在 OSS 中实现这一行为取决于您的分片和副本拓扑，以及您是否使用 [分布式表](/engines/table-engines/special/distributed) 进行查询。

当只有一个分片和副本（当 ClickHouse 垂直扩展时常见）时，用户在客户端层选择节点并直接查询副本，确保这是被确定性选择的。

虽然没有分布式表的多分片和副本拓扑是可能的，但这种高级部署通常具有自己的路由基础设施。因此，我们假设具有多个分片的部署使用了分布式表（分布式表可以与单分片部署一起使用，但通常没有必要）。

在这种情况下，用户应该根据属性（例如 `session_id` 或 `user_id`）确保一致节点路由。设置 [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)，[`load_balancing=in_order`](/operations/settings/settings#load_balancing) 应 [在查询中设置](/operations/settings/query-level)。这将确保优先选择任何分片的本地副本，否则优先选择配置中列出的副本——前提是它们的错误数量相同——如果错误更多，则将随机选择以进行故障转移。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) 也可以作为这种确定性分片选择的替代方案。

> 创建分布式表时，用户将指定一个集群。此集群定义在 config.xml 中指定，将列出分片（及其副本）- 从而允许用户控制它们从每个节点使用的顺序。通过使用这一点，用户可以确保选择是确定性的。

## 顺序一致性 {#sequential-consistency}

在某些特殊情况下，用户可能需要顺序一致性。

数据库中的顺序一致性是指对数据库的操作似乎以某种顺序执行，并且这一顺序在与数据库交互的所有程序中保持一致。这意味着每个操作在被调用和完成之间似乎都能瞬间生效，并且所有操作都有一个共同商定的顺序。

从用户的角度来看，这通常表现为在 ClickHouse 中写入数据时，并在读取数据时，保证返回最新插入的行。
这可以通过几种方式实现（按优先顺序）：

1. **读/写同一节点** - 如果您使用原生协议，或通过 HTTP 进行写入/读取的 [会话](/interfaces/http#default-database)，则应连接到同一副本：在这种情况下，您直接从写入的节点读取，则您的读取将始终是一致的。
2. **手动同步副本** - 如果您向一个副本写入并从另一个副本读取，则可以在读取之前使用命令 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。
3. **启用顺序一致性** - 通过查询设置 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在 OSS 中，还必须指定设置 `insert_quorum = 'auto'`。

<br />

有关启用这些设置的进一步细节，请参见 [此处](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性将对 ClickHouse Keeper 施加更多负载。结果可能意味着插入和读取变得更慢。ClickHouse Cloud 中作为主要表引擎使用的 SharedMergeTree，其顺序一致性 [开销更小且更具可扩展性](/cloud/reference/shared-merge-tree#consistency)。OSS 用户在使用此方法时应谨慎，并测量 Keeper 的负载。

## 事务 (ACID) 支持 {#transactional-acid-support}

迁移自 PostgreSQL 的用户可能习惯于其对 ACID（原子性、一致性、隔离性、持久性）属性的强大支持，使其成为事务数据库的可靠选择。PostgreSQL 中的原子性确保每个事务被视为一个单一单元，完全成功或完全回滚，从而防止部分更新。通过强制执行约束、触发器和规则来维护一致性，确保所有数据库事务导致有效状态。PostgreSQL 支持从已提交读到可序列化的隔离级别，允许对并发事务所做更改的可见性进行精细控制。最后，通过预写日志（WAL）实现持久性，确保一旦事务被提交，即使在系统故障的情况下也保持不变。

这些属性是充当真实来源的 OLTP 数据库的共同特征。

虽然强大，但这具有固有的限制，并使 PB 规模变得具有挑战性。ClickHouse 在这些属性上进行了妥协，以提供快速的分析查询，同时保持高写入吞吐量。

ClickHouse 在 [有限配置下提供 ACID 属性](/guides/developer/transactional) - 最简单的情况是使用一个分区的非复制的 MergeTree 表引擎。用户不应期望在这些情况之外具备这些属性，并确保这些不是需求。

## 压缩 {#compression}

ClickHouse 的列式存储意味着与 Postgres 相比，压缩通常会显著更好。以下是在比较两个数据库中所有 Stack Overflow 表的存储需求时的示例：

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

有关优化和测量压缩的更多详细信息可以在 [此处](/data-compression/compression-in-clickhouse) 找到。

## 数据类型映射 {#data-type-mappings}

以下表显示了 Postgres 的等效 ClickHouse 数据类型。

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

*\* ClickHouse 对 JSON 的生产支持正在开发中。目前用户可以将 JSON 映射为 String，并使用 [JSON 函数](/sql-reference/functions/json-functions)，或直接将 JSON 映射为 [元组](/sql-reference/data-types/tuple)和 [嵌套](/sql-reference/data-types/nested-data-structures/nested)，如果结构是可预测的。有关 JSON 的更多信息，请参见 [此处](/integrations/data-formats/json/overview).*
