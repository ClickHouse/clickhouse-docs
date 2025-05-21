---
'slug': '/migrations/postgresql/appendix'
'title': '附录'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': '相对于从PostgreSQL迁移的附加信息'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres vs ClickHouse: 等效和不同概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

来自OLTP系统的用户，如果习惯于ACID事务，应当意识到ClickHouse在为了性能而故意做出的妥协，并未完全提供这些功能。如果理解得当，ClickHouse的语义可以提供高耐久性保证和高写入吞吐量。我们在下面强调了一些关键概念，用户在从Postgres转向使用ClickHouse之前应当熟悉。

### Shards vs Replicas {#shards-vs-replicas}

分片和复制是两种扩展Postgres实例的策略，当存储和/或计算成为性能瓶颈时会用到。Postgres中的分片涉及将大型数据库拆分为多个较小、更易于管理的部分，分布在多个节点上。然而，Postgres本身不支持原生分片。可以通过如[Citus](https://www.citusdata.com/)这样的扩展实现分片，使Postgres成为能够横向扩展的分布式数据库。这种方法通过将负载分散到多台机器上，从而使Postgres能够处理更高的交易率和更大的数据集。分片可以是基于行或模式，以提供灵活性，适应事务或分析等工作负载。分片可能在数据管理和查询执行上引入显著复杂性，因为它需要在多台机器之间协调并提供一致性保证。

与分片不同，副本是额外的Postgres实例，包含来自主节点的全部或部分数据。副本的使用有多种原因，包括增强读取性能和高可用性（HA）场景。物理复制是Postgres的原生特性，它涉及将整个数据库或重要部分复制到另一台服务器，包括所有数据库、表和索引。这涉及通过TCP/IP从主节点流式传输WAL段。相对而言，逻辑复制是一种更高层次的抽象，基于`INSERT`、`UPDATE`和`DELETE`操作流式传输更改。虽然物理复制也可能达到同样的结果，但逻辑复制在针对特定表和操作、以及数据转化和支持不同Postgres版本时提供了更大的灵活性。

**相较之下，ClickHouse的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse副本可以被认为与Postgres副本类似，尽管复制是最终一致的并且没有主概念。与Postgres不同，ClickHouse本身原生支持分片。

一个分片是你的表数据的一部分。你总是至少有一个分片。在多台服务器上分片数据可以用于分担负载，如果你超出了单台服务器的容量，所有分片将被用于并行运行查询。用户可以手动在不同服务器上为表创建分片并直接向其插入数据。或者，可以使用带有分片键的分布式表来定义数据路由到哪个分片。分片键可以是随机的，也可以是哈希函数的输出。重要的是，一个分片可以包含多个副本。

一个副本是你的数据的副本。ClickHouse始终至少有一份数据副本，因此副本的最小数量为1。增加数据的第二个副本提供了容错性，可能还增加了处理更多查询的计算能力（[并行副本](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)也可以用于分配单个查询的计算，从而降低延迟）。副本是通过[ReplicatedMergeTree表引擎](/engines/table-engines/mergetree-family/replication)实现的，该引擎使ClickHouse能够在不同服务器之间保持多个数据副本的同步。复制是物理性的：节点间只转移压缩后的部分，而不是查询。

总之，副本是提供冗余和可靠性的一个数据副本（并可能实现分布式处理），而分片是允许分布式处理和负载均衡的数据子集。

> ClickHouse Cloud使用在S3中备份的单一数据副本和多个计算副本。数据对每个副本节点可用，每个副本节点都有本地SSD缓存。这仅依赖于通过ClickHouse Keeper共享元数据。

## 最终一致性 {#eventual-consistency}

ClickHouse使用ClickHouse Keeper（C++实现的ZooKeeper，ZooKeeper也可以使用）来管理其内部复制机制，主要集中在元数据存储和确保最终一致性上。Keeper用于在分布式环境中为每个插入分配唯一的顺序号码。这对于维护操作之间的顺序和一致性至关重要。该框架还处理诸如合并和变更等后台操作，确保这些工作的分配，同时保证在所有副本上以相同的顺序执行。除了元数据，Keeper还充当了复制的全面控制中心，包括跟踪存储数据部分的校验和，并充当副本间的分布式通知系统。

ClickHouse的复制过程（1）在数据插入到任何副本时开始。该数据以原始插入形式（2）写入磁盘，并附带校验和。一旦写入，副本（3）试图在Keeper中注册这一新数据部分，通过分配唯一的块编号并记录新部分的详细信息。其他副本在（4）检测到复制日志中的新条目后，（5）通过内部HTTP协议下载相应的数据部分，验证其与ZooKeeper中列出的校验和一致。此方法确保所有副本最终持有一致且最新的数据，尽管处理速度或可能存在延迟各不相同。此外，该系统能够并发处理多个操作，优化数据管理流程，并为系统的可扩展性和对硬件差异的鲁棒性提供支持。

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

注意，ClickHouse Cloud使用[云优化的复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)，该机制适应其存储和计算架构的分离。通过将数据存储在共享对象存储中，数据自动可用给所有计算节点，无需在节点之间物理复制数据。相反，Keeper仅用于在计算节点之间共享元数据（哪些数据存在于对象存储中）。

PostgreSQL采用的复制策略与ClickHouse不同，主要使用流复制，这涉及一个主副本模型，其中数据不断地从主节点流式传输到一个或多个副本节点。这种类型的复制确保近实时一致性，并且是同步的或异步的，让管理员控制可用性和一致性之间的平衡。与ClickHouse不同，PostgreSQL依赖WAL（预写日志）进行逻辑复制和解码，以在节点之间流式传输数据对象和更改。这种PostgreSQL的方法更简单，但是在高度分布的环境中可能不提供与ClickHouse相比的相同级别的可扩展性和容错性，ClickHouse通过复杂使用Keeper来实现分布式操作协调和最终一致性。

## 用户影响 {#user-implications}

在ClickHouse中，可能出现脏读的情况——即用户可以向一个副本写入数据，然后从另一个副本读取可能未复制的数据。此现象源于通过Keeper管理的最终一致性复制模型。该模型强调了在分布式系统中的性能和可扩展性，使副本独立运行并异步同步。因此，新的插入数据在所有副本之间可能不会立即可见，具体取决于复制延迟和更改传播需要的时间。

相反，PostgreSQL的流复制模型通常可以通过采用同步复制选项来防止脏读，在这种情况下，主节点在提交交易之前会等待至少一个副本确认数据的接收。这确保了一旦交易被提交，另一个副本中就有数据可用。在主节点发生故障时，该副本将确保查询看到已提交的数据，从而维持一个更严格的一致性级别。

## 建议 {#recommendations}

新接触ClickHouse的用户应意识到这些差异，这些差异将在复制环境中显现。通常情况下，在对数十亿甚至数万亿数据点进行分析时，最终一致性是足够的——此时度量数据通常更稳定，或者估计足够，因为新的数据持续以高频率插入。

如果对此有需求，有几种选项可以增加读取的一致性。这些选项都需要增加复杂性或开销——减少查询性能并使ClickHouse扩展更加困难。**我们建议仅在绝对必要时采用这些方法。**

## 一致性路由 {#consistent-routing}

为了克服最终一致性的一些限制，用户可以确保客户端路由到相同的副本。这在多个用户查询ClickHouse并且结果应在请求间保持确定性时非常有用。虽然结果可能会因插入新数据而有所不同，但应确保查询相同的副本，从而确保一致的视图。

这可以通过多种方法实现，具体取决于你的架构以及你是否使用ClickHouse OSS或ClickHouse Cloud。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud使用在S3中备份的单一数据副本和多个计算副本。数据对每个副本节点可用，该节点具有本地SSD缓存。为了确保一致的结果，用户只需确保路由到同一个节点即可。

与ClickHouse Cloud服务的节点通信通过代理进行。HTTP和原生协议连接将在保持开放的期间内路由到同一节点。在大多数客户端使用的HTTP 1.1连接的情况下，这取决于Keep-Alive窗口。大多数客户端（如Node Js）可以进行此配置。这还需要更高于客户端的服务器端配置，并在ClickHouse Cloud中设置为10秒。

为了确保在连接中保持一致的路由，例如，如果使用连接池或连接过期，用户可以确保使用相同的连接（对原生更容易）或请求暴露粘性端点。这样为集群中的每个节点提供了一组端点，从而允许客户端确保查询被确定性地路由。

> 联系支持团队以获得对粘性端点的访问。

## ClickHouse OSS {#clickhouse-oss}

在OSS中实现这一行为取决于你的分片和副本拓扑，以及是否为查询使用了[分布式表](/engines/table-engines/special/distributed)。

当你只有一个分片和副本（这很常见，因为ClickHouse垂直扩展）时，用户在客户端层选择节点并直接查询一个副本，从而确保这被确定性地选择。

虽然拓扑中没有分布式表的多个分片和副本是可能的，但这些高级部署通常有自己的路由基础设施。因此，我们假设拥有多个分片的部署使用的是分布式表（尽管可以与单个分片部署一起使用分布式表，但通常没有必要）。

在这种情况下，用户应该确保基于某个属性（例如`session_id`或`user_id`）执行一致的节点路由。设置[`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)和[`load_balancing=in_order`](/operations/settings/settings#load_balancing)应在查询中[设定](/operations/settings/query-level)。这将确保优先使用分片的任何本地副本，若其他副本在配置中列出且错误数量相同，则优先使用它们——如果错误数量较高，将发生随机选择以进行故障转移。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing)也可以用作确定性分片选择的替代方案。

> 创建分布式表时，用户需要指定一个集群。该集群定义在config.xml中，将列出分片（及其副本）——这样用户可以控制每个节点使用的顺序。通过这种方式，用户可以确保选择是确定性的。

## 顺序一致性 {#sequential-consistency}

在特定情况下，用户可能需要顺序一致性。

数据库中的顺序一致性是指数据库上的操作似乎以某种顺序执行，并且该顺序在所有与数据库交互的进程中是一致的。这意味着每个操作似乎在调用和完成之间瞬时生效，并且所有操作在任何进程中都能观察到单一公认的顺序。

从用户的角度来看，这通常表现为在ClickHouse中写入数据，并在读取数据时确保返回最新插入的行。
这可以通过多种方式实现（按偏好顺序）：

1. **在同一节点进行读取/写入** - 如果您使用的是原生协议，或通过HTTP进行[会话写入/读取](/interfaces/http#default-database)，则应连接到同一副本：在这种情况下，您直接从写入的节点读取，那么您的读取将始终是一致的。
2. **手动同步副本** - 如果您写入一个副本并从另一个副本读取，在读取之前可以使用`SYSTEM SYNC REPLICA LIGHTWEIGHT`。
3. **启用顺序一致性** - 通过查询设置[`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在OSS中，还必须指定设置`insert_quorum = 'auto'`。

<br />

有关启用这些设置的更多细节，请参见[这里](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性将对ClickHouse Keeper施加更大的负荷。其结果可能导致插入和读取变慢。ClickHouse Cloud中作为主要表引擎使用的SharedMergeTree，顺序一致性[引入的开销更小，且可扩展性更佳](/cloud/reference/shared-merge-tree#consistency)。OSS用户应谨慎使用此方法，并测量Keeper负载。

## 事务性（ACID）支持 {#transactional-acid-support}

从PostgreSQL迁移的用户可能习惯于其对ACID（原子性、一致性、隔离性、耐久性）属性的强大支持，使其成为事务数据库的可靠选择。在PostgreSQL中，原子性确保每个事务被视为一个单元，要么完全成功，要么完全回滚，防止部分更新。一致性是通过强制执行约束、触发器和规则来维护的，确保所有数据库交易导致有效状态。PostgreSQL支持从已提交读取到可串行化的隔离级别，允许精细控制对并发事务所做更改的可见性。最后，通过预写日志（WAL）实现耐久性，确保一旦交易被提交，它将在系统故障情况下保持不变。

这些属性对于充当事实源的OLTP数据库是常见的。

然而，这种强大功能也存在固有的局限性，并使PB规模的处理变得具有挑战性。为了提供高效能的分析查询，ClickHouse在这些属性上做出妥协，同时保持高写入吞吐量。

ClickHouse在[有限配置下](/guides/developer/transactional)提供ACID属性——最简单的是使用单分区的非复制MergeTree表引擎实例。用户应当在这些情况下之外不期望这些属性，并确保这不是一个要求。

## 压缩 {#compression}

ClickHouse的列式存储意味着其压缩效果通常明显优于Postgres。以下是比较两个数据库中所有Stack Overflow表的存储需求的图示：

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

有关优化和测量压缩的更多细节，可以在[这里](/data-compression/compression-in-clickhouse)找到。

## 数据类型映射 {#data-type-mappings}

下表显示了Postgres数据类型与ClickHouse数据类型的对应关系。

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

*\* ClickHouse对JSON的生产支持正在开发中。目前用户可以将JSON映射为String，使用[JSON函数](/sql-reference/functions/json-functions)，或将JSON直接映射到[Tuples](/sql-reference/data-types/tuple)和[Nested](/sql-reference/data-types/nested-data-structures/nested)，如果该结构是可预测的。有关JSON的更多信息，请参阅[这里](/integrations/data-formats/json/overview).*
