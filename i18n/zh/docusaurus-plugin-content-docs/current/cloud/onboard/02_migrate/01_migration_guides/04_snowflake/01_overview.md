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


# 从 Snowflake 迁移到 ClickHouse

> 本文档介绍如何将数据从 Snowflake 迁移到 ClickHouse。

Snowflake 是一款云数据仓库，主要用于将传统本地部署的数据仓库工作负载迁移到云端。它针对在大规模场景下执行长时间运行的报表查询进行了良好的优化。随着数据集迁移到云端，数据所有者开始思考还能如何从这些数据中挖掘价值，包括利用这些数据集为内部和外部用例提供实时应用支持。在这种情况下，他们往往会意识到自己需要一款针对实时分析进行了优化的数据库，例如 ClickHouse。



## 对比 {#comparison}

在本节中,我们将对比 ClickHouse 和 Snowflake 的关键特性。

### 相似之处 {#similarities}

Snowflake 是一个基于云的数据仓库平台,为存储、处理和分析大量数据提供可扩展且高效的解决方案。

与 ClickHouse 类似,Snowflake 并非构建于现有技术之上,而是依赖于自己的 SQL 查询引擎和定制架构。

Snowflake 的架构被描述为共享存储(共享磁盘)架构和无共享架构之间的混合体。共享存储架构是指所有计算节点都可以通过对象存储(如 S3)访问数据。无共享架构是指每个计算节点在本地存储整个数据集的一部分以响应查询。理论上,这种设计结合了两种模型的优点:共享磁盘架构的简单性和无共享架构的可扩展性。

这种设计从根本上依赖对象存储作为主要存储介质,在并发访问下几乎可以无限扩展,同时提供高可靠性和可扩展的吞吐量保证。

下图来自 [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts),展示了这种架构:

<Image img={snowflake_architecture} size='md' alt='Snowflake 架构' />

相反,作为开源和云托管产品,ClickHouse 可以部署在共享磁盘和无共享架构中。后者是自管理部署的典型方式。虽然无共享配置允许轻松扩展 CPU 和内存,但它引入了经典的数据管理挑战和数据复制开销,尤其是在集群成员变更期间。

因此,ClickHouse Cloud 采用了在概念上与 Snowflake 类似的共享存储架构。数据在对象存储(如 S3 或 GCS)中存储一次(单一副本),提供几乎无限的存储空间和强大的冗余保证。每个节点都可以访问这个单一数据副本,并拥有自己的本地 SSD 用于缓存。节点可以根据需要进行扩展,以提供额外的 CPU 和内存资源。与 Snowflake 类似,S3 的可扩展性特性解决了共享磁盘架构的经典限制(磁盘 I/O 和网络瓶颈),确保在添加额外节点时,集群中当前节点可用的 I/O 吞吐量不受影响。

<Image img={cloud_architecture} size='md' alt='ClickHouse Cloud 架构' />

### 差异 {#differences}

除了底层存储格式和查询引擎之外,这些架构在一些细微之处存在差异:

