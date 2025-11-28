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

Snowflake 是一个云数据仓库，主要用于将传统的本地部署数据仓库工作负载迁移到云端。它针对大规模执行长时间运行的报表查询进行了良好的优化。随着数据集迁移到云端，数据所有者开始思考还能如何从这些数据中提取更多价值，包括使用这些数据集为内部和外部的实时应用场景提供支持。在这种情况下，他们往往会意识到需要一个针对实时分析优化的数据库，例如 ClickHouse。



## 比较 {#comparison}

本节将对比 ClickHouse 和 Snowflake 的关键特性。

### 相似之处 {#similarities}

Snowflake 是一个基于云的数据仓库平台，为存储、处理和分析海量
数据提供了可扩展且高效的解决方案。
与 ClickHouse 类似，Snowflake 不是构建在现有技术之上，而是依赖
其自有的 SQL 查询引擎和定制架构。

Snowflake 的架构被描述为共享存储（shared-disk）架构与 shared-nothing
架构的混合体。共享存储架构是指所有计算节点都可以使用诸如 S3
之类的对象存储访问数据。shared-nothing 架构是指每个计算节点
在本地存储整个数据集的一部分以响应查询。从理论上讲，这种设计
兼具两种模型的优点：共享磁盘架构的简洁性，以及 shared-nothing
架构的可扩展性。

这种设计从根本上依赖对象存储作为主存储介质，
在并发访问下几乎可以无限扩展，同时提供高可靠性以及可扩展的吞吐量保证。

下图摘自 [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)，
展示了这一架构：

<Image img={snowflake_architecture} size="md" alt="Snowflake 架构" />

相对而言，作为一个开源并同时支持云托管的产品，ClickHouse 可以在
共享磁盘和 shared-nothing 两种架构中进行部署。后者在自管型部署中较为常见。
虽然这种方式便于轻松扩展 CPU 和内存，但 shared-nothing 配置会引入经典的数据管理挑战，
以及数据复制的额外开销，尤其是在成员变更期间。

基于上述原因，ClickHouse Cloud 采用了与 Snowflake 在概念上相似的共享存储架构。
数据仅以单份形式存储在对象存储中（单副本），例如 S3 或 GCS，
在提供几乎无限存储空间的同时具备强冗余保证。每个节点既可以访问这份
数据的单副本，也拥有本地 SSD 以用于缓存。节点可以按需扩展，
以提供额外的 CPU 和内存资源。与 Snowflake 一样，
S3 的可扩展性特性解决了共享磁盘架构的经典限制（磁盘 I/O 和网络瓶颈），
通过确保集群中当前节点可用的 I/O 吞吐量不会因新增节点而受到影响。

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud 架构" />

### 不同之处 {#differences}

除了底层存储格式和查询引擎，这些架构在一些细微之处也存在差异：

