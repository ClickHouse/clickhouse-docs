---
sidebar_label: '概览'
slug: /migrations/snowflake-overview
description: '从 Snowflake 迁移到 ClickHouse'
keywords: ['Snowflake']
title: '从 Snowflake 迁移到 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

import snowflake_architecture from '@site/static/images/cloud/onboard/discover/use_cases/snowflake_architecture.png';
import cloud_architecture from '@site/static/images/cloud/onboard/discover/use_cases/cloud_architecture.png';
import Image from '@theme/IdealImage';


# 从 Snowflake 迁移到 ClickHouse {#snowflake-to-clickhouse-migration}

> 本文档介绍如何将数据从 Snowflake 迁移到 ClickHouse。

Snowflake 是一个云数据仓库，主要专注于将传统的本地部署数据仓库负载迁移到云端。它针对大规模执行长时间运行的报表进行了充分优化。随着数据集迁移到云端，数据所有者开始思考还能如何从这些数据中提取价值，包括利用这些数据集为内部和外部场景提供实时应用支持。此时，他们往往会意识到自己需要一款针对实时分析进行了优化的数据库，例如 ClickHouse。

## 对比 {#comparison}

在本节中，我们将比较 ClickHouse 和 Snowflake 的关键特性。

### 相似之处 {#similarities}

Snowflake 是一个基于云的数据仓库平台，为存储、处理和分析海量数据提供可扩展且高效的解决方案。
与 ClickHouse 一样，Snowflake 并不是构建在现有技术之上，而是依赖其自身的 SQL 查询引擎和定制架构。

Snowflake 的架构被描述为共享存储（共享磁盘）架构与共享无（shared-nothing）架构之间的混合体。共享存储架构中，数据可以通过诸如 S3 之类的对象存储从所有计算节点访问。共享无架构中，每个计算节点在本地存储整套数据中的一部分以响应查询。理论上，这种方式结合了两种模型的优点：共享磁盘架构的简单性和共享无架构的可扩展性。

这一设计从根本上依赖对象存储作为主要存储介质，在并发访问下几乎可以无限扩展，同时提供高可靠性和可扩展吞吐量保证。

下图来自 [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)
展示了该架构：

<Image img={snowflake_architecture} size="md" alt="Snowflake 架构" />

相对地，作为一个开源且支持 Cloud 托管的产品，ClickHouse 可以以共享磁盘和共享无这两种架构方式进行部署。后一种架构在自管理部署中较为典型。虽然这使得 CPU 和内存可以轻松扩展，但共享无架构的配置会引入经典的数据管理挑战和数据复制开销，尤其是在集群成员变更期间。

出于这一原因，ClickHouse Cloud 采用了一种在概念上与 Snowflake 类似的共享存储架构。数据在对象存储中只保存一份（单副本），例如 S3 或 GCS，从而提供几乎无限的存储以及强冗余保证。每个节点都可以访问这份数据，并拥有自己的本地 SSD 用于缓存。节点可以按需扩展，以提供额外的 CPU 和内存资源。与 Snowflake 类似，S3 的可扩展性特性通过确保集群中现有节点可用的 I/O 吞吐量不会因为新增节点而受到影响，从而解决了共享磁盘架构的经典限制（磁盘 I/O 和网络瓶颈）。

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud 架构" />

### 差异 {#differences}

除了底层存储格式和查询引擎之外，这些架构在一些细微之处也有所不同：

