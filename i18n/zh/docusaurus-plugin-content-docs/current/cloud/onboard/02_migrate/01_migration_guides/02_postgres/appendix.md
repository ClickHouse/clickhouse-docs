---
slug: /migrations/postgresql/appendix
title: '附录'
keywords: ['postgres', 'postgresql', 'data types', 'types']
description: '关于从 PostgreSQL 迁移的补充信息'
doc_type: 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';


## Postgres 与 ClickHouse:相同与不同的概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

来自 OLTP 系统且习惯于 ACID 事务的用户应该了解,ClickHouse 为了追求性能而有意在这些特性上做出了妥协,并未完全提供 ACID 保证。如果充分理解 ClickHouse 的语义,它可以提供高持久性保证和高写入吞吐量。下面我们重点介绍一些用户在从 Postgres 转向 ClickHouse 之前应该熟悉的关键概念。

### 分片与副本 {#shards-vs-replicas}

当存储和/或计算成为性能瓶颈时,分片和复制是用于扩展单个 Postgres 实例的两种策略。Postgres 中的分片是指将大型数据库拆分为跨多个节点的更小、更易管理的片段。然而,Postgres 本身并不原生支持分片。相反,可以使用诸如 [Citus](https://www.citusdata.com/) 之类的扩展来实现分片,使 Postgres 成为能够水平扩展的分布式数据库。这种方法通过将负载分散到多台机器上,使 Postgres 能够处理更高的事务速率和更大的数据集。分片可以基于行或模式,以便为事务型或分析型等不同工作负载类型提供灵活性。分片可能会在数据管理和查询执行方面引入显著的复杂性,因为它需要跨多台机器的协调和一致性保证。

与分片不同,副本是包含主节点全部或部分数据的额外 Postgres 实例。副本用于多种目的,包括增强读取性能和高可用性(HA)场景。物理复制是 Postgres 的原生特性,涉及将整个数据库或重要部分复制到另一台服务器,包括所有数据库、表和索引。这涉及通过 TCP/IP 将 WAL 段从主节点流式传输到副本。相比之下,逻辑复制是更高层次的抽象,基于 `INSERT`、`UPDATE` 和 `DELETE` 操作流式传输变更。尽管物理复制可能实现相同的结果,但逻辑复制在针对特定表和操作、数据转换以及支持不同 Postgres 版本方面提供了更大的灵活性。

**相比之下,ClickHouse 的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse 副本可以被视为类似于 Postgres 副本,但复制是最终一致的,没有主节点的概念。与 Postgres 不同,ClickHouse 原生支持分片。

分片是表数据的一部分。您始终至少有一个分片。如果超出单台服务器的容量,可以使用跨多台服务器的数据分片来分担负载,所有分片用于并行运行查询。用户可以在不同服务器上手动为表创建分片,并直接向其中插入数据。或者,可以使用分布式表,通过分片键定义数据路由到哪个分片。分片键可以是随机的,也可以是哈希函数的输出。重要的是,一个分片可以由多个副本组成。

副本是数据的副本。ClickHouse 始终至少有一份数据副本,因此副本的最小数量为一。添加第二个数据副本可以提供容错能力,并可能为处理更多查询提供额外的计算资源([并行副本](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)也可用于分配单个查询的计算,从而降低延迟)。副本通过 [ReplicatedMergeTree 表引擎](/engines/table-engines/mergetree-family/replication)实现,该引擎使 ClickHouse 能够在不同服务器之间保持多份数据副本同步。复制是物理的:节点之间仅传输压缩的数据部分,而不是查询。

总之,副本是提供冗余和可靠性(以及潜在的分布式处理)的数据副本,而分片是允许分布式处理和负载均衡的数据子集。

> ClickHouse Cloud 使用存储在 S3 中的单份数据副本,配合多个计算副本。数据对每个副本节点可用,每个节点都有本地 SSD 缓存。这仅依赖于通过 ClickHouse Keeper 进行的元数据复制。


## 最终一致性 {#eventual-consistency}

ClickHouse 使用 ClickHouse Keeper(ZooKeeper 的 C++ 实现,也可以使用 ZooKeeper)来管理其内部复制机制,主要侧重于元数据存储并确保最终一致性。Keeper 用于在分布式环境中为每次插入分配唯一的顺序编号。这对于维护操作的顺序性和一致性至关重要。该框架还处理后台操作,如合并和变更,确保这些工作以分布式方式执行,同时保证它们在所有副本上以相同的顺序执行。除了元数据之外,Keeper 还充当复制的综合控制中心,包括跟踪存储数据部分的校验和,并在副本之间充当分布式通知系统。

ClickHouse 中的复制过程 (1) 从数据插入任何副本时开始。这些数据以其原始插入形式 (2) 与其校验和一起写入磁盘。写入完成后,副本 (3) 尝试通过分配唯一的块编号并记录新部分的详细信息,在 Keeper 中注册这个新数据部分。其他副本在 (4) 检测到复制日志中的新条目后,(5) 通过内部 HTTP 协议下载相应的数据部分,并根据 ZooKeeper 中列出的校验和进行验证。这种方法确保所有副本最终都能保持一致且最新的数据,即使处理速度或潜在延迟可能有所不同。此外,该系统能够并发处理多个操作,优化数据管理流程,并使系统具有可扩展性和对硬件差异的容错能力。

<Image img={postgresReplicas} size='md' alt='最终一致性' />

请注意,ClickHouse Cloud 使用[云优化的复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates),该机制适配其存储与计算分离的架构。通过将数据存储在共享对象存储中,数据自动对所有计算节点可用,无需在节点之间物理复制数据。相反,Keeper 仅用于在计算节点之间共享元数据(哪些数据存在于对象存储的何处)。

与 ClickHouse 相比,PostgreSQL 采用不同的复制策略,主要使用流式复制,这涉及主副本模型,其中数据从主节点持续流式传输到一个或多个副本节点。这种类型的复制确保接近实时的一致性,并且可以是同步或异步的,使管理员能够控制可用性和一致性之间的平衡。与 ClickHouse 不同,PostgreSQL 依赖于 WAL(预写日志)以及逻辑复制和解码来在节点之间流式传输数据对象和变更。PostgreSQL 中的这种方法更为直接,但在高度分布式环境中可能无法提供与 ClickHouse 相同级别的可扩展性和容错能力,而 ClickHouse 通过复杂地使用 Keeper 进行分布式操作协调和最终一致性来实现这些能力。


## 用户影响 {#user-implications}

在 ClickHouse 中,可能会出现脏读现象——即用户可以向一个副本写入数据,然后从另一个副本读取到尚未完成复制的数据——这源于其通过 Keeper 管理的最终一致性复制模型。该模型侧重于分布式系统的性能和可扩展性,允许副本独立运行并异步同步。因此,新插入的数据可能无法立即在所有副本中可见,具体取决于复制延迟以及变更在系统中传播所需的时间。

相反,PostgreSQL 的流式复制模型通常可以通过同步复制选项来避免脏读,即主节点在提交事务之前会等待至少一个副本确认已接收数据。这确保了事务一旦提交,就能保证数据已在另一个副本中可用。当主节点发生故障时,副本将确保查询能够读取到已提交的数据,从而维持更严格的一致性级别。


## 建议 {#recommendations}

ClickHouse 新用户应当了解这些差异，它们会在复制环境中表现出来。通常情况下，在对数十亿甚至数万亿数据点进行分析时，最终一致性已经足够——在这种场景下，指标要么相对稳定，要么估算值已能满足需求，因为新数据正在以高速率持续写入。

如果确实需要提高读取的一致性，可以采用几种方案。但这些方案都会增加复杂性或开销——降低查询性能并使 ClickHouse 的扩展更具挑战性。**我们建议仅在绝对必要时才采用这些方法。**


## 一致性路由 {#consistent-routing}

为了克服最终一致性的某些局限性,用户可以确保客户端路由到相同的副本。这在多个用户查询 ClickHouse 且需要跨请求获得确定性结果的场景中非常有用。虽然随着新数据的插入结果可能会发生变化,但通过查询相同的副本可以确保获得一致的视图。

根据您的架构以及使用的是 ClickHouse OSS 还是 ClickHouse Cloud,可以通过多种方式来实现这一点。


## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud 使用存储在 S3 中的单一数据副本,配合多个计算副本。每个副本节点都可以访问数据,并拥有本地 SSD 缓存。为确保结果一致性,用户只需确保请求始终路由到同一节点即可。

与 ClickHouse Cloud 服务节点的通信通过代理进行。HTTP 和 Native 协议连接在保持打开状态期间会被路由到同一节点。对于大多数客户端的 HTTP 1.1 连接,这取决于 Keep-Alive 窗口。该参数可以在大多数客户端上配置,例如 Node.js。这还需要服务器端配置,服务器端的值会高于客户端,在 ClickHouse Cloud 中设置为 10 秒。

为确保跨连接的一致路由(例如使用连接池或连接过期时),用户可以确保使用同一连接(对于 Native 协议更容易),或者请求启用粘性端点。粘性端点为集群中的每个节点提供一组专用端点,从而允许客户端确保查询被确定性地路由。

> 请联系支持团队以获取粘性端点的访问权限。


## ClickHouse OSS {#clickhouse-oss}

在 OSS 中实现此行为取决于您的分片和副本拓扑结构,以及是否使用 [Distributed 表](/engines/table-engines/special/distributed)进行查询。

当您只有一个分片和多个副本时(由于 ClickHouse 支持垂直扩展,这种情况很常见),用户在客户端层选择节点并直接查询副本,从而确保以确定性方式进行选择。

虽然在没有分布式表的情况下也可以实现多分片和副本的拓扑结构,但这些高级部署通常具有自己的路由基础设施。因此,我们假设具有多个分片的部署会使用 Distributed 表(分布式表也可以用于单分片部署,但通常没有必要)。

在这种情况下,用户应确保基于某个属性(例如 `session_id` 或 `user_id`)执行一致的节点路由。应在[查询中设置](/operations/settings/query-level) [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica) 和 [`load_balancing=in_order`](/operations/settings/settings#load_balancing) 这些参数。这将确保优先选择分片的本地副本,否则按配置中列出的顺序优先选择副本——前提是它们的错误数量相同——如果错误数量较高,则会随机选择进行故障转移。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) 也可以作为这种确定性分片选择的替代方案。

> 创建 Distributed 表时,用户需要指定一个集群。在 config.xml 中指定的集群定义将列出分片(及其副本),从而允许用户控制从每个节点使用它们的顺序。通过这种方式,用户可以确保选择是确定性的。


## 顺序一致性 {#sequential-consistency}

在特殊情况下,用户可能需要顺序一致性。

数据库中的顺序一致性是指数据库操作看起来按某种顺序执行,并且这个顺序在与数据库交互的所有进程中保持一致。这意味着每个操作在其调用和完成之间看起来都是瞬间生效的,并且所有进程观察到的所有操作都遵循一个统一的、一致认可的顺序。

从用户的角度来看,这通常表现为需要将数据写入 ClickHouse,并在读取数据时保证返回最新插入的行。
这可以通过以下几种方式实现(按优先级排序):

1. **在同一节点上读写** - 如果您使用原生协议,或使用 [会话通过 HTTP 进行读写](/interfaces/http#default-database),那么您应该连接到同一个副本:在这种情况下,您直接从写入的节点读取,那么您的读取将始终保持一致。
1. **手动同步副本** - 如果您写入一个副本并从另一个副本读取,可以在读取之前执行 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 命令。
1. **启用顺序一致性** - 通过查询设置 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在开源版本中,还必须指定设置 `insert_quorum = 'auto'`。

<br />

有关启用这些设置的更多详细信息,请参阅[此处](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性会给 ClickHouse Keeper 带来更大的负载,可能导致插入和读取速度变慢。SharedMergeTree 作为 ClickHouse Cloud 中的主要表引擎,其顺序一致性[产生的开销更少且扩展性更好](/cloud/reference/shared-merge-tree#consistency)。开源版本用户应谨慎使用此方法并监测 Keeper 负载。


## 事务（ACID）支持 {#transactional-acid-support}

从 PostgreSQL 迁移过来的用户可能已经习惯了其对 ACID（原子性、一致性、隔离性、持久性）属性的强大支持，这使其成为事务型数据库的可靠选择。PostgreSQL 中的原子性确保每个事务被视为一个单独的单元，要么完全成功，要么完全回滚，从而防止部分更新。一致性通过强制执行约束、触发器和规则来维护，这些机制保证所有数据库事务都会达到有效状态。PostgreSQL 支持从读已提交到可串行化的隔离级别,允许对并发事务所做更改的可见性进行精细控制。最后，持久性通过预写日志（WAL）实现，确保事务一旦提交，即使在系统故障的情况下也会保持已提交状态。

这些属性是作为真实数据源的 OLTP 数据库的常见特性。

虽然功能强大，但这也带来了固有的限制，使得 PB 级扩展面临挑战。ClickHouse 在这些属性上做出了权衡，以便在保持高写入吞吐量的同时提供大规模的快速分析查询能力。

ClickHouse 在[有限配置](/guides/developer/transactional)下提供 ACID 属性——最简单的情况是使用具有单个分区的非复制 MergeTree 表引擎实例。用户不应期望在这些情况之外获得这些属性，并应确保这些不是必需的。


## 压缩 {#compression}

ClickHouse 的列式存储意味着相比 Postgres，压缩效果通常会显著更好。以下展示了两个数据库中所有 Stack Overflow 表的存储需求对比：

```sql title="查询 (Postgres)"
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

```sql title="查询 (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="响应"
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

有关优化和测量压缩的更多详细信息，请参阅[此处](/data-compression/compression-in-clickhouse)。


## 数据类型映射 {#data-type-mappings}

下表展示了 Postgres 数据类型与 ClickHouse 数据类型的对应关系。

| Postgres 数据类型   | ClickHouse 类型                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATE`               | [Date](/sql-reference/data-types/date)                                                                                                                                                                                               |
| `TIMESTAMP`          | [DateTime](/sql-reference/data-types/datetime)                                                                                                                                                                                       |
| `REAL`               | [Float32](/sql-reference/data-types/float)                                                                                                                                                                                           |
| `DOUBLE`             | [Float64](/sql-reference/data-types/float)                                                                                                                                                                                           |
| `DECIMAL, NUMERIC`   | [Decimal](/sql-reference/data-types/decimal)                                                                                                                                                                                         |
| `SMALLINT`           | [Int16](/sql-reference/data-types/int-uint)                                                                                                                                                                                          |
| `INTEGER`            | [Int32](/sql-reference/data-types/int-uint)                                                                                                                                                                                          |
| `BIGINT`             | [Int64](/sql-reference/data-types/int-uint)                                                                                                                                                                                          |
| `SERIAL`             | [UInt32](/sql-reference/data-types/int-uint)                                                                                                                                                                                         |
| `BIGSERIAL`          | [UInt64](/sql-reference/data-types/int-uint)                                                                                                                                                                                         |
| `TEXT, CHAR, BPCHAR` | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `INTEGER`            | Nullable([Int32](/sql-reference/data-types/int-uint))                                                                                                                                                                                |
| `ARRAY`              | [Array](/sql-reference/data-types/array)                                                                                                                                                                                             |
| `FLOAT4`             | [Float32](/sql-reference/data-types/float)                                                                                                                                                                                           |
| `BOOLEAN`            | [Bool](/sql-reference/data-types/boolean)                                                                                                                                                                                            |
| `VARCHAR`            | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `BIT`                | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `BIT VARYING`        | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `BYTEA`              | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `NUMERIC`            | [Decimal](/sql-reference/data-types/decimal)                                                                                                                                                                                         |
| `GEOGRAPHY`          | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon)                               |
| `GEOMETRY`           | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon)                               |
| `INET`               | [IPv4](/sql-reference/data-types/ipv4), [IPv6](/sql-reference/data-types/ipv6)                                                                                                                                                       |
| `MACADDR`            | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `CIDR`               | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `HSTORE`             | [Map(K, V)](/sql-reference/data-types/map), [Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant))                                                                                                     |
| `UUID`               | [UUID](/sql-reference/data-types/uuid)                                                                                                                                                                                               |
| `ARRAY<T>`           | [ARRAY(T)](/sql-reference/data-types/array)                                                                                                                                                                                          |
| `JSON*`              | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB`              | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |

_\* ClickHouse 对 JSON 的生产环境支持正在开发中。目前用户可以将 JSON 映射为 String 类型并使用 [JSON 函数](/sql-reference/functions/json-functions)，或者在结构可预测的情况下将 JSON 直接映射到 [Tuple](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested) 类型。更多关于 JSON 的信息请参阅[此处](/integrations/data-formats/json/overview)。_
