---
'slug': '/shards'
'title': '表分片和副本'
'description': '在 ClickHouse 中，表分片和副本是什么'
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
此主题不适用于 ClickHouse Cloud，其中 [Parallel Replicas](/docs/deployment-guides/parallel-replicas) 像传统的无共享 ClickHouse 集群中的多个分片一样工作，而对象存储则 [取代](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates#shared-object-storage-for-data-availability) 副本，确保高可用性和容错性。
:::

## ClickHouse 中的表分片是什么？ {#what-are-table-shards-in-clickhouse}

在传统的 [shared-nothing](https://en.wikipedia.org/wiki/Shared-nothing_architecture) ClickHouse 集群中，当 ① 数据量太大而无法在单台服务器上处理，或 ② 单台服务器处理数据的速度太慢时，会使用分片。在下图中，显示了第 ① 种情况，其中 [uk_price_paid_simple](/parts) 表超出了单台机器的容量：

<Image img={image_01} size="lg" alt='SHARDS'/>

<br/>

在这种情况下，数据可以以表分片的形式分散在多个 ClickHouse 服务器上：

<Image img={image_02} size="lg" alt='SHARDS'/>

<br/>

每个分片保存数据的子集，并作为常规的 ClickHouse 表独立查询。然而，查询将仅处理该子集，这可能是根据数据分布而合适的用例。通常，一个 [distributed table](/docs/engines/table-engines/special/distributed)（通常按服务器）提供了完整数据集的统一视图。它并不存储数据，而是将 **SELECT** 查询转发到所有分片，组装结果，并将 **INSERTS** 定向到各分片，以均匀分布数据。

## 分布式表创建 {#distributed-table-creation}

为了说明 **SELECT** 查询转发和 **INSERT** 路由，我们考虑在两台 ClickHouse 服务器上跨两个分片拆分的 [What are table parts](/parts) 示例表。首先，我们展示创建相应 **Distributed table** 的 DDL 语句：


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

`ON CLUSTER` 子句使 DDL 语句成为一个 [distributed DDL statement](/docs/sql-reference/distributed-ddl)，指示 ClickHouse 在 `test_cluster` [集群定义](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration) 中列出的所有服务器上创建表。分布式 DDL 需要在 [集群架构](/docs/architecture/horizontal-scaling#architecture-diagram) 中添加一个 [Keeper](https://clickhouse.com/clickhouse/keeper) 组件。

对于 [distributed engine parameters](/docs/engines/table-engines/special/distributed#distributed-parameters)，我们指定集群名称 (`test_cluster`)、分片目标表的数据库名称 (`uk`)、分片目标表的名称 (`uk_price_paid_simple`)，以及 **分片键** 用于 INSERT 路由。在这个例子中，我们使用 [rand](/sql-reference/functions/random-functions#rand) 函数随机分配行到分片。然而，任何表达式—甚至复杂的表达式—都可以用作分片键，具体取决于用例。下一部分阐明了 INSERT 路由的工作原理。

## INSERT 路由 {#insert-routing}

下面的图示说明了 ClickHouse 中向分布式表进行 INSERT 的处理方式：

<Image img={image_03} size="lg" alt='SHARDS'/>

<br/>

① 针对分布式表的 INSERT（带有单行）被发送到托管该表的 ClickHouse 服务器，可以是直接发送或通过负载均衡器。

② 针对 INSERT 的每一行（在我们的例子中只有一行），ClickHouse 评估分片键（此处为 rand()），将结果对分片服务器的数量取模，并将其用作目标服务器 ID（ID 从 0 开始并递增）。然后，该行被转发并 ③ 插入到相应服务器的表分片中。

下一部分解释 SELECT 转发的工作原理。

## SELECT 转发 {#select-forwarding}

该图显示了 ClickHouse 中使用分布式表处理 SELECT 查询的方式：

<Image img={image_04} size="lg" alt='SHARDS'/>

<br/>

① 针对分布式表的 SELECT 聚合查询被发送到相应的 ClickHouse 服务器，可以是直接发送或通过负载均衡器。

② 分布式表将查询转发给所有托管目标表分片的服务器，其中每个 ClickHouse 服务器并行计算本地聚合结果。

然后，托管最初目标分布式表的 ClickHouse 服务器 ③ 收集所有本地结果， ④ 将其合并为最终的全局结果，并 ⑤ 将其返回给查询发起者。

## ClickHouse 中的表副本是什么？ {#what-are-table-replicas-in-clickhouse}

ClickHouse 中的复制确保 **数据完整性** 和 **故障切换**，通过在多个服务器上维护 **分片数据的副本**。由于硬件故障是不可避免的，复制通过确保每个分片有多个副本来防止数据丢失。写入可以直接或通过 [distributed table](#distributed-table-creation) 定向到任何副本，该表为操作选择一个副本。更改会自动传播到其他副本。在故障或维护情况下，数据在其他副本上仍然可用，一旦故障主机恢复，它会自动同步以保持最新。

请注意，复制需要在 [集群架构](/docs/architecture/horizontal-scaling#architecture-diagram) 中添加 [Keeper](https://clickhouse.com/clickhouse/keeper) 组件。

以下图示说明了一个由六个服务器组成的 ClickHouse 集群，其中之前介绍的两个表分片 `Shard-1` 和 `Shard-2` 各有三个副本。查询被发送到此集群：

<Image img={image_05} size="lg" alt='SHARDS'/>

<br/>

查询处理的工作原理类似于没有副本的设置，只有来自每个分片的一个副本执行查询。

> 副本不仅确保数据完整性和故障切换，还通过允许多个查询在不同副本上并行运行来提高查询处理吞吐量。

① 针对分布式表的查询被发送到相应的 ClickHouse 服务器，可以是直接发送或通过负载均衡器。

② 分布式表将查询转发给每个分片的一个副本，其中每个托管所选副本的 ClickHouse 服务器并行计算本地查询结果。

剩余的处理与没有副本的设置 [相同](#select-forwarding)，并未在上面的图中显示。托管最初目标分布式表的 ClickHouse 服务器收集所有本地结果，将其合并为最终的全局结果，并将其返回给查询发送者。

请注意，ClickHouse 允许为 ② 配置查询转发策略。默认情况下—与上面的图示相反—分布式表如果可用，将优先选择本地副本，但可以使用其他负载均衡 [策略](/docs/operations/settings/settings#load_balancing)。

## 哪里可以找到更多信息 {#where-to-find-more-information}

有关表分片和副本的更多详细信息，请查阅我们的 [deployment and scaling guide](/docs/architecture/horizontal-scaling)。

我们还强烈推荐这段教程视频，深入探讨 ClickHouse 的分片和副本：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
