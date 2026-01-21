---
slug: /migrations/postgresql/appendix
title: '附录'
keywords: ['postgres', 'postgresql', '数据类型', '类型']
description: '有关从 PostgreSQL 迁移的补充信息'
doc_type: 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';


## Postgres 与 ClickHouse：相同与不同的概念 \{#postgres-vs-clickhouse-equivalent-and-different-concepts\}

来自 OLTP 系统、习惯使用 ACID 事务的用户需要注意，ClickHouse 为了性能有意选择不完全提供这些特性。只要理解得当，ClickHouse 的语义依然可以提供很高的持久性保证和高写入吞吐量。下面我们重点介绍一些关键概念，Postgres 用户在使用 ClickHouse 前应先熟悉这些概念。

### 分片与副本 \{#shards-vs-replicas\}

当存储和/或计算成为性能瓶颈时，分片和复制是两种用于扩展到单个 Postgres 实例之外的策略。Postgres 中的分片涉及将一个大型数据库拆分为更小、更易管理的部分，并分布到多个节点上。然而，Postgres 本身并不原生支持分片。相反，可以通过诸如 [Citus](https://www.citusdata.com/) 这样的扩展实现分片，此时 Postgres 成为一个能够横向扩展的分布式数据库。这种方式允许 Postgres 通过将负载分散到多台机器上来处理更高的事务速率和更大的数据集。分片可以按行或按 schema 进行，以便为不同类型的工作负载（例如事务型或分析型）提供灵活性。分片会在数据管理和查询执行方面引入显著复杂度，因为它需要在多台机器之间进行协调并提供一致性保证。

与分片不同，副本是额外的 Postgres 实例，这些实例包含来自主节点的全部或部分数据。使用副本有多种原因，包括增强读性能和满足 HA（高可用）场景。物理复制是 Postgres 的原生特性，它涉及将整个数据库或其重要部分复制到另一台服务器上，包括所有数据库、表和索引。这通过在 TCP/IP 上从主节点向副本节点持续传输 WAL 段来实现。相较之下，逻辑复制则是更高层次的抽象，它基于 `INSERT`、`UPDATE` 和 `DELETE` 操作来流式传输变更。尽管在结果上可能与物理复制类似，但逻辑复制在针对特定表和操作、执行数据转换以及支持不同 Postgres 版本方面提供了更大的灵活性。

**相比之下，ClickHouse 的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse 副本可以被视为类比于 Postgres 副本，尽管 ClickHouse 的复制是最终一致的且没有「主节点」的概念。与 Postgres 不同，ClickHouse 原生支持分片。

分片是表数据的一部分。你始终至少有一个分片。将数据分片到多台服务器上可以在单个服务器容量不足时分担负载，并且所有分片都会参与并行执行查询。用户可以在不同服务器上为某个表手动创建分片，并直接向这些分片写入数据。或者，也可以使用分布式表，通过分片键来定义数据应路由到哪个分片。分片键可以是随机的，也可以是哈希函数的输出。重要的是，一个分片可以由多个副本组成。

副本是数据的一份拷贝。ClickHouse 始终至少保留一份你的数据副本，因此副本的最小数量为 1。增加第二个副本可以提供容错能力，并潜在地提供额外计算资源以处理更多查询（[Parallel Replicas](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) 也可以用来为单个查询分布计算，从而降低延迟）。副本是通过 [ReplicatedMergeTree table engine](/engines/table-engines/mergetree-family/replication) 实现的，它使 ClickHouse 能够在不同服务器之间保持多个数据副本的一致。复制是物理层面的：在节点之间传输的只有压缩后的数据分片（part），而不是查询。

总结来说，副本是提供冗余和可靠性（以及潜在的分布式处理能力）的一份数据拷贝，而分片是数据的一个子集，用于实现分布式处理和负载均衡。

> ClickHouse Cloud 使用位于 S3 上的单份数据副本，并搭配多个计算副本。每个副本节点都可以访问这份数据，并且各自拥有本地 SSD 缓存。这仅依赖通过 ClickHouse Keeper 进行的元数据复制。

## 最终一致性 \{#eventual-consistency\}

ClickHouse 使用 ClickHouse Keeper（ZooKeeper 的 C++ 实现，也可以直接使用 ZooKeeper）来管理其内部复制机制，主要负责元数据存储并确保最终一致性。Keeper 用于在分布式环境中为每次插入分配唯一的顺序号，这对于在各类操作中维持顺序和一致性至关重要。该框架还负责处理诸如合并（merge）和变更（mutation）等后台操作，确保这些工作在副本之间分布执行的同时，在所有副本上都以相同顺序执行。除了元数据之外，Keeper 还充当复制的统一控制中心，包括跟踪已存储数据分片的校验和，并作为副本之间的分布式通知系统。

ClickHouse 中的复制过程 (1) 从数据被插入任意一个副本开始。此数据以其原始插入形式 (2) 连同校验和一起写入磁盘。写入完成后，该副本 (3) 尝试在 Keeper 中注册这一新的数据分片，为其分配唯一的块编号并记录该分片的详细信息。其他副本在 (4) 检测到复制日志中的新条目后，会 (5) 通过内部 HTTP 协议下载相应的数据分片，并依据 ZooKeeper 中记录的校验和进行验证。此方法确保尽管各副本的处理速度不同或可能存在延迟，所有副本最终都能拥有一致且最新的数据。此外，系统能够并发处理多个操作，从而优化数据管理流程，并在面对硬件差异时实现系统的可扩展性和健壮性。

<Image img={postgresReplicas} size="md" alt="最终一致性"/>

需要注意的是，ClickHouse Cloud 使用的是一种针对云环境优化的[复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)，以适配其存储与计算分离的架构。通过将数据存储在共享对象存储中，所有计算节点无需在节点之间进行物理数据复制即可自动访问这些数据。Keeper 仅用于在计算节点之间共享元数据（对象存储中有哪些数据以及数据的位置）。

与 ClickHouse 相比，PostgreSQL 采用了不同的复制策略，主要使用流复制（streaming replication），其特点是主–从（primary–replica）模型，数据会从 primary 持续流式传输到一个或多个 replica 节点。这种复制方式能够实现近实时一致性，并且可以配置为同步或异步复制，使管理员可以在可用性与一致性之间进行权衡。与 ClickHouse 不同，PostgreSQL 依赖 WAL（Write-Ahead Logging，预写日志）以及逻辑复制与解码，在节点之间流式传输数据对象及其变更。PostgreSQL 中的这种方式相对更加直接，但在高度分布式环境中，其可扩展性和容错能力可能不及 ClickHouse 借助 Keeper 对分布式操作进行复杂协调并实现最终一致性所达到的水平。

## 对用户的影响 \{#user-implications\}

在 ClickHouse 中，发生脏读的可能性——即你可以将数据写入一个副本，然后从另一个副本读取到可能尚未完成复制的数据——源于其由 Keeper 管理的最终一致性复制模型。该模型强调在分布式系统中的性能和可扩展性，使各个副本能够独立运行，并以异步方式进行数据同步。其结果是，取决于复制延迟以及变更在系统中传播所需的时间，新插入的数据可能无法立即在所有副本上可见。

相比之下，PostgreSQL 的流复制模型通常可以通过采用同步复制选项来防止脏读，此时主库会在提交事务前等待至少一个副本确认已接收数据。这确保了一旦事务被提交，即可保证在另一副本中已存在该数据。在主库发生故障的情况下，副本将确保查询能够看到已提交的数据，从而维持更严格的一致性级别。

## 建议 \{#recommendations\}

刚接触 ClickHouse 的用户应当了解以下差异，这些差异会在副本环境中体现出来。通常，对于包含数十亿甚至数万亿数据点的分析场景而言，最终一致性已经足够——在这类场景中，指标往往更加稳定，或者在新数据持续高速写入的前提下，采用估算值也已可以接受。

如果需要提升读取一致性，可以采用若干可选方案。下面的两种方案都需要增加系统复杂度或资源开销——从而降低查询性能，并使 ClickHouse 的扩展更加困难。**我们仅在绝对必要时才建议采用这些方案。**

## 一致性路由 \{#consistent-routing\}

为克服最终一致性的一些限制，您可以确保客户端始终被路由到相同的副本。在多个用户查询 ClickHouse 且希望跨请求获得确定性结果的场景下，这一点非常有用。虽然随着新数据的插入，结果可能会有所不同，但应始终查询相同的副本，以保证视图的一致性。

根据您的架构，以及您使用的是 ClickHouse OSS 还是 ClickHouse Cloud，可以通过多种方式实现这一点。

## ClickHouse Cloud \{#clickhouse-cloud\}

ClickHouse Cloud 在 S3 上只保留一份数据副本，并配合多个计算副本使用。每个副本节点都可以访问这份数据，并且拥有本地 SSD 缓存。为了确保结果一致，用户只需要保证请求始终被路由到同一节点即可。

与 ClickHouse Cloud 服务中各节点的通信是通过代理完成的。HTTP 和 Native 协议连接在保持打开期间会被路由到同一个节点。对于大多数客户端发起的 HTTP 1.1 连接，这取决于 Keep-Alive 窗口。该参数可以在大多数客户端中配置，例如 Node.js。同时也需要在服务端进行配置，该配置需要高于客户端设置，并且在 ClickHouse Cloud 中默认设置为 10 秒。

为了在多个连接之间确保一致的路由，例如在使用连接池或连接过期的情况下，用户可以选择确保复用同一个连接（对 Native 协议而言更容易），或者请求暴露 sticky endpoints。这样就会为集群中的每个节点提供一组 endpoints，从而使客户端可以确保查询被确定性地路由。

> 请联系技术支持以获取 sticky endpoints 的访问权限。

## ClickHouse OSS \{#clickhouse-oss\}

在 OSS 中实现此行为取决于你的分片与副本拓扑结构，以及在查询时是否使用了 [Distributed table](/engines/table-engines/special/distributed)。

当你只有一个分片和多个副本时（很常见，因为 ClickHouse 通常通过纵向扩展进行伸缩），用户会在客户端层面选择节点并直接查询某个副本，从而确保该副本以确定性的方式被选中。

虽然在没有 distributed table 的情况下也可以使用包含多个分片和副本的拓扑结构，但这类高级部署通常拥有自己的路由基础设施。因此，我们假定具有多个分片的部署都在使用 Distributed table（distributed tables 也可以用于单分片部署，但通常没有必要）。

在这种情况下，你应确保基于某个属性（例如 `session_id` 或 `user_id`）执行一致的节点路由。设置项 [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)、[`load_balancing=in_order`](/operations/settings/settings#load_balancing) 应该[在查询中设置](/operations/settings/query-level)。这将确保优先使用各分片在本地的副本；否则将在配置中列出的副本顺序中进行优先选择——在各副本错误次数相同的情况下，将按该顺序选择；一旦某个副本的错误次数更高，将通过随机选择进行故障转移。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) 也可以作为实现这种确定性分片选择的替代方案。

> 在创建 Distributed table 时，你需要指定一个 cluster。这个在 config.xml 中定义的 cluster 会列出分片（以及它们的副本），从而允许你控制从每个节点使用它们的顺序。通过这一点，你可以确保选择是确定性的。

## 顺序一致性 \{#sequential-consistency\}

在特殊情况下，用户可能需要顺序一致性。

数据库中的顺序一致性是指，对数据库的操作看起来按某个顺序串行执行，并且所有与数据库交互的进程看到的顺序保持一致。也就是说，每个操作在其调用与完成之间看起来是瞬时生效的，且存在一个单一且一致认可的顺序，所有进程都是按照这个顺序观察到各个操作的。

从用户的角度来看，这通常表现为：在向 ClickHouse 写入数据后，在读取数据时需要保证返回的是最新插入的行。
这可以通过多种方式实现（按推荐顺序排列）：

1. **在同一节点上读/写** - 如果你使用的是原生协议，或者使用 [session 通过 HTTP 进行写/读](/interfaces/http#default-database)，那么你应当连接到同一副本：在这种场景下，你是直接从写入的那个节点进行读取，因此读操作将始终是一致的。
1. **手动同步副本** - 如果你向一个副本写入并从另一个副本读取，可以在读取之前执行 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。
1. **启用顺序一致性** - 通过查询设置 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在 OSS 中，还必须同时指定设置 `insert_quorum = 'auto'`。

<br />

有关启用这些设置的更多详细说明，请参见[此处](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性会对 ClickHouse Keeper 施加更大负载，这可能会导致写入和读取变慢。SharedMergeTree 作为 ClickHouse Cloud 中主要的表引擎，在启用顺序一致性时[引入的开销更小且可伸缩性更好](/cloud/reference/shared-merge-tree#consistency)。在 OSS 中，用户应谨慎采用这种方式，并对 Keeper 负载进行监控和评估。

## 事务型（ACID）支持 \{#transactional-acid-support\}

从 PostgreSQL 迁移的用户可能已经习惯了其对 ACID（原子性、一致性、隔离性、持久性）属性的强大支持，这使其成为事务型数据库的可靠选择。PostgreSQL 中的原子性确保每个事务被视为一个单一的操作单元，要么完全成功，要么完全回滚，从而避免产生部分更新。一致性通过强制执行约束、触发器和规则来维持，从而保证所有数据库事务都会使系统保持在一个有效状态。PostgreSQL 支持从 Read Committed 到 Serializable 的隔离级别，允许对并发事务所做更改的可见性进行精细控制。最后，持久性是通过预写日志（WAL）实现的，以确保一旦事务提交，即使发生系统故障也能保持提交状态。

这些属性是作为权威数据源的 OLTP 数据库的常见特征。

但这种强大的能力也带来了内在限制，使得扩展到 PB 级规模变得困难。ClickHouse 在这些属性上做出权衡，以便在保持高写入吞吐的同时，在大规模场景下提供高速的分析型查询。

在[受限配置](/guides/developer/transactional)下，ClickHouse 可以提供 ACID 属性——最简单的情况是使用单分区的非复制 MergeTree 表引擎实例。在这些场景之外，你不应期望具备这些属性，并应确保这些属性不是系统的硬性要求。

## 压缩 \{#compression\}

由于 ClickHouse 采用列式存储，相比 Postgres，压缩效果通常会显著更好。如下图所示，我们对比了在这两个数据库中存储所有 Stack Overflow 表时的空间需求：

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

有关如何优化和衡量压缩的更多详情，请参见[此处](/data-compression/compression-in-clickhouse)。


## 数据类型映射 \{#data-type-mappings\}

下表展示了 Postgres 数据类型在 ClickHouse 中对应的等价数据类型。

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

*\* ClickHouse 对 JSON 的生产级支持仍在开发中。目前，你可以将 JSON 映射为 String，并使用 [JSON 函数](/sql-reference/functions/json-functions)，或者在结构可预测的情况下，将 JSON 直接映射为 [Tuples](/sql-reference/data-types/tuple) 和 [Nested](/sql-reference/data-types/nested-data-structures/nested)。在 [此处](/integrations/data-formats/json/overview)了解更多关于 JSON 的信息。*