- Snowflake 中的计算资源通过 [warehouse](https://docs.snowflake.com/en/user-guide/warehouses) 概念提供。这些 warehouse 由多个节点组成,每个节点具有固定大小。虽然 Snowflake 没有公布其 warehouse 的具体架构,但[普遍认为](https://select.dev/posts/snowflake-warehouse-sizing)每个节点包含 8 个 vCPU、16GiB 内存和 200GB 本地存储(用于缓存)。节点数量取决于规格大小,例如 x-small 有 1 个节点,small 有 2 个,medium 有 4 个,large 有 8 个,依此类推。这些 warehouse 独立于数据,可用于查询驻留在对象存储上的任何数据库。当空闲且没有查询负载时,warehouse 会暂停,在收到查询时恢复。虽然存储成本始终反映在账单中,但 warehouse 仅在活动时收费。

- ClickHouse Cloud 采用类似的节点原则,配备本地缓存存储。用户部署服务时不是选择规格大小,而是指定总计算量和可用内存。服务会根据查询负载在定义的限制内透明地自动扩展,通过垂直扩展增加(或减少)每个节点的资源,或通过水平扩展提高/降低节点总数。ClickHouse Cloud 节点当前的 CPU 与内存比率为 1:1,与 Snowflake 的 1:2 不同。虽然可以实现更松散的耦合,但服务目前与数据耦合,这与 Snowflake warehouse 不同。节点在空闲时也会暂停,在接收查询时恢复。用户还可以根据需要手动调整服务大小。

- ClickHouse Cloud 的查询缓存目前是节点特定的,而 Snowflake 的查询缓存在独立于 warehouse 的服务层提供。根据基准测试,ClickHouse Cloud 的节点缓存性能优于 Snowflake。


- Snowflake 和 ClickHouse Cloud 采用不同的扩展方式来提高查询并发能力。Snowflake 通过[多集群仓库](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses)功能来实现这一点。该功能允许用户向仓库添加集群。虽然这不会改善查询延迟,但确实提供了额外的并行化能力,并支持更高的查询并发。ClickHouse 则通过垂直或水平扩展为服务增加更多内存和 CPU 来实现。本文不探讨这些服务扩展到更高并发的能力,而是专注于延迟,但我们认为应该进行这方面的工作以实现完整的比较。不过,我们预期 ClickHouse 在任何并发测试中都会表现出色,而 Snowflake 明确将[仓库默认允许的并发查询数限制为 8 个](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)。相比之下,ClickHouse Cloud 允许每个节点执行多达 1000 个查询。

- Snowflake 能够在数据集上灵活切换计算规模,加上仓库的快速恢复时间,为即席查询提供了出色的体验。对于数据仓库和数据湖场景,这相比其他系统具有优势。

### 实时分析 {#real-time-analytics}

基于公开的[基准测试](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)数据,ClickHouse 在实时分析应用的以下方面优于 Snowflake:

- **查询延迟**:即使对表应用聚簇来优化性能,Snowflake 查询仍然具有更高的延迟。在我们的测试中,对于应用了 Snowflake 聚簇键或 ClickHouse 主键作为过滤条件的查询,Snowflake 需要超过两倍的计算资源才能达到与 ClickHouse 相当的性能。虽然 Snowflake 的[持久查询缓存](https://docs.snowflake.com/en/user-guide/querying-persisted-results)可以缓解部分延迟问题,但在过滤条件更加多样化的情况下效果有限。查询缓存的有效性还会受到底层数据变化的影响,当表发生变化时缓存条目会失效。虽然在我们应用的基准测试中不存在这种情况,但实际部署需要插入新的、最新的数据。需要注意的是,ClickHouse 的查询缓存是节点级别的,并且不具备[事务一致性](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design),这使其[更适合](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)实时分析场景。用户还可以对其使用进行精细控制,包括[按查询控制](/operations/settings/settings#use_query_cache)其使用、设置其[精确大小](/operations/settings/settings#query_cache_max_size_in_bytes)、控制[查询是否被缓存](/operations/settings/settings#enable_writes_to_query_cache)(基于持续时间限制或所需执行次数),以及是否仅[被动使用](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)。

- **更低的成本**:Snowflake 仓库可以配置为在一段查询不活动时间后暂停。暂停后不会产生费用。实际上,这个不活动检查时间[最低只能设置为 60 秒](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。一旦收到查询,仓库将在几秒钟内自动恢复。由于 Snowflake 仅在仓库使用时收取资源费用,这种机制适合经常处于空闲状态的工作负载,例如即席查询。


  然而，许多实时分析工作负载需要持续的实时数据写入和频繁查询（如面向客户的看板），并不能从空闲中获益。这意味着数据仓库往往必须保持持续活跃状态，从而产生费用。这抵消了通过空闲节省成本的优势，也削弱了 Snowflake 相比其他方案在“更快恢复到可响应状态”方面可能带来的性能优势。当这一对活跃状态的要求与 ClickHouse Cloud 在活跃状态下更低的按秒计费成本结合起来时，就使得 ClickHouse Cloud 在这类工作负载上能够提供显著更低的总体成本。

* **功能定价可预测：** 在实时分析用例中，要实现最高级别的性能，诸如物化视图和聚簇（相当于 ClickHouse 的 `ORDER BY`）等功能是必需的。在 Snowflake 中使用这些功能会产生额外费用，不仅需要升级到更高的服务档位，将每个 credit 的成本提高 1.5 倍，还会带来难以预估的后台成本。例如，物化视图会产生后台维护成本，聚簇同样如此，而且这些成本在使用前很难预测。相比之下，在 ClickHouse Cloud 中，这些功能本身不会单独计费，除了在插入时会额外消耗一些 CPU 和内存——在非高写入负载的用例中，这部分通常可以忽略不计。我们在基准测试中观察到，这些差异，再加上更低的查询延迟和更高的压缩率，使得使用 ClickHouse 的总体成本显著降低。
