---
'slug': '/migrations/postgresql/appendix'
'title': '附录'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': '与迁移自 PostgreSQL 相关的附加信息'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres与ClickHouse：相应的概念和不同之处 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

来自OLTP系统的用户，习惯于ACID事务，应当意识到ClickHouse在不完全提供这些事务的情况下，为了性能做出了刻意的妥协。如果充分理解ClickHouse的语义，可以实现高持久性保证和高写入吞吐量。我们在下面强调了一些关键概念，用户在从Postgres切换到ClickHouse之前应该熟悉这些。

### 分片与副本 {#shards-vs-replicas}

分片和复制是用于超越单个Postgres实例进行扩展的两种策略，当存储和/或计算成为性能瓶颈时使用。在Postgres中，分片涉及将大型数据库拆分成多个、更易于管理的小部分，分布在多个节点上。然而，Postgres并不原生支持分片。相反，分片可以通过使用如[Citus](https://www.citusdata.com/)的扩展来实现，此时Postgres变成一个能够进行水平扩展的分布式数据库。这种方法允许Postgres通过在多台机器之间分散负载来处理更高的事务速率和更大的数据集。分片可以是基于行或模式，以便为工作负载类型（例如事务性或分析性）提供灵活性。分片可能会在数据管理和查询执行方面引入显著的复杂性，因为它需要在多个机器之间进行协调和一致性保证。

与分片不同，副本是包含来自主节点的全部或部分数据的额外Postgres实例。创建副本的原因多种多样，包括增强读取性能和高可用性（HA）场景。物理复制是Postgres的一个原生功能，涉及将整个数据库或其重要部分复制到另一台服务器，包括所有数据库、表和索引。这包括通过TCP/IP将WAL片段从主节点流式传输到副本。相比之下，逻辑复制则是一种更高层次的抽象，基于`INSERT`、`UPDATE`和`DELETE`操作流式传输变化。尽管物理复制能够实现相同的结果，但逻辑复制为目标特定表和操作、数据变换以及支持不同Postgres版本提供了更大的灵活性。

**相对而言，ClickHouse的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse的副本可以被视为与Postgres副本相似，尽管复制是最终一致的，并没有主节点的概念。与Postgres不同，ClickHouse原生支持分片。

一个分片是你的表数据的一部分。你总是至少有一个分片。在多个服务器之间分片数据可以用来分担负载，特别是在单台服务器的容量被超过时，通过将所有分片用来并行运行查询。用户可以手动为表在不同服务器上创建分片，并直接向它们插入数据。或者，可以使用分布式表，通过定义分片键来确定数据的路由。分片键可以是随机的或哈希函数的输出。重要的是，一个分片可以包含多个副本。

一个副本是你数据的副本。ClickHouse总是至少有一个副本的数据，因此最小副本数量为一个。添加第二个副本提供了容错能力，并可能为处理更多查询提供额外的计算能力（[并行副本](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)也可用于为单个查询分配计算，从而降低延迟）。副本是通过[ReplicatedMergeTree表引擎](/engines/table-engines/mergetree-family/replication)实现的，该引擎使ClickHouse能够在不同服务器之间保持多个数据副本的同步。复制是物理的：仅在节点之间传输压缩的部分，而不是查询。

总之，副本是提供冗余和可靠性（并可能进行分布式处理）的数据副本，而分片是允许分布式处理和负载均衡的数据子集。

> ClickHouse Cloud使用单一复制的数据，存储在S3上，并配有多个计算副本。数据对每个副本节点可用，每个节点都有一个本地SSD缓存。这仅依赖于通过ClickHouse Keeper的元数据复制。

## 最终一致性 {#eventual-consistency}

ClickHouse使用ClickHouse Keeper（C++版的ZooKeeper实现，亦可使用ZooKeeper）来管理其内部复制机制，主要专注于元数据存储和确保最终一致性。Keeper用于在分布式环境中为每个插入分配唯一的顺序编号。这对于维护操作之间的顺序和一致性至关重要。这个框架还处理后台操作，如合并和变更，确保这些工作的分配，同时保证它们在所有副本中以相同的顺序执行。除了元数据，Keeper还充当一个全面的控制中心，负责复制，包括跟踪存储数据部分的校验和，并在副本之间充当分布式通知系统。

ClickHouse的复制过程（1）在数据插入到任何副本时开始。此数据在其原始插入形式下（2）写入磁盘，并附上其校验和。写入后，副本（3）尝试在Keeper中注册这一新数据部分，通过分配唯一的块编号并记录新部分的详细信息。其他副本在（4）检测到复制日志中的新条目后，（5）通过内部HTTP协议下载相应的数据部分，并与ZooKeeper中列出的校验和进行验证。该方法确保尽管处理速度或潜在延迟不同，所有副本最终持有一致且最新的数据。此外，系统能够同时处理多个操作，优化数据管理过程，并允许系统可扩展性和对硬件差异的鲁棒性。

<Image img={postgresReplicas} size="md" alt="最终一致性"/>

请注意，ClickHouse Cloud使用的[云优化复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)适应了其存储与计算架构的分离。通过将数据存储在共享对象存储中，数据自动对所有计算节点可用，而无需在节点之间物理复制数据。相反，Keeper仅用于在计算节点之间共享元数据（哪些数据存储在共享对象存储中）。

PostgreSQL采用的复制策略与ClickHouse不同，主要使用流式复制，包括一个主副本模型，在该模型中，数据从主节点持续流式传输到一个或多个副本节点。这种复制类型确保了近实时的一致性，并且是同步的或异步的，使管理员能够控制可用性和一致性之间的平衡。与ClickHouse不同，PostgreSQL依赖WAL（写前日志）与逻辑复制和解码，将数据对象和变化在节点间流式传输。这种在PostgreSQL中的方法更简单，但在高度分布的环境中可能无法提供ClickHouse通过其复杂的Keeper使用实现的同样级别的可扩展性和容错能力。

## 用户影响 {#user-implications}

在ClickHouse中，肮脏读取的可能性——用户可以将数据写入一个副本，然后从另一个副本读取可能未被复制的数据——来自于其通过Keeper管理的最终一致性复制模型。该模型强调在分布式系统中追求性能和可扩展性，使副本能够独立操作并异步同步。因此，取决于复制延迟以及变化传播所需的时间，新插入的数据可能不会立即在所有副本中可见。

相比之下，PostgreSQL的流式复制模型通常可以通过采用同步复制选项来防止肮脏读取，在此情况下，主节点在确认至少有一个副本收到数据后再提交事务。这确保了一旦事务提交，便有保证数据在另一个副本中可用。在主故障的情况下，副本将确保查询看到已提交的数据，从而维持更严格的一致性水平。

## 推荐 {#recommendations}

新接触ClickHouse的用户应了解这些差异，这将在复制环境中表现出来。通常，最终一致性在分析数十亿，甚至数万亿数据点时是足够的——在这些情况下，指标要么更加稳定，要么估算是足够的，因为新数据以高速度持续插入。

如果需要提高读取的一致性，有几种选项可用。两个示例都要求增加复杂性或开销——降低查询性能并使ClickHouse的扩展变得更具挑战性。**我们建议仅在绝对必要时采用这些方法。**

## 一致路由 {#consistent-routing}

为了克服最终一致性的一些限制，用户可以确保客户端路由到相同的副本。这在多个用户查询ClickHouse且结果应在请求之间是确定性时非常有用。虽然结果可能会随新数据的插入而有所不同，但应确保查询相同的副本，以确保一致的视图。

这可以通过几种方法实现，具体取决于你的架构和使用的是ClickHouse OSS还是ClickHouse Cloud。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud使用单一复制的数据，存储在S3上，并配有多个计算副本。数据对每个副本节点可用，每个节点都有一个本地SSD缓存。为了确保一致的结果，用户只需确保路由到相同节点的一致性。

与ClickHouse Cloud服务的节点之间的通信通过代理进行。HTTP和原生协议连接将在保持打开期间路由到相同节点。在大多数客户端的HTTP 1.1连接中，这取决于Keep-Alive窗口。这可以在 大多数客户端（例如Node Js）上进行配置。这还需要服务器端配置，通常设置为比客户端高，并在ClickHouse Cloud中设置为10秒。

为确保连接之间（例如，在使用连接池或连接过期时）的一致路由，用户可以确保使用相同的连接（对于原生更容易）或请求暴露粘性端点。这为集群中的每个节点提供了一组端点，从而使客户端能够确保查询被确定性路由。

> 联系支持以获取粘性端点的访问权限。

## ClickHouse OSS {#clickhouse-oss}

在OSS中实现这种行为取决于你的分片和副本拓扑，以及你是否使用[分布式表](/engines/table-engines/special/distributed)进行查询。

当你只有一个分片和副本（由于ClickHouse垂直扩展，通常是这种情况）时，用户在客户层选择节点，并直接查询一个副本，以确保这是确定性的选择。

虽然没有分布式表的多分片和副本的拓扑也是可能的，但这些高级部署通常具有自己的路由基础设施。因此，我们假设具有多个分片的部署使用分布式表（分布式表可用于单分片部署，但通常不必要）。

在这种情况下，用户应确保根据属性（例如`session_id`或`user_id`）执行一致的节点路由。设置[`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)和[`load_balancing=in_order`](/operations/settings/settings#load_balancing)应在[查询中设置](/operations/settings/query-level)。这将确保优先使用同一分片的本地副本，其他副本按配置中列出进行优先选择 - 若错误数量相同，则在错误较高的情况下将随机选择进行故障转移。[ `load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing)也可用作这种确定性分片选择的替代方案。

> 创建分布式表时，用户将指定一个集群。此集群定义在config.xml中，将列出分片（及其副本） - 因此允许用户控制从每个节点中使用的顺序。使用此方法，用户可以确保选择是确定性的。

## 顺序一致性 {#sequential-consistency}

在特殊情况下，用户可能需要顺序一致性。

数据库中的顺序一致性是索引操作在数据库上以某种顺序执行，并且这种顺序在与数据库交互的所有进程中是一致的。这意味着每个操作似乎在其调用和完成之间瞬间生效，并且所有操作被任何进程观察到的顺序达成一致。

从用户的角度来看，这通常表现为需将数据写入ClickHouse，并在读取数据时，确保返回最新插入的行。
这可以通过几种方式实现（按偏好顺序）：

1. **读/写到同一节点** - 如果使用的是原生协议或通过HTTP [会话进行读/写](/interfaces/http#default-database)，则应连接到同一副本：在这种情况下，你是直接从正在写入的节点读取，因此你的读取将始终是一致的。
1. **手动同步副本** - 如果你写入一个副本并从另一个副本读取，则可以在读取之前执行`SYSTEM SYNC REPLICA LIGHTWEIGHT`。
1. **启用顺序一致性** - 通过查询设置[`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在OSS中，还必须指定设置`insert_quorum = 'auto'`。

<br />

有关启用这些设置的更多详情，请参阅[此处](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性将对ClickHouse Keeper施加更大的负载。结果可能意味着插入和读取速度变慢。ClickHouse Cloud中作为主表引擎使用的SharedMergeTree，顺序一致性[产生的开销较少且可更好地扩展](/cloud/reference/shared-merge-tree#consistency)。OSS用户应谨慎使用这种方法，并测量Keeper负载。

## 事务（ACID）支持 {#transactional-acid-support}

从PostgreSQL迁移的用户可能会习惯于其对ACID（原子性、一致性、隔离性、持久性）属性的强大支持，使其成为事务数据库的可靠选择。PostgreSQL中的原子性确保每个事务被视为一个单一的单位，要么完全成功，要么完全回滚，防止部分更新。一致性通过强制执行约束、触发器和规则来维持，确保所有数据库事务导致有效状态。PostgreSQL支持从已提交读取到可串行化的隔离级别，允许对并发事务的更改可见性进行细粒度控制。最后，通过写前日志（WAL）实现持久性，确保一旦事务被提交，即使在系统故障事件中也依然如此。

这些属性是作为真实来源的OLTP数据库的共同特征。

虽然功能强大，但这也伴随着固有的限制，使得PB规模的挑战。ClickHouse在这些属性上做出了妥协，以提供快速的分析查询，同时维持高写入吞吐量。

在[有限配置下](/guides/developer/transactional) ClickHouse提供ACID属性 - 通常是在使用非复制实例的MergeTree表引擎时，仅有一个分区。用户不应期望在这些情况之外有这些属性，并确保这些不是必须的要求。

## 压缩 {#compression}

ClickHouse的列式存储意味着与Postgres相比，压缩通常会显著更好。以下是在比较这两个数据库中所有Stack Overflow表的存储需求时的说明：

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

有关优化和测量压缩的更多详细信息，请参阅[此处](/data-compression/compression-in-clickhouse)。

## 数据类型映射 {#data-type-mappings}

下表显示了Postgres的等效ClickHouse数据类型。

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

*\* ClickHouse对JSON的生产支持正在开发中。当前，用户可以将JSON映射为String，并使用[JSON函数](/sql-reference/functions/json-functions)，或将JSON直接映射到[Tuples](/sql-reference/data-types/tuple)和[Nested](/sql-reference/data-types/nested-data-structures/nested)，如果结构是可预测的。有关JSON的更多信息，请[点击此处](/integrations/data-formats/json/overview)。*
