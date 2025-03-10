---
slug: /shards
title: 表分片和副本
description: ClickHouse 中的表分片和副本是什么
keywords: [shard, shards, sharding, replica, replicas]
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'
import image_05 from '@site/static/images/managing-data/core-concepts/shards_replicas_01.png'

<br/>
:::note
此主题不适用于 ClickHouse Cloud，其中的 [Parallel Replicas](/docs/deployment-guides/parallel-replicas) 像传统的无共享 ClickHouse 集群中的多个分片一样运行，而对象存储则 [替代](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates#shared-object-storage-for-data-availability) 副本，确保高可用性和容错性。
:::

## ClickHouse 中的表分片是什么？ {#what-are-table-shards-in-clickhouse}

在传统的 [shared-nothing](https://en.wikipedia.org/wiki/Shared-nothing_architecture) ClickHouse 集群中，当 ① 数据对单个服务器来说过大，或 ② 单个服务器处理数据过慢时，使用分片。下图展示了情况 ①，其中 [uk_price_paid_simple](/parts) 表超出了单台机器的承载能力：  

<img src={image_01} alt='SHARDS' class='image' />
<br/>

在这种情况下，数据可以分散到多个 ClickHouse 服务器上，以分片的形式存储：

<img src={image_02} alt='SHARDS' class='image' />
<br/>

每个分片持有数据的一个子集，并作为一个常规的 ClickHouse 表独立查询。然而，查询将只处理该子集，这可能是一个有效的用例，具体取决于数据分布。通常， [分布式表](/docs/engines/table-engines/special/distributed)（通常每个服务器一个）提供全数据集的统一视图。它本身不存储数据，而是将 **SELECT** 查询转发给所有分片，汇总结果，并路由 **INSERT** 以均匀分发数据。

## 分布式表创建 {#distributed-table-creation}

为了说明 **SELECT** 查询转发和 **INSERT** 路由，我们考虑 [What are table parts](/parts) 示例表，该表在两个 ClickHouse 服务器上的两个分片中拆分。首先，我们展示创建对应 **分布式表** 的 DDL 语句：


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

`ON CLUSTER` 子句使 DDL 语句成为一个 [分布式 DDL 语句](/docs/sql-reference/distributed-ddl)，指示 ClickHouse 在 `test_cluster` [集群定义](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration) 中列出的所有服务器上创建表。分布式 DDL 需要在 [集群架构](/docs/architecture/horizontal-scaling#architecture-diagram) 中额外添加一个 [Keeper](https://clickhouse.com/clickhouse/keeper) 组件。

对于 [分布式引擎参数](/docs/engines/table-engines/special/distributed#distributed-parameters)，我们指定集群名称（`test_cluster`），分片目标表的数据库名称（`uk`），分片目标表的名称（`uk_price_paid_simple`），以及用于 INSERT 路由的 **分片键**。在此示例中，我们使用 [rand](/sql-reference/functions/random-functions#rand) 函数随机分配行到分片。然而，可以根据用例使用任何表达式——甚至复杂的表达式——作为分片键。下一节说明 INSERT 路由的工作原理。

## INSERT 路由 {#insert-routing}

下面的图示说明了 ClickHouse 中如何处理对分布式表的 INSERT 操作：

<img src={image_03} alt='SHARDS' class='image' />
<br/>

① 针对分布式表的 INSERT（仅一行）被发送到承载该表的 ClickHouse 服务器，可以是直接发送或通过负载均衡器发送。

② 对于来自 INSERT 的每一行（在我们的示例中只有一行），ClickHouse 评估分片键（这里为 rand()），将结果取模分片服务器的数量，并将其用作目标服务器 ID（ID 从 0 开始并递增 1）。该行随后被转发并 ③ 插入到对应服务器的表分片中。

下一节解释 SELECT 转发的工作原理。

## SELECT 转发 {#select-forwarding}

此图显示了 ClickHouse 中如何处理针对分布式表的 SELECT 查询：

<img src={image_04} alt='SHARDS' class='image' />
<br/>

① 针对分布式表的 SELECT 聚合查询被发送到相应的 ClickHouse 服务器，可以是直接发送或通过负载均衡器发送。

② 分布式表将查询转发给所有承载目标表分片的服务器，每个 ClickHouse 服务器并行计算其本地聚合结果。

然后，承载最初针对的分布式表的 ClickHouse 服务器 ③ 收集所有本地结果， ④ 将它们合并为最终的全局结果，并 ⑤ 将其返回给查询发送者。

## ClickHouse 中的表副本是什么？ {#what-are-table-replicas-in-clickhouse}

ClickHouse 中的复制通过在多个服务器之间维护 **分片数据的副本** 来确保 **数据完整性** 和 **故障转移**。由于硬件故障是不可避免的，复制通过确保每个分片有多个副本来防止数据丢失。写操作可以被定向到任何副本，可以是直接进行或通过 [分布式表](#distributed-table-creation) 选择执行操作的副本。更改会自动传播到其他副本。在发生故障或维护时，数据在其他副本中仍然可用，一旦故障的主机恢复，它会自动同步以保持最新。

请注意，复制要求在 [集群架构](/docs/architecture/horizontal-scaling#architecture-diagram) 中有一个 [Keeper](https://clickhouse.com/clickhouse/keeper) 组件。

下图展示了一个包含六台服务器的 ClickHouse 集群，其中之前介绍的两个表分片 `Shard-1` 和 `Shard-2` 各有三个副本。一个查询被发送到该集群：

<img src={image_05} alt='SHARDS' class='image' />
<br/>

查询处理的工作方式与没有副本的设置类似，只有来自每个分片的一个副本执行查询。

> 副本不仅确保数据完整性和故障转移，还通过允许多个查询在不同副本之间并行运行来提高查询处理吞吐量。

① 针对分布式表的查询被发送到相应的 ClickHouse 服务器，可以是直接发送或通过负载均衡器发送。

② 分布式表将查询转发给每个分片的一个副本，每个承载所选副本的 ClickHouse 服务器并行计算其本地查询结果。

其余的工作与没有副本的设置中的 [相同](#select-forwarding)，在上面的图中未显示。承载最初目标分布式表的 ClickHouse 服务器收集所有本地结果，将它们合并为最终的全局结果，并将其返回给查询发送者。

请注意，ClickHouse 允许配置查询转发策略。在默认情况下——与上面的图示不同——分布式表会 [优先选择](/docs/operations/settings/settings#prefer_localhost_replica) 可用的本地副本，但可以使用其他负载均衡 [策略](/docs/operations/settings/settings#load_balancing)。

## 哪里可以找到更多信息 {#where-to-find-more-information}

有关表分片和副本的更多详细信息，请查看我们的 [deployment and scaling guide](/docs/architecture/horizontal-scaling)。 

我们还强烈推荐这个教程视频，以更深入地了解 ClickHouse 的分片和副本：

<iframe width="768" height="432" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
