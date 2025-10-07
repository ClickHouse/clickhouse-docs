---
'sidebar_label': '概述'
'slug': '/migrations/snowflake-overview'
'description': '从 Snowflake 迁移到 ClickHouse'
'keywords':
- 'Snowflake'
'title': '从 Snowflake 迁移到 ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
---

import snowflake_architecture from '@site/static/images/cloud/onboard/discover/use_cases/snowflake_architecture.png';
import cloud_architecture from '@site/static/images/cloud/onboard/discover/use_cases/cloud_architecture.png';
import Image from '@theme/IdealImage';


# Snowflake 到 ClickHouse 的迁移

> 本文档提供了从 Snowflake 迁移数据到 ClickHouse 的介绍。

Snowflake 是一个以云数据仓库为主的产品，主要专注于将传统的本地数据仓库工作负载迁移到云端。它经过良好优化，能够在大规模环境中执行长时间运行的报告。随着数据集迁移到云端，数据拥有者开始思考如何从这些数据中提取更多价值，包括利用这些数据集来支撑内部和外部用例的实时应用。当这种情况发生时，他们通常意识到需要一个优化以处理实时分析的数据库，如 ClickHouse。

## 比较 {#comparison}

在本节中，我们将比较 ClickHouse 和 Snowflake 的主要特性。

### 相似点 {#similarities}

Snowflake 是一个基于云的数据仓库平台，提供一种可扩展和高效的解决方案，用于存储、处理和分析大量数据。与 ClickHouse 一样，Snowflake 不是建立在现有技术之上，而是依赖于其自己的 SQL 查询引擎和定制架构。

Snowflake 的架构被描述为共享存储（shared-disk）架构和无共享架构（shared-nothing architecture）的混合体。共享存储架构是指数据可以通过对象存储（如 S3）从所有计算节点访问。无共享架构指的是每个计算节点在本地存储整个数据集的一部分以响应查询。理论上，这提供了两种模型的最佳性能：共享磁盘架构的简单性和无共享架构的可扩展性。

该设计在根本上依赖于对象存储作为主要存储介质，这在并发访问下几乎无限扩展，同时提供高韧性和可扩展的吞吐量保证。

下面的图像来源于 [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)，展示了这种架构：

<Image img={snowflake_architecture} size="md" alt="Snowflake architecture" />

相反，作为一个开源和云托管的产品，ClickHouse 可以在共享磁盘和无共享架构中进行部署。后者通常适用于自管理的部署。尽管允许 CPU 和内存易于扩展，但无共享配置引入了经典的数据管理挑战以及数据复制的开销，特别是在成员变化期间。

因此，ClickHouse Cloud 采用了与 Snowflake 概念上类似的共享存储架构。数据在对象存储（单一副本）中仅存储一次，例如 S3 或 GCS，提供几乎无限的存储，并具备强大的冗余保证。每个节点可以访问这一单一数据副本以及其本地 SSD 用于缓存。节点可以进行扩展，以根据需要提供额外的 CPU 和内存资源。与 Snowflake 类似，S3 的可扩展性特性通过确保在集群中添加额外节点时不会影响当前节点的 I/O 吞吐量，解决了共享磁盘架构的经典限制（磁盘 I/O 和网络瓶颈）。

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud architecture" />

### 不同点 {#differences}

除了底层存储格式和查询引擎，这些架构在几个微妙的方面有所不同：