* Snowflake 中的计算资源通过 [warehouses](https://docs.snowflake.com/en/user-guide/warehouses)
  的概念提供。
  一个 warehouse 由若干节点组成，每个节点具有固定规格。尽管 Snowflake
  并未公开其 warehouse 的具体架构，但
  [一般认为](https://select.dev/posts/snowflake-warehouse-sizing)
  每个节点由 8 个 vCPU、16GiB 内存和 200GB 本地存储（用于缓存）构成。
  节点数量取决于 T 恤尺码（t-shirt size），例如 x-small 有 1 个节点、
  small 有 2 个、medium 有 4 个、large 有 8 个，等等。这些 warehouses
  与数据相互独立，可用于查询任何位于对象存储上的数据库。当空闲且未承受查询负载时，
  warehouses 会被暂停——在收到查询时再恢复。虽然存储成本总会体现在计费中，
  但 warehouses 仅在处于活动状态时才会计费。

* ClickHouse Cloud 采用了类似的“具有本地缓存存储的节点”原则。
  不同于 T 恤尺码模式，用户部署的是具有总计算量和可用内存规格的服务。
  该服务随后会根据查询负载在定义的范围内透明地自动扩缩容——
  要么通过为每个节点增加（或减少）资源进行垂直扩展，要么通过升高或降低
  节点总数进行水平扩展。当前 ClickHouse Cloud 节点的 CPU 与内存比为 1:1，
  不同于 Snowflake 的配置比例。虽然在技术上可以实现更松散的耦合，
  但目前服务与数据是绑定在一起的，这一点不同于 Snowflake 的 warehouses。
  节点在空闲时同样会暂停，在收到查询时恢复。用户也可以在需要时手动调整服务规格。

* ClickHouse Cloud 的查询缓存目前是节点级别的，而
  Snowflake 的查询缓存是在独立于 warehouse 的服务层提供的。
  基于基准测试结果，ClickHouse Cloud 的节点缓存性能优于 Snowflake 的查询缓存。



* Snowflake 和 ClickHouse Cloud 在通过扩展来提升查询并发性方面采用了不同的方法。Snowflake 通过名为[多集群仓库](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses)的特性来实现这一点。
  该特性允许用户向一个 warehouse 添加集群。尽管这对查询延迟没有任何改善，但确实提供了额外的并行处理能力，并允许更高的查询并发性。ClickHouse 则通过垂直或水平扩展为服务增加更多内存和 CPU 来实现这一点。我们在这篇博客中并未深入探讨这些服务在更高并发下的扩展能力，而是侧重于延迟表现，不过我们也承认，为了进行完整的对比，应当在并发性方面补充相关工作。不过，我们预期 ClickHouse 在任何并发性测试中都将有出色表现，而 Snowflake 明确地将[单个 warehouse 默认允许的并发查询数限制为 8](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)。
  作为对比，ClickHouse Cloud 允许每个节点最多执行 1000 个查询。

* Snowflake 能够为同一数据集切换计算规格，并且 warehouse 具有快速恢复时间，这使其在即席查询方面拥有极佳的使用体验。对于数据仓库和数据湖用例，这相较其他系统提供了优势。

### Real-time analytics {#real-time-analytics}

基于公开的[基准测试](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)数据，
ClickHouse 在以下方面在实时分析应用场景中优于 Snowflake：

* **查询延迟**：即使对表进行了聚簇以优化性能，Snowflake 查询仍然具有更高的查询延迟。在我们的测试中，对于那些在过滤条件中使用了 Snowflake 聚簇键或 ClickHouse 主键的查询，Snowflake 需要超过两倍的计算资源才能达到与 ClickHouse 等效的性能。尽管 Snowflake 的[持久化查询缓存](https://docs.snowflake.com/en/user-guide/querying-persisted-results)在一定程度上缓解了这些延迟问题，但在过滤条件更加多样化的场景中，该机制就难以奏效。底层数据的变化还会进一步影响查询缓存的有效性，当表发生变化时缓存条目会失效。虽然在我们这个基准测试的应用场景中并非如此，但在真实部署中，需要插入新的、更近期的数据。需要注意的是，ClickHouse 的查询缓存是特定于节点的，并且不是[事务一致的](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)，这使其[更适合](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)实时分析。用户还可以对其使用进行精细控制，例如在[单个查询级别](/operations/settings/settings#use_query_cache)控制是否使用查询缓存、配置其[精确大小](/operations/settings/settings#query_cache_max_size_in_bytes)、控制[查询是否写入缓存](/operations/settings/settings#enable_writes_to_query_cache)（基于持续时间或所需执行次数的限制），以及是否只以[被动方式使用](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)缓存。

* **更低成本**：Snowflake 的 warehouse 可以配置为在一段查询空闲期后自动挂起。挂起后将不再产生费用。实际上，该空闲检测[只能被降低到 60 秒](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。一旦接收到查询，warehouse 会在数秒内自动恢复。由于 Snowflake 仅在 warehouse 处于使用状态时对资源计费，这种行为非常适合经常处于空闲状态的工作负载，例如即席查询。



  However, many real-time analytics workloads require ongoing real-time data 
  摄取 and frequent querying that doesn't benefit from idling (like 
  customer-facing dashboards). This means warehouses must often be fully 
  active and incurring charges. This negates the cost-benefit of idling as 
  well as any performance advantage that may be associated with Snowflake's 
  ability to resume a responsive state faster than alternatives. This active 
  state requirement, when combined with ClickHouse Cloud's lower per-second 
  cost for an active state, results in ClickHouse Cloud offering a 
  significantly lower total cost for these kinds of workloads.

* **功能的可预测定价：** 像物化视图 
  和聚簇（等同于 ClickHouse 的 ORDER BY）这样的功能，是在实时分析场景中获得最高性能所必需的。These 
  features incur additional charges in Snowflake, requiring not only a 
  higher tier, which increases costs per credit by 1.5x, but also 
  unpredictable background costs. For instance, materialized views incur a 
  background maintenance cost, as does clustering, which is hard to predict 
  prior to use. In contrast, these features incur no additional cost in 
  ClickHouse Cloud, except additional CPU and memory usage at insert time, 
  typically negligible outside of high insert workload use cases. We have 
  observed in our benchmark that these differences, along with lower query 
  latencies and higher compression, result in significantly lower costs with 
  ClickHouse.