* Snowflake 中的计算资源通过名为 [warehouses](https://docs.snowflake.com/en/user-guide/warehouses) 的概念提供。
  每个 warehouse 由若干节点组成，每个节点具有固定规格。尽管 Snowflake
  没有公开其 warehouse 的具体架构，但
  [普遍认为](https://select.dev/posts/snowflake-warehouse-sizing)
  每个节点包含 8 个 vCPU、16 GiB 内存以及 200 GB 的本地存储（用于缓存）。
  节点数量基于 T 恤尺码（t-shirt size）决定，例如 x-small 有 1 个节点，small 有 2 个，medium 有 4 个，large 有 8 个，等等。这些 warehouses 与数据解耦，
  可以用来查询对象存储上的任意数据库。当空闲且未承受查询负载时，
  warehouses 会被暂停——在接收到查询时再恢复运行。存储成本始终会反映在账单中，而
  warehouses 仅在处于活动状态时计费。

* ClickHouse Cloud 采用类似的“具有本地缓存存储的节点”原则。
  不同于基于 T 恤尺码的配置，用户部署的是具有总计算资源和可用 RAM 的服务。
  随后，该服务会在定义的范围内根据查询负载透明地自动扩缩容——
  要么通过为每个节点增加（或减少）资源进行纵向扩缩容，要么
  通过增加或减少节点总数进行横向扩缩容。ClickHouse
  Cloud 节点具有 1:1 的 CPU 与内存比，这一点不同于 Snowflake 的配置。
  虽然可以实现更松散的耦合，但服务与数据是绑定的，
  这与 Snowflake warehouses 不同。节点在空闲时同样会暂停，
  在承受查询负载时再恢复。用户也可以在需要时手动调整服务规格。

* ClickHouse Cloud 的查询缓存是节点级别的，这不同于
  Snowflake 在独立于 warehouse 的服务层提供缓存的方式。
  根据基准测试结果，ClickHouse Cloud 的节点缓存性能优于
  Snowflake 的缓存。

* Snowflake 和 ClickHouse Cloud 在通过扩展来提升查询并发性方面采取了不同的方法。
  Snowflake 通过一项称为
  [multi-cluster warehouses](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses)
  的特性来实现。该特性允许用户向一个 warehouse 添加多个集群。
  虽然这不会改善单个查询的延迟，但可以提供更多并行度，
  从而支持更高的查询并发性。ClickHouse 则是通过纵向或横向扩缩容，
  为服务增加更多内存和 CPU 来实现这一点。我们在这篇博客中没有深入探讨
  这些服务在扩展到更高并发性方面的能力，
  而是专注于延迟表现，但也承认要进行完整的对比，这部分工作仍需开展。
  不过，我们预计 ClickHouse 在任何并发性测试中都会有良好表现，
  尤其是考虑到 Snowflake 明确将
  [单个 warehouse 的并发查询数默认限制为 8](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)。
  相比之下，ClickHouse Cloud 允许每个节点最多执行 1000 个查询。

* Snowflake 能够针对数据集切换计算规格，并结合其 warehouse 的快速恢复时间，
  使其在临时（ad hoc）查询场景下提供了极佳的使用体验。
  对于数据仓库和数据湖用例，这相比其他系统是一大优势。

### 实时分析 {#real-time-analytics}

基于公开的[基准测试](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)数据，
在实时分析应用的以下几个方面，ClickHouse 的表现优于 Snowflake：

* **查询延迟**：即使对表进行聚簇来优化性能，Snowflake 查询的延迟仍然更高。
  在我们的测试中，当对属于 Snowflake 聚簇键或 ClickHouse 主键的列应用过滤条件时，
  Snowflake 需要超过两倍的计算资源才能达到与 ClickHouse 等效的性能。虽然
  Snowflake 的[持久查询缓存](https://docs.snowflake.com/en/user-guide/querying-persisted-results)
  在一定程度上可以缓解这些延迟问题，但在过滤条件更加多样化的场景下，其效果并不理想。
  此外，当底层数据发生变化、表被修改时，缓存条目会失效，从而进一步削弱查询缓存的效果。
  虽然在我们的基准测试应用中不存在这种情况，但在真实部署中，往往需要持续插入新的、最新的数据。
  需要注意的是，ClickHouse 的查询缓存是节点级别的，且并非[事务一致的](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)，
  这使其[更适合](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
  用于实时分析。用户还可以对其使用方式进行细粒度控制，包括是否在[每个查询级别](/operations/settings/settings#use_query_cache)启用缓存、
  控制其[精确大小](/operations/settings/settings#query_cache_max_size_in_bytes)，
  控制某个[查询是否写入缓存](/operations/settings/settings#enable_writes_to_query_cache)
  （包括对缓存时长或所需执行次数的限制），以及是否仅[被动使用](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)缓存。

* **更低成本**：Snowflake 仓库可以配置为在一段时间没有查询活动后挂起。
  一旦挂起，就不会产生费用。实际上，这个空闲检查的时间间隔[最短只能设置为 60 秒](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。
  当接收到查询时，仓库会在数秒内自动恢复。由于 Snowflake 仅在仓库处于使用状态时对资源计费，
  这种行为非常适合经常处于空闲状态的工作负载，如临时（ad-hoc）查询。

  然而，许多实时分析工作负载需要持续的实时数据摄取以及频繁查询（例如
  面向客户的仪表盘），这类场景并不能从空闲中获益。这意味着仓库通常必须保持完全
  活跃并持续产生费用。这抵消了通过空闲获得的成本优势，以及 Snowflake 能够比其他方案
  更快恢复到响应状态所带来的任何性能优势。当这一始终活跃的要求与 ClickHouse Cloud
  在活跃状态下更低的按秒计费成本结合在一起时，对于此类工作负载，ClickHouse Cloud
  能够提供显著更低的总体成本。

* **功能的可预测定价：** 在实时分析用例中，要实现最高性能水平，需要使用 materialized views
  和聚簇（相当于 ClickHouse 的 `ORDER BY`）。这些功能在 Snowflake 中会产生额外费用，
  不仅需要升级到更高的服务等级（使每个 credit 的成本提高 1.5 倍），还会产生不可预测的后台成本。
  例如，materialized views 会产生后台维护成本，聚簇同样如此，并且这些成本在使用前很难预估。
  相比之下，这些功能在 ClickHouse Cloud 中本身不收取额外费用，只有在写入时增加少量
  额外的 CPU 和内存使用量，而在非高写入工作负载的场景中，这通常可以忽略不计。
  我们在基准测试中观察到，这些差异，再加上更低的查询延迟和更高的压缩率，使得
  ClickHouse 的总体成本显著降低。