* Snowflake 中的计算资源通过 [仓库](https://docs.snowflake.com/en/user-guide/warehouses) 的概念提供。这些仓库由多个节点组成，每个节点具有固定大小。虽然 Snowflake 并未公布其仓库的具体架构，但 [通常理解](https://select.dev/posts/snowflake-warehouse-sizing) 为每个节点由 8 个 vCPU、16GiB 和 200GB 的本地存储（用于缓存）组成。节点的数量取决于 T 恤尺码，例如超小型有一个节点，小型有两个， 中型有四个，大型有八个，等等。这些仓库与数据是独立的，可以用于查询位于对象存储上的任何数据库。当处于空闲状态且未承受查询负载时，仓库会暂停 - 一旦收到查询则恢复。虽然存储成本始终反映在账单中，但仓库仅在活跃时收取费用。

* ClickHouse Cloud 采用类似的原则，使用带有本地缓存存储的节点。用户不是按 T 恤尺码进行部署，而是根据计算总量和可用 RAM 部署服务。这反过来在查询负载的基础上透明地进行自动扩展（在定义的限制内） - 通过增加（或减少）每个节点的资源进行垂直扩展，或通过增加/减少节点总数进行水平扩展。ClickHouse Cloud 节点目前具有 1:1 的 CPU 与内存比例，而 Snowflake 的比例为 1。虽然可以实现更松散的耦合，但服务目前与数据耦合，不像 Snowflake 的仓库那样。节点在空闲时也会暂停，并在受到查询时恢复。用户如有必要，也可以手动调整服务大小。

* ClickHouse Cloud 的查询缓存目前是特定于节点的，而 Snowflake 的查询缓存是以独立于仓库的服务层提供的。根据基准测试，ClickHouse Cloud 的节点缓存性能优于 Snowflake 的。

* Snowflake 和 ClickHouse Cloud 在扩展以增加查询并发性方面采取了不同的方法。Snowflake 通过一个称为 [多集群仓库](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses) 的功能来处理这个问题。该功能允许用户为仓库添加集群。虽然这不会改善查询延迟，但确实提供了额外的并行ization，并允许更高的查询并发性。ClickHouse 通过增加服务的内存和 CPU 进行垂直或水平扩展来实现这一点。我们在这篇博客中没有探讨这些服务在扩展到更高并发性方面的能力，而是集中于延迟，但承认这项工作应当进行，以便进行全面比较。然而，我们预计 ClickHouse 在任何并发测试中表现良好，而 Snowflake 在 [仓库默认情况下限制每个仓库的最大并发查询数为 8](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)。相比之下，ClickHouse Cloud 允许每个节点执行多达 1000 个查询。

* Snowflake 在数据集上切换计算大小的能力，加上仓库的快速恢复时间，使其在临时查询方面提供了出色的体验。对于数据仓库和数据湖用例，这提供了比其他系统更大的优势。

### 实时分析 {#real-time-analytics}

根据公开的 [基准](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-) 数据，ClickHouse 在以下领域的实时分析应用中优于 Snowflake：

* **查询延迟**：即使在对表应用聚类以优化性能时，Snowflake 查询的查询延迟也更高。在我们的测试中，Snowflake 需要超过两倍的计算资源才能在对 Snowflake 聚类键或 ClickHouse 主键应用过滤器的查询中达到等效的 ClickHouse 性能。虽然 Snowflake 的 [持久查询缓存](https://docs.snowflake.com/en/user-guide/querying-persisted-results) 缓解了部分延迟挑战，但在过滤标准更加多样化的情况下效果不佳。这一查询缓存的有效性还会受到基础数据变化的影响，当表发生变化时，缓存条目会失效。尽管在我们应用的基准测试中并非如此，但实际部署需要插入新的、最近的数据。请注意，ClickHouse 的查询缓存是特定于节点的，并且不是 [事务一致的](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)，因此对于实时分析 [更为合适](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)。用户还可以对其使用进行细粒度控制，可以在 [每个查询的基础上](https://operations/settings/settings#use_query_cache) 控制其使用、[精确大小](https://operations/settings/settings#query_cache_max_size_in_bytes)、是否 [缓存查询](https://operations/settings/settings#enable_writes_to_query_cache)（限制持续时间或需要的执行次数）以及是否仅 [被动使用](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)。

* **更低的成本**：Snowflake 仓库可以配置为在查询不活跃时暂停。一旦暂停，将不会产生费用。实际上，这一非活动检查 [仅能降低到 60 秒](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。仓库在收到查询后会自动恢复，通常在几秒钟内完成。由于 Snowflake 只在仓库使用时对资源收取费用，这一行为非常适合于经常闲置的工作负载，例如临时查询。

  然而，许多实时分析工作负载需要持续的实时数据摄取和频繁的查询，这并不受益于闲置（如面向客户的仪表板）。这意味着仓库通常必须保持完全活跃并产生费用。这消除了闲置的成本效益以及可能与 Snowflake 能够更快恢复响应状态相关的任何性能优势。这种活跃状态的要求，加上 ClickHouse Cloud 在活跃状态下每秒的更低成本，导致 ClickHouse Cloud 在这类工作负载中提供显著更低的总成本。

* **特征的可预测定价：** 在实时分析用例中，实现最高级别的性能所需的特征，例如物化视图和聚类（相当于 ClickHouse 的 ORDER BY），在 Snowflake 中会产生额外费用，要求不仅采用更高的等级，这导致每个信用的成本增加 1.5 倍，还有不可预测的后台费用。例如，物化视图会产生后台维护成本，聚类也是如此，这在使用之前是难以预测的。相比之下，这些特征在 ClickHouse Cloud 中没有额外成本，除了在插入时额外的 CPU 和内存使用，通常在插入工作负载较高的情况下才会显著。我们在基准测试中观察到，这些差异，加上更低的查询延迟和更高的压缩率，使得 ClickHouse 的成本显著降低。
