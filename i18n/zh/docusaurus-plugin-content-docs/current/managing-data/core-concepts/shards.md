---
'slug': '/shards'
'title': '表分片与副本'
'description': 'ClickHouse中的表分片与副本是什么'
'keywords':
- 'shard'
- 'shards'
- 'sharding'
- 'replica'
- 'replicas'
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'
import image_05 from '@site/static/images/managing-data/core-concepts/shards_replicas_01.png'
import Image from '@theme/IdealImage';

<br/>
:::note
此主题不适用于 ClickHouse Cloud， 在那里 [Parallel Replicas](/docs/deployment-guides/parallel-replicas) 的功能类似于传统的无共享 ClickHouse 集群中的多个分片，而对象存储则 [替代](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates#shared-object-storage-for-data-availability) 副本，确保高可用性和容错性。
:::

## ClickHouse 中的表分片是什么？ {#what-are-table-shards-in-clickhouse}

在传统的 [无共享](https://en.wikipedia.org/wiki/Shared-nothing_architecture) ClickHouse 集群中，当 ① 数据过大以至于无法在单台服务器上处理，或 ② 单台服务器处理数据的速度过慢时，会使用分片。下一张图示例了案例 ①，显示 [uk_price_paid_simple](/parts) 表超出单台机器容量的情况：

<Image img={image_01} size="lg" alt='SHARDS'/>

<br/>

在这种情况下，数据可以在多个 ClickHouse 服务器之间以表分片的形式进行拆分：

<Image img={image_02} size="lg" alt='SHARDS'/>

<br/>

每个分片持有数据的一个子集，并作为一个可以独立查询的普通 ClickHouse 表。如果查询只处理该子集，这可能是根据数据分布的有效用例。通常，[分布式表](/docs/engines/table-engines/special/distributed)（通常每个服务器一个）提供了完整数据集的统一视图。它本身不存储数据，而是将 **SELECT** 查询转发到所有分片，汇总结果，并将 **INSERT** 路由到各分片以均匀分配数据。

## 分布式表创建 {#distributed-table-creation}

为了说明 **SELECT** 查询转发和 **INSERT** 路由，我们考虑 [What are table parts](/parts) 示例表，它在两台 ClickHouse 服务器上的两个分片间进行分割。首先，我们展示为此设置创建相应的 **Distributed table** 的 DDL 语句：

```sql
CREATE TABLE uk.uk_price_paid_simple_dist ON CLUSTER test_cluster
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = Distributed('test_cluster', 'uk', 'uk_price_paid_simple', rand())
```

`ON CLUSTER` 子句使 DDL 语句成为 [分布式 DDL 语句](/docs/sql-reference/distributed-ddl)，指示 ClickHouse 在 `test_cluster` [集群定义](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration) 中列出的所有服务器上创建表。分布式 DDL 在 [集群架构](/docs/architecture/horizontal-scaling#architecture-diagram) 中需要一个额外的 [Keeper](https://clickhouse.com/clickhouse/keeper) 组件。

对于 [分布式引擎参数](/docs/engines/table-engines/special/distributed#distributed-parameters)，我们指定集群名称（`test_cluster`）、目标表的数据库名称（`uk`）、分片目标表的名称（`uk_price_paid_simple`）以及用于 INSERT 路由的 **分片键**。在此示例中，我们使用 [rand](/sql-reference/functions/random-functions#rand) 函数随机为行分配分片。然而，任何表达式（甚至复杂的表达式）都可以用作分片键，具体取决于用例。下一部分说明 INSERT 路由的工作原理。

## INSERT 路由 {#insert-routing}

下图说明了在 ClickHouse 中如何处理对分布式表的 INSERT 操作：

<Image img={image_03} size="lg" alt='SHARDS'/>

<br/>

① 发送到分布式表的 INSERT（包含单行）被发送到托管该表的 ClickHouse 服务器，直接发送或通过负载均衡器。

② 对于 INSERT 中的每一行（在我们的示例中只有一行），ClickHouse 评估分片键（此处为 rand()），将结果取模分片服务器的数量，并将其用作目标服务器 ID（ID 从 0 开始并递增 1）。然后，该行被转发并 ③ 插入到相应服务器的表分片中。

下一部分解释 SELECT 转发的工作原理。

## SELECT 转发 {#select-forwarding}

此图显示了如何在 ClickHouse 中使用分布式表处理 SELECT 查询：

<Image img={image_04} size="lg" alt='SHARDS'/>

<br/>

① 针对分布式表的 SELECT 聚合查询被发送到相应的 ClickHouse 服务器，直接发送或通过负载均衡器。

② 分布式表将查询转发给托管目标表分片的所有服务器，每个 ClickHouse 服务器并行计算其本地聚合结果。

然后，托管最初目标分布式表的 ClickHouse 服务器 ③ 收集所有本地结果，④ 将其合并为最终的全局结果，并 ⑤ 将其返回给查询发送者。

## ClickHouse 中的表副本是什么？ {#what-are-table-replicas-in-clickhouse}

ClickHouse 中的复制通过在多个服务器上维护 **分片数据的副本** 来确保 **数据完整性** 和 **故障切换**。由于硬件故障是不可避免的，复制通过确保每个分片具有多个副本来防止数据丢失。写入可以直接或通过 [分布式表](#distributed-table-creation) 定向到任何副本，该表为该操作选择一个副本。更改会自动传播到其他副本。在故障或维护情况下，数据仍然在其他副本上可用，并且一旦失败的主机恢复，它会自动同步保持最新状态。

注意，复制在 [集群架构](/docs/architecture/horizontal-scaling#architecture-diagram) 中需要一个 [Keeper](https://clickhouse.com/clickhouse/keeper) 组件。

下图示例了一个拥有六个服务器的 ClickHouse 集群，其中之前介绍的两个表分片 `Shard-1` 和 `Shard-2` 各自都有三个副本。一个查询被发送到此集群：

<Image img={image_05} size="lg" alt='SHARDS'/>

<br/>

查询处理与没有副本的设置类似，只是每个分片中的一个副本执行查询。

> 副本不仅确保数据完整性和故障切换，还通过允许多个查询在不同副本上并行运行来提高查询处理吞吐量。

① 针对分布式表的查询被发送到相应的 ClickHouse 服务器，直接发送或通过负载均衡器。

② 分布式表将查询转发给每个分片中的一个副本，每个托管所选副本的 ClickHouse 服务器并行计算其本地查询结果。

其余过程与没有副本的设置 [相同](#select-forwarding)，在上面的图中不再显示。托管最初目标分布式表的 ClickHouse 服务器收集所有本地结果，将其合并为最终全局结果，并将其返回给查询发送者。

注意，ClickHouse 允许为 ② 配置查询转发策略。默认情况下——与上图不同——分布式表 [优先选择](/docs/operations/settings/settings#prefer_localhost_replica) 可用的本地副本，但也可以使用其他负载均衡 [策略](/docs/operations/settings/settings#load_balancing)。

## 哪里可以找到更多信息 {#where-to-find-more-information}

有关表分片和副本的更多详细信息，请查看我们的 [部署和扩展指南](/docs/architecture/horizontal-scaling)。

我们还强烈推荐此教程视频，以深入了解 ClickHouse 的分片和副本：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
