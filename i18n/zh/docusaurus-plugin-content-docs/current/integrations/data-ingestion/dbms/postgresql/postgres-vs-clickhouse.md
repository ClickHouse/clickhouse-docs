---
slug: /integrations/postgresql/postgres-vs-clickhouse
title: 比较 PostgreSQL 和 ClickHouse
keywords: ['postgres', 'postgresql', 'comparison']
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';

## Postgres 与 ClickHouse：等效和不同的概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

来自 OLTP 系统的用户如果习惯于 ACID 事务应当注意，ClickHouse 有意在完全提供这些事务上做出妥协，以换取性能。如果对 ClickHouse 的语义有良好的理解，则可以提供高耐久性保证和高写入吞吐量。我们在下面突出了一些用户在从 Postgres 切换到 ClickHouse 之前应熟悉的关键概念。

### 分片与副本 {#shards-vs-replicas}

分片和复制是用于超越一个 Postgres 实例进行扩展的两种策略，当存储和/或计算成为性能瓶颈时。Postgres 中的分片涉及将大型数据库拆分为多个较小且更易管理的部分，分布在多个节点上。然而，Postgres 并不原生支持分片。相反，可以通过使用诸如 [Citus](https://www.citusdata.com/) 的扩展来实现分片，使 Postgres 成为可以水平扩展的分布式数据库。这种方法允许 Postgres 通过将负载分散到几台机器上来处理更高的事务速率和更大的数据集。分片可以是基于行或模式，以提供对事务型或分析型负载类型的灵活性。分片可能在数据管理和查询执行方面引入显著的复杂性，因为它需要在多个机器间进行协调和一致性保证。

与分片不同，副本是包含主节点所有或部分数据的额外 Postgres 实例。副本用于多种原因，包括增强读取性能和高可用性（HA）场景。物理复制是 Postgres 的一项原生功能，它涉及将整个数据库或重要部分复制到另一服务器，包括所有数据库、表和索引。这包括通过 TCP/IP 将 WAL 段从主节点流式传输到副本。相反，逻辑复制是更高的抽象级别，它基于 `INSERT`、`UPDATE` 和 `DELETE` 操作流式传输更改。尽管物理复制可能会应用相同的结果，但逻辑复制在针对特定表和操作时提供了更大的灵活性，以及数据转换和支持不同的 Postgres 版本。

**与此相反，ClickHouse 的分片和副本是与数据分布和冗余相关的两个关键概念**。ClickHouse 的副本可以被视为类似于 Postgres 的副本，尽管复制是最终一致的，没有主节点的概念。与 Postgres 不同，分片在 ClickHouse 中是原生支持的。

分片是您表数据的一部分。您总是至少有一个分片。在多个服务器上分片数据可以在您超过单个服务器的容量时用来分担负载，所有分片都可用于并行运行查询。用户可以手动在不同服务器上为表创建分片，并直接插入数据。或者，可以使用一个分布式表，使用分片键来定义数据被路由到哪个分片。分片键可以是随机的或作为哈希函数的输出。重要的是，一个分片可以包含多份副本。

副本是您的数据的副本。ClickHouse 总是至少有一份数据的副本，因此副本的最小数量为一。增加第二个副本可以提供容错能力，并可能为处理更多查询提供额外的计算力（[并行副本](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) 也可以用于分配单个查询的计算，从而降低延迟）。副本是通过 [ReplicatedMergeTree 表引擎](/engines/table-engines/mergetree-family/replication) 实现的，这使得 ClickHouse 能够在不同服务器之间保持多个数据副本的同步。复制是物理的：在节点之间仅传输压缩的分片，而不是查询。

总之，副本是数据的副本，提供冗余和可靠性（以及可能的分布式处理），而分片是数据的子集，允许分布式处理和负载平衡。

> ClickHouse Cloud 使用单份数据备份在 S3 上，并拥有多个计算副本。数据对每个副本节点可用，每个节点都有本地 SSD 缓存。这仅依赖于通过 ClickHouse Keeper 进行的元数据复制。

## 最终一致性 {#eventual-consistency}

ClickHouse 使用 ClickHouse Keeper（C++ 实现的 ZooKeeper，ZooKeeper 也可以使用）来管理其内部复制机制，主要关注元数据存储和确保最终一致性。Keeper 用于在分布式环境中为每次插入分配唯一的顺序编号。这对于在操作之间维护顺序和一致性是至关重要的。该框架还处理背景操作，如合并和修饰，确保这些工作的分配，同时保证它们在所有副本中按照相同的顺序执行。除了元数据外，Keeper 还充当复制的全面控制中心，包括跟踪存储数据部分的校验和，并充当副本之间的分布式通知系统。

ClickHouse 中的复制过程 (1) 在任意副本插入数据时开始。这些数据在原始插入形式下被 (2) 写入磁盘，并附有其校验和。一旦写入，副本 (3) 尝试通过分配唯一的块编号，将此新数据部分的详情记录在 Keeper 中。其他副本在 (4) 检测到复制日志中的新条目时，(5) 通过内部 HTTP 协议下载相应的数据部分，并根据 ZooKeeper 中列出的校验和进行验证。此方法确保所有副本最终持有一致的最新数据，尽管处理速度可能不同或存在潜在延迟。此外，该系统能够同时处理多个操作，优化数据管理流程，并允许系统的可扩展性和对硬件差异的健壮性。

<br />

<img src={postgresReplicas}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

请注意，ClickHouse Cloud 使用 [云优化的复制机制](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)，以适应其存储与计算架构的分离。通过在共享对象存储中存储数据，数据自动对所有计算节点可用，而无需在节点之间物理复制数据。相反，Keeper 只是用于在计算节点之间共享元数据（文件存储中存在哪些数据）。

PostgreSQL 的复制策略与 ClickHouse 的不同，主要使用流式复制，这涉及一个主副本模型，其中数据持续从主节点流式传输到一个或多个副本节点。这种类型的复制确保了近实时的一致性，并且可以是同步或异步的，使管理员能够控制可用性和一致性之间的平衡。与 ClickHouse 不同，PostgreSQL 依赖 WAL（预写日志）与逻辑复制和解码在节点之间流式传输数据对象和更改。在 PostgreSQL 中，这种方法更加简单，但在高度分布的环境中可能无法提供与 ClickHouse 通过其复杂使用 Keeper 进行分布式操作协调和最终一致性所实现的相同级别的可扩展性和容错能力。

## 用户影响 {#user-implications}

在 ClickHouse 中，肮脏读取的可能性 - 即用户可以向一个副本写入数据，然后从另一个副本读取可能未复制的数据 - 源自其通过 Keeper 管理的最终一致性复制模型。该模型强调在分布式系统中的性能和可扩展性，允许副本独立操作并异步同步。因此，新插入的数据可能不会立即在所有副本中可见，具体取决于复制延迟和更改传播通过系统所需的时间。

相反，PostgreSQL 的流式复制模型通常可以通过采用同步复制选项，确保主节点等待至少一个副本确认收到数据后再提交事务，从而防止肮脏读取。这确保了一旦事务被提交，保证数据在另一个副本中可用。在主节点故障的情况下，副本将确保查询看到已提交的数据，从而保持更严格级别的一致性。

## 推荐 {#recommendations}

对 ClickHouse 不熟悉的用户应该意识到这些差异，这些差异将在复制环境中显现。通常，对于数十亿，如果不是数万亿个数据点的分析，最终一致性是足够的 - 在这些情况下，度量要么更稳定，要么随着新数据以高速连续插入而估算是足够的。

如果需要提高读取的一致性，则有多种选择。这些示例均需要增加复杂性或开销 - 降低查询性能并使ClickHouse 更难以扩展。**我们建议只有在绝对必要时才采用这些方法。**

## 一致路由 {#consistent-routing}

为了克服最终一致性的一些限制，用户可以确保客户端路由到相同的副本。这在多个用户查询 ClickHouse，并且结果应在请求之间保持确定性时非常有用。虽然结果可能会有所不同，随着新数据的插入，但应确保查询相同的副本以确保一致的视图。

这可以通过多种方法实现，具体取决于您的架构以及您是否使用 ClickHouse OSS 或 ClickHouse Cloud。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud 使用备份在 S3 上的单份数据，配有多个计算副本。数据对每个副本节点可用，并且每个节点都有本地 SSD 缓存。为了确保结果一致，用户需要做的就是确保路由到相同节点的一致性。

与 ClickHouse Cloud 服务的节点之间的通信通过代理进行。HTTP 和原生协议连接将在它们保持打开的期间路由到相同的节点。在来自大多数客户端的 HTTP 1.1 连接的情况下，这取决于 Keep-Alive 窗口。这个窗口可以在大多数客户端上配置，例如 Node Js。此设置还需要服务器端配置，其值通常高于客户端，并在 ClickHouse Cloud 中设置为 10 秒。

为了确保连接的一致路由，例如，如果使用连接池或连接过期，用户可以确保使用相同的连接（原生时更容易）或请求暴露粘性终端。这为集群中的每个节点提供了一组端点，从而允许客户端确保查询被确定性地路由。

> 请联系支持以获得访问粘性终端的权限。

## ClickHouse OSS {#clickhouse-oss}

要在 OSS 中实现此行为，取决于您所在的分片和副本拓扑，以及您是否使用 [分布式表](/engines/table-engines/special/distributed) 进行查询。

当您只有一个分片和副本（由于 ClickHouse 纵向扩展，这种情况很常见）时，用户在客户端层选择节点，并直接查询一个副本，从而确保这是确定性选择。

虽然可以没有分布式表而拥有多分片和副本的拓扑，但这些高级部署通常具有自己的路由基础设施。因此，我们假设具有多个分片的部署使用了分布式表（分布式表可以与单分片部署一起使用，但通常是不必要的）。

在这种情况下，用户应确保基于某个属性（例如 `session_id` 或 `user_id`）执行一致的节点路由。设置 [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)、[`load_balancing=in_order`](/operations/settings/settings#load_balancing) 应该在 [查询中设置](/operations/settings/query-level)。这将确保优先选择任何本地副本的分片，其他副本则按照配置中列出的优先选择 - 提供它们具有相同数量的错误 - 在错误更高时将随机选择进行故障转移。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) 也可以作为此确定性分片选择的替代方案。

> 创建分布式表时，用户将指定一个集群。该集群定义在 config.xml 中，将列出分片（及其副本） - 从而允许用户控制从每个节点使用的顺序。通过使用此功能，用户可以确保选择是确定性的。

## 顺序一致性 {#sequential-consistency}

在特殊情况下，用户可能需要顺序一致性。

数据库中的顺序一致性是指对数据库的操作似乎以某种顺序执行，并且这一顺序在所有与数据库交互的进程中是一致的。这意味着每个操作似乎在其调用与完成之间立即生效，并且存在每个操作被任何进程观察的单一、商定的顺序。

从用户的角度来看，这通常表现为在写入数据到 ClickHouse 时，在读取数据时，保证返回最新插入的行。
这可以通过多种方式实现（按偏好顺序）：

1. **在同一节点上读取/写入** - 如果您使用原生协议，或通过 HTTP 进行写入/读取的 [会话](/interfaces/http#default-database)，则应连接到相同的副本：在这种情况下，您直接从写入的节点读取，那么您的读取将始终一致。
2. **手动同步副本** - 如果您向一个副本写入数据并从另一个副本读取，则可以在读取之前使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 指令。
3. **启用顺序一致性** - 通过查询设置 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)。在 OSS 中，设置 `insert_quorum = 'auto'` 也必须指定。

<br />

有关启用这些设置的更多详细信息，请参见 [此处](/cloud/reference/shared-merge-tree#consistency)。

> 使用顺序一致性将对 ClickHouse Keeper 施加更大的负担。结果可能意味着插入和读取速度变慢。ClickHouse Cloud 中使用的主要表引擎 SharedMergeTree，顺序一致性 [产生的开销更小且扩展性更好](/cloud/reference/shared-merge-tree#consistency)。OSS 用户应谨慎使用这种方法并测量 Keeper 的负载。

## 事务（ACID）支持 {#transactional-acid-support}

来自 PostgreSQL 的用户可能已熟悉其对 ACID（原子性、一致性、隔离性、持久性）属性的全面支持，使其成为事务数据库的可靠选择。PostgreSQL 中的原子性确保每个事务被视为一个单一的单元，要么完全成功，要么完全回滚，防止部分更新。一致性通过强制约束、触发器和规则得到维持，确保所有数据库事务导致有效状态。PostgreSQL 支持从已提交读取到可序列化的隔离级别，允许对并发事务所作更改的可见性进行精细控制。最后，通过预写日志（WAL）实现持久性，确保一旦事务被提交，即使在系统故障的情况下也会保持其状态。

这些属性在作为事实来源的 OLTP 数据库中是常见的。

尽管功能强大，但这伴随着固有的局限性，并使 PB 规模的处理变得具有挑战性。ClickHouse 为了提供快速的分析查询而以高写入吞吐量为代价妥协了这些属性。

ClickHouse 在 [有限的配置](/guides/developer/transactional) 下提供 ACID 属性 - 最简单的情况是使用一个分区的非复制 MergeTree 表引擎的实例。用户不应期待在这些情况下以外拥有这些属性，并确保这些属性不是必须的。

## 使用 ClickPipes（由 PeerDB 提供支持）复制或迁移 PostgreSQL 数据 {#replicating-or-migrating-postgres-data-with-clickpipes-powered-by-peerdb}

:::info
PeerDB 现在在 ClickHouse Cloud 中本地提供 - 通过我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres)，实现快速的 Postgres 到 ClickHouse CDC - 现已公开测试。
:::

[PeerDB](https://www.peerdb.io/) 使您能够无缝地将数据从 Postgres 复制到 ClickHouse。您可以使用此工具进行
1. 通过 CDC 实现连续复制，允许 Postgres 和 ClickHouse 共存 - Postgres 用于 OLTP，ClickHouse 用于 OLAP；以及
2. 从 Postgres 迁移到 ClickHouse